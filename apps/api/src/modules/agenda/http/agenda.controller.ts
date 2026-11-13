import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { agendaEventSchema, type AgendaEventResponse, dayAgendaQuerySchema } from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { GetDayAgenda } from '../application/use-cases/get-day-agenda';
import type { AgendaEvent } from '../domain/agenda-event';

class DayAgendaQueryDto extends createZodDto(dayAgendaQuerySchema) {}
class AgendaEventDto extends createZodDto(agendaEventSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('agenda')
@Controller('agenda')
export class AgendaController {
  constructor(private readonly getDayAgenda: GetDayAgenda) {}

  @Get()
  @ZodSerializerDto([AgendaEventDto])
  async day(@Query() { date }: DayAgendaQueryDto): Promise<AgendaEventResponse[]> {
    return (await this.getDayAgenda.execute(date)).map(toResponse);
  }
}

function toResponse(event: AgendaEvent): AgendaEventResponse {
  return {
    id: event.id,
    title: event.title,
    venue: event.venue,
    district: event.district,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
  };
}
