import { Module } from '@nestjs/common';
import { Clock } from './application/clock';
import { ReachablePlaces } from './application/reachable-places';
import { FakeReachablePlaces } from './application/testing/fake-reachable-places';
import { AnswerChatMessage } from './application/use-cases/answer-chat-message';
import { ChatController } from './http/chat.controller';
import { claudeTouristAssistantProvider } from './infra/claude-tourist-assistant';

@Module({
  controllers: [ChatController],
  providers: [
    // TouristAssistant est relié à ClaudeTouristAssistant, avec la clé lue par AppConfig.
    claudeTouristAssistantProvider,
    // TODO(T02) : provisoire en attendant la fusion de T02. Relier ReachablePlaces à
    // FindReachablePlaces en important PlacesModule, qui l'exporte.
    { provide: ReachablePlaces, useClass: FakeReachablePlaces },
    { provide: Clock, useValue: { now: () => new Date() } satisfies Clock },
    AnswerChatMessage,
  ],
})
export class ChatModule {}
