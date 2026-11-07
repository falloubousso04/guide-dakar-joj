import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { type ChatMessage, OLYMPIC_SITES } from '@joj/shared';
import { z } from 'zod';
import {
  type ReplyInput,
  TouristAssistant,
  type VisitorRequest,
} from '../application/tourist-assistant';
import { AppConfig } from '../../../core/config/app-config';
import { assistantUnavailable, ChatError } from '../domain/chat.errors';

export const CLAUDE_MODEL = 'claude-opus-5-5';
/** Si Claude décline une demande, l'API la rejoue sur un autre modèle, dans le même appel. */
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
const MAX_TOKENS = 4000;
/** Un chatbot doit répondre vite : un délai dépassé devient ASSISTANT_UNAVAILABLE. */
export const CLAUDE_TIMEOUT_MS = 20_000;

/** Ce que Claude renvoie pour `understand` : des heures « HH:MM », pas des dates. */
const understoodSchema = z.object({
  site: z.enum(OLYMPIC_SITES).nullable(),
  eventTime: z.string().nullable(),
  now: z.string().nullable(),
});

const UNDERSTAND_PROMPT = `Tu lis une conversation entre un supporter des Jeux Olympiques de la Jeunesse Dakar 2026 et le chatbot du guide de Dakar.
Extrais, en tenant compte de toute la conversation :
- site : le site olympique où se trouve le supporter, parmi "dakar", "diamniadio" et "saly" ; null s'il ne l'a pas dit ou s'il cite un autre lieu.
- eventTime : l'heure de sa prochaine épreuve, au format HH:MM sur 24 heures ; null s'il ne l'a pas dite.
- now : l'heure qu'il est d'après le supporter, au format HH:MM ; null s'il ne l'a pas dite.
N'invente rien : une information absente vaut null.`;

const REPLY_PROMPT = `Tu es le chatbot du guide de Dakar pendant les Jeux Olympiques de la Jeunesse Dakar 2026. Tu parles à un supporter étranger qui ne connaît pas la ville.
Tu reçois en JSON ce que l'application a compris de sa demande, la liste des lieux qu'elle a retenus et ce qui manque encore.
Règles :
- Réponds en français, chaleureusement, en trois phrases au plus, sans liste ni mise en forme : l'écran affiche déjà une carte par lieu.
- Ne cite que des lieux de la liste fournie ; n'en propose jamais d'autre, même connu.
- Si "missing" contient "site", demande-lui où il se trouve : Dakar, Diamniadio ou Saly. Si "missing" contient "eventTime", demande-lui l'heure de sa prochaine épreuve.
- Si la liste est vide et que rien ne manque, dis-lui qu'aucun lieu ne tient avant son épreuve.
- Sinon, mets en avant un ou deux lieux et rappelle-lui l'heure à laquelle il sera de retour.`;

/**
 * Implémentation du port avec le SDK Claude. Sans clé (`client` null), chaque appel lève
 * ASSISTANT_UNAVAILABLE : l'API démarre et les tests tournent sans clé ni réseau.
 */
export class ClaudeTouristAssistant extends TouristAssistant {
  constructor(
    private readonly client: Anthropic | null,
    /** Le jour courant, pour transformer « 17:00 » en date ; remplacé dans les tests. */
    private readonly today: () => Date = () => new Date(),
  ) {
    super();
  }

  async understand(messages: ChatMessage[]): Promise<VisitorRequest> {
    const client = this.requireClient();
    const response = await this.call(() =>
      client.beta.messages.parse({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        betas: [FALLBACK_BETA],
        fallbacks: 'default',
        output_config: { effort: 'low', format: betaZodOutputFormat(understoodSchema) },
        system: UNDERSTAND_PROMPT,
        messages: messages.map(({ role, content }) => ({ role, content })),
      }),
    );
    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      throw assistantUnavailable();
    }
    const { site, eventTime, now } = response.parsed_output;
    const day = this.today();
    return { site, eventTime: timeOfDay(eventTime, day), now: timeOfDay(now, day) };
  }

  async reply(input: ReplyInput): Promise<string> {
    const client = this.requireClient();
    const response = await this.call(() =>
      client.beta.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        betas: [FALLBACK_BETA],
        fallbacks: 'default',
        output_config: { effort: 'low' },
        system: REPLY_PROMPT,
        messages: [{ role: 'user', content: JSON.stringify(toReplyPayload(input)) }],
      }),
    );
    const text = response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('')
      .trim();
    if (response.stop_reason === 'refusal' || text === '') {
      throw assistantUnavailable();
    }
    return text;
  }

  private requireClient(): Anthropic {
    if (!this.client) throw assistantUnavailable();
    return this.client;
  }

  /** Toute erreur du SDK (réseau, délai, 429, 5xx…) devient ASSISTANT_UNAVAILABLE. */
  private async call<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (error instanceof ChatError) throw error;
      if (error instanceof Anthropic.AnthropicError) throw assistantUnavailable();
      throw error;
    }
  }
}

/** Crée le client du SDK à partir de la clé ; sans clé, null. */
export function createClaudeClient(apiKey: string | undefined): Anthropic | null {
  return apiKey ? new Anthropic({ apiKey, timeout: CLAUDE_TIMEOUT_MS, maxRetries: 1 }) : null;
}

/** « 17:00 » → la date du jour à 17 h, heure de Dakar (UTC+0). Une valeur illisible vaut null. */
function timeOfDay(value: string | null, day: Date): Date | null {
  const match = value?.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      Number(match[1]),
      Number(match[2]),
    ),
  );
}

function toReplyPayload({ request, places, missing }: ReplyInput) {
  return {
    site: request.site,
    eventTime: request.eventTime?.toISOString() ?? null,
    missing,
    places: places.map(({ name, district, visitMinutes, travelMinutes, backAt }) => ({
      name,
      district,
      visitMinutes,
      travelMinutes,
      backAt,
    })),
  };
}

/**
 * Le provider à déclarer dans ChatModule : relie le port TouristAssistant à Claude,
 * avec la clé lue par AppConfig.
 */
export const claudeTouristAssistantProvider = {
  provide: TouristAssistant,
  inject: [AppConfig],
  useFactory: (config: AppConfig): TouristAssistant =>
    new ClaudeTouristAssistant(createClaudeClient(config.get('ANTHROPIC_API_KEY'))),
};
