export interface AgendaEventProps {
  id: string;
  title: string;
  /** Le lieu de l'animation. */
  venue: string;
  /** Le quartier du lieu. */
  district: string;
  startsAt: Date;
  endsAt: Date;
}

/** Une animation des Jeux (concert, fan zone…). Sa journée est celle où elle commence. */
export class AgendaEvent {
  private constructor(private readonly props: AgendaEventProps) {}

  static create(props: AgendaEventProps): AgendaEvent {
    return new AgendaEvent({ ...props });
  }

  static restore(props: AgendaEventProps): AgendaEvent {
    return new AgendaEvent({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get venue(): string {
    return this.props.venue;
  }

  get district(): string {
    return this.props.district;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get endsAt(): Date {
    return this.props.endsAt;
  }
}

/** L'ordre de l'agenda : heure de début, puis titre sans tenir compte de la casse, puis id. */
export function compareAgendaEvents(a: AgendaEvent, b: AgendaEvent): number {
  return (
    a.startsAt.getTime() - b.startsAt.getTime() ||
    // `accent` : « Défilé » et « défilé » sont égaux, mais pas « Défilé » et « Defile ».
    a.title.localeCompare(b.title, 'fr', { sensitivity: 'accent' }) ||
    // Dernier recours : l'ordre reste le même d'un affichage à l'autre.
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}
