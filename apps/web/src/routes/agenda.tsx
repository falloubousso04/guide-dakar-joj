import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AgendaPage } from '@/features/agenda/components/agenda-page';
import { defaultAgendaDay, GAMES_DAYS } from '@/features/agenda/components/games-days';

export const Route = createFileRoute('/agenda')({
  // `?date=AAAA-MM-JJ` garde la journée choisie. Une date illisible ou hors des Jeux est ignorée :
  // la liste déroulante ne pourrait pas l'afficher, et l'API la refuserait. `date: undefined`
  // plutôt que `{}` : le router fusionne avec la recherche brute, qui garderait la valeur.
  validateSearch: (search: Record<string, unknown>): { date?: string | undefined } => {
    const date = search['date'];
    return { date: typeof date === 'string' && GAMES_DAYS.includes(date) ? date : undefined };
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
