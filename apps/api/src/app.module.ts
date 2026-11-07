import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ChatModule } from './modules/chat/chat.module';
import { DisciplinesModule } from './modules/disciplines/disciplines.module';

// TODO(T02) : ajouter PlacesModule à la fusion de T02.
@Module({
  imports: [CoreModule, DisciplinesModule, ChatModule],
})
export class AppModule {}
