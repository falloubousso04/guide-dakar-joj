import { queryOptions, useQuery } from '@tanstack/react-query';
import { agendaApi } from './agenda.api';

/** Clés du cache TanStack Query pour cette fonctionnalité : une entrée par journée. */
export const agendaKeys = {
  day: (date: string) => ['agenda', date] as const,
};

export const dayAgendaQueryOptions = (date: string) =>
  queryOptions({
    queryKey: agendaKeys.day(date),
    queryFn: ({ signal }) => agendaApi.day(date, signal),
  });

export const useDayAgenda = (date: string) => useQuery(dayAgendaQueryOptions(date));
