import type { PlaceSuggestion } from '@joj/shared';
import { cn } from '@/lib/utils';
import { formatClock, formatDuration } from './format';

// Une bande de couleur olympique par carte, dans l'ordre des anneaux : bleu, jaune, noir, vert, rouge.
const BANDS = [
  'border-l-olympic-blue',
  'border-l-olympic-yellow',
  'border-l-olympic-black',
  'border-l-olympic-green',
  'border-l-olympic-red',
];

export function PlaceCard({ place, index }: { place: PlaceSuggestion; index: number }) {
  return (
    <li
      className={cn(
        'flex corner-cut flex-col gap-3 border-l-[6px] bg-muted p-4 pr-6',
        BANDS[index % BANDS.length],
      )}
    >
      <div className="flex flex-col gap-1">
        {/* h2 : sous le titre de la page, l'accueil et son h2 ayant disparu. */}
        <h2 className="font-display text-xl leading-tight font-bold uppercase">{place.name}</h2>
        <p className="text-sm text-muted-foreground">{place.district}</p>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Visite</dt>
          <dd className="font-semibold">{formatDuration(place.visitMinutes)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Trajet</dt>
          <dd className="font-semibold">{formatDuration(place.travelMinutes)}</dd>
        </div>
      </dl>
      {/* Vert sur fond blanc n'est pas assez contrasté pour du texte : le vert encadre, le texte reste noir. */}
      <p className="inline-flex items-center gap-2 self-start border-2 border-olympic-green bg-olympic-green/10 px-3 py-1 text-sm font-bold">
        <span aria-hidden="true" className="size-2 rounded-full bg-olympic-green" />
        Retour au site à <time dateTime={place.backAt}>{formatClock(place.backAt)}</time>
      </p>
    </li>
  );
}
