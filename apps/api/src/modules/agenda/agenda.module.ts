import { Module } from '@nestjs/common';
import { AgendaEventRepository } from './application/agenda-event.repository';
import { GetDayAgenda } from './application/use-cases/get-day-agenda';
import { AgendaController } from './http/agenda.controller';
import { DrizzleAgendaEventRepository } from './infra/drizzle-agenda-event.repository';

@Module({
  controllers: [AgendaController],
  providers: [
    // Le port (classe abstraite) est relié ici à son implémentation Drizzle.
    { provide: AgendaEventRepository, useClass: DrizzleAgendaEventRepository },
    GetDayAgenda,
  ],
})
export class AgendaModule {}
