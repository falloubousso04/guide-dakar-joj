import type { Location, OlympicSite } from '@joj/shared';
import { PlaceError } from './place.errors';

export interface PlaceProps {
  id: string;
  name: string;
  district: string;
  visitMinutes: number;
  travelMinutes: Record<OlympicSite, number>;
  location: Location | null;
}

export class Place {
  private constructor(private props: PlaceProps) {}

  static create(props: PlaceProps): Place {
    const name = props.name.trim();
    if (name.length === 0) {
      throw new PlaceError('PLACE_NAME_REQUIRED', 'A place needs a name');
    }
    if (props.visitMinutes < 1) {
      throw new PlaceError(
        'PLACE_VISIT_MINUTES_INVALID',
        'Visit duration must be at least 1 minute',
      );
    }
    return new Place({ ...props, name });
  }

  static restore(props: PlaceProps): Place {
    return new Place({ ...props });
  }

  /** now + trajet aller + visite + trajet retour */
  returnTime(site: OlympicSite, now: Date): Date {
    const totalMs = (this.props.travelMinutes[site] * 2 + this.props.visitMinutes) * 60 * 1000;
    return new Date(now.getTime() + totalMs);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get district(): string {
    return this.props.district;
  }

  get visitMinutes(): number {
    return this.props.visitMinutes;
  }

  get travelMinutes(): Record<OlympicSite, number> {
    return this.props.travelMinutes;
  }

  get location(): Location | null {
    return this.props.location;
  }
}
