import { type AgendaEventResponse, dayAgendaSchema } from '@joj/shared';
import { api } from '@/lib/api';

/** L'appel HTTP de l'agenda, réponse validée par le schéma partagé. */
export const agendaApi = {
  day: (date: string, signal?: AbortSignal) =>
    api.request<AgendaEventResponse[]>(`/agenda?date=${encodeURIComponent(date)}`, {
      schema: dayAgendaSchema,
      signal,
    }),
};
