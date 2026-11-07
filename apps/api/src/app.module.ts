import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ChatModule } from './modules/chat/chat.module';
import { DisciplinesModule } from './modules/disciplines/disciplines.module';
import { PlacesModule } from './modules/places/places.module';

@Module({
  imports: [CoreModule, DisciplinesModule, PlacesModule, ChatModule],
})
export class AppModule {}
