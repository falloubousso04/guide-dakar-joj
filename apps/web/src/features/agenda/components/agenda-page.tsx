import { NativeSelect } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { useDayAgenda } from '../api/agenda.queries';
import { AgendaEventCard } from './agenda-event-card';
import { agendaErrorMessage } from './error-message';
import { formatGamesDay, GAMES_DAYS } from './games-days';

interface AgendaPageProps {
  /** La journée affichée, au format AAAA-MM-JJ. */
  date: string;
  onDateChange: (date: string) => void;
}

export function AgendaPage({ date, onDateChange }: AgendaPageProps) {
  const agenda = useDayAgenda(date);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold uppercase">Agenda de la journée</h1>
      <div className="flex flex-col gap-2 sm:max-w-xs">
        <Label htmlFor="agenda-day">Journée</Label>
        {/* Le choix reste utilisable pendant le chargement et après une erreur (AS7). */}
        <NativeSelect
          id="agenda-day"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        >
          {GAMES_DAYS.map((day) => (
            <option key={day} value={day}>
              {formatGamesDay(day)}
            </option>
          ))}
        </NativeSelect>
      </div>
      {agenda.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {agenda.isError && (
        <p role="alert" className="text-destructive">
          {agendaErrorMessage(agenda.error)}
        </p>
      )}
      {agenda.isSuccess && agenda.data.length === 0 && (
        <p className="text-muted-foreground">Aucune animation n’est prévue ce jour-là.</p>
      )}
      {agenda.isSuccess && agenda.data.length > 0 && (
        <ul aria-label="Animations de la journée" className="flex flex-col gap-3">
          {agenda.data.map((event) => (
            <AgendaEventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </div>
  );
}
