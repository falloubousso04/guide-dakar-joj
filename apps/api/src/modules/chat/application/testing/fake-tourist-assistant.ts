import type { ChatMessage } from '@joj/shared';
import { assistantUnavailable } from '../../domain/chat.errors';
import { type ReplyInput, TouristAssistant, type VisitorRequest } from '../tourist-assistant';

/** Faux de l'IA pour les tests : aucun appel à Claude. Le test règle ce qu'il renvoie. */
export class FakeTouristAssistant extends TouristAssistant {
  /** Ce que `understand` renvoie. */
  request: VisitorRequest = { site: null, eventTime: null, now: null };
  /** Ce que `reply` renvoie. */
  replyText = 'Voici ce que tu peux faire.';
  /** Vrai : les deux méthodes lèvent ASSISTANT_UNAVAILABLE. */
  down = false;
  /** Les conversations reçues par `understand`, dans l'ordre. */
  readonly understood: ChatMessage[][] = [];
  /** Les entrées reçues par `reply`, dans l'ordre. */
  readonly replies: ReplyInput[] = [];

  understand(messages: ChatMessage[]): Promise<VisitorRequest> {
    if (this.down) return Promise.reject(assistantUnavailable());
    this.understood.push(messages);
    return Promise.resolve(this.request);
  }

  reply(input: ReplyInput): Promise<string> {
    if (this.down) return Promise.reject(assistantUnavailable());
    this.replies.push(input);
    return Promise.resolve(this.replyText);
  }
}
