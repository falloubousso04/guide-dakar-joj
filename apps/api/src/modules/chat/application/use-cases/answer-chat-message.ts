import { Injectable } from '@nestjs/common';
import type { ChatMessage, ChatResponse, MissingInfo, PlaceSuggestion } from '@joj/shared';
import { eventTimePassed } from '../../domain/chat.errors';
import { Clock } from '../clock';
import { ReachablePlaces } from '../reachable-places';
import { TouristAssistant } from '../tourist-assistant';

/** Répond à un message : l'IA comprend la conversation, la règle de temps choisit les lieux, l'IA rédige. */
@Injectable()
export class AnswerChatMessage {
  constructor(
    private readonly assistant: TouristAssistant,
    private readonly reachablePlaces: ReachablePlaces,
    private readonly clock: Clock,
  ) {}

  async execute(messages: ChatMessage[]): Promise<ChatResponse> {
    // Toute la conversation : une réponse comme « 17 h » complète ce qui a été dit plus tôt.
    const request = await this.assistant.understand(messages);

    const missing: MissingInfo[] = [];
    if (!request.site) missing.push('site');
    if (!request.eventTime) missing.push('eventTime');

    let places: PlaceSuggestion[] = [];
    if (request.site && request.eventTime) {
      // Sans heure donnée par le supporter, son temps libre commence à l'envoi du message.
      const now = request.now ?? this.clock.now();
      // L'épreuve est le jour même : une heure déjà passée n'est pas reportée au lendemain.
      if (request.eventTime < now) throw eventTimePassed(request.eventTime, now);
      places = await this.reachablePlaces.find({
        site: request.site,
        now,
        eventTime: request.eventTime,
      });
    }

    const reply = await this.assistant.reply({ request, places, missing });
    return { reply, places, missing };
  }
}
