import type { Location } from '@joj/shared';

/** Sans emplacement connu, on n'affiche rien plutôt qu'un lien qui ne mène nulle part. */
export function PlaceMapLink({ location }: { location: Location | null }) {
  if (location === null) return null;
  const href = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  return (
    <a
      href={href}
      // Nouvel onglet : la conversation reste ouverte.
      target="_blank"
      rel="noopener noreferrer"
      className="self-start text-sm font-bold underline underline-offset-4 hover:text-olympic-blue focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      Voir sur la carte
      <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
    </a>
  );
}
