import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import { AgendaPage } from '@/features/agenda/components/agenda-page';
import { defaultAgendaDay } from '@/features/agenda/components/games-days';

const dateSchema = z.iso.date();

export const Route = createFileRoute('/agenda')({
  // `?date=AAAA-MM-JJ` garde la journée choisie ; une date illisible est ignorée.
  validateSearch: (search: Record<string, unknown>): { date?: string } => {
    const parsed = dateSchema.safeParse(search['date']);
    return parsed.success ? { date: parsed.data } : {};
  },
  component: AgendaRoute,
});

function AgendaRoute() {
  const { date } = Route.useSearch();
  const navigate = Route.useNavigate();
  // Lu une fois, au montage : la journée par défaut ne change pas pendant la consultation.
  const [today] = useState(() => defaultAgendaDay(new Date()));
  return (
    <AgendaPage date={date ?? today} onDateChange={(day) => navigate({ search: { date: day } })} />
  );
}
