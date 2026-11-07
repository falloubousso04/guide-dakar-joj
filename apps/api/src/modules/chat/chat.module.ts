import { Module } from '@nestjs/common';
import { Clock } from './application/clock';
import { AnswerChatMessage } from './application/use-cases/answer-chat-message';
import { ChatController } from './http/chat.controller';
import { claudeTouristAssistantProvider } from './infra/claude-tourist-assistant';
import { PlacesModule } from '../places/places.module';

@Module({
  // PlacesModule fournit ReachablePlaces, implémenté par FindReachablePlaces.
  imports: [PlacesModule],
  controllers: [ChatController],
  providers: [
    // TouristAssistant est relié à ClaudeTouristAssistant, avec la clé lue par AppConfig.
    claudeTouristAssistantProvider,
    { provide: Clock, useValue: { now: () => new Date() } satisfies Clock },
    AnswerChatMessage,
  ],
})
export class ChatModule {}
