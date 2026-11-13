import type { AgendaEventResponse } from '@joj/shared';
import { ClockIcon, PinIcon } from '@/components/icons';
import { formatClock } from '@/lib/format';

export function AgendaEventCard({ event }: { event: AgendaEventResponse }) {
  return (
    <li
      aria-label={event.title}
      className="flex gap-4 rounded-2xl border border-black/10 bg-background p-4 shadow-md"
    >
      <p className="flex min-w-20 flex-col items-start gap-0.5 font-display text-xl leading-none font-extrabold text-joj-green-deep">
        <ClockIcon className="size-4 text-olympic-blue" />
        <time dateTime={event.startsAt}>{formatClock(event.startsAt)}</time>
        <span className="text-sm font-semibold text-muted-foreground">
          {/* L'heure de fin peut tomber le lendemain : c'est l'heure de début qui fixe la journée. */}
          à <time dateTime={event.endsAt}>{formatClock(event.endsAt)}</time>
        </span>
      </p>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl leading-tight font-extrabold uppercase">
          {event.title}
        </h2>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <PinIcon className="size-4 shrink-0" />
          {event.venue} · {event.district}
        </p>
      </div>
    </li>
  );
}
