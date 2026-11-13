import type { PlaceSuggestion } from '@joj/shared';
import { CheckIcon, ClockIcon, PinIcon, RouteIcon } from '@/components/icons';
import { formatClock, formatDuration } from './format';
import { PlaceMapLink } from './place-map-link';

// Une bande de couleur olympique par carte, dans l'ordre des anneaux : bleu, jaune, noir, vert, rouge.
const BANDS = [
  'bg-olympic-blue',
  'bg-olympic-yellow',
  'bg-olympic-black',
  'bg-olympic-green',
  'bg-olympic-red',
];

export function PlaceCard({ place, index }: { place: PlaceSuggestion; index: number }) {
  return (
    <li
      // Les cartes apparaissent l'une après l'autre.
      style={{ animationDelay: `${index * 90}ms` }}
      className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-background shadow-md transition hover:-translate-y-0.5 hover:shadow-lg motion-safe:animate-fade-up"
    >
      <span aria-hidden="true" className={`h-1.5 ${BANDS[index % BANDS.length]}`} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          {/* h2 : sous le titre de la page, l'accueil et son h2 ayant disparu. */}
          <h2 className="font-display text-2xl leading-tight font-extrabold uppercase">
            {place.name}
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <PinIcon className="size-4" />
            {place.district}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-muted px-3 py-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClockIcon className="size-4 shrink-0 text-olympic-blue" />
              Visite
            </dt>
            <dd className="font-semibold">{formatDuration(place.visitMinutes)}</dd>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RouteIcon className="size-4 shrink-0 text-olympic-red" />
              Trajet
            </dt>
            <dd className="font-semibold">{formatDuration(place.travelMinutes)}</dd>
          </div>
        </dl>
        {/* Texte blanc sur le vert foncé des JOJ : contraste suffisant (AA). */}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="inline-flex items-center gap-2 self-start rounded-full bg-joj-green px-3 py-1.5 text-sm font-bold text-white">
            <CheckIcon className="size-4" />
            Retour au site à <time dateTime={place.backAt}>{formatClock(place.backAt)}</time>
          </p>
          <PlaceMapLink location={place.location} />
        </div>
      </div>
    </li>
  );
}
