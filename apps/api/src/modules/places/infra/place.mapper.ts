import { OLYMPIC_SITES, type OlympicSite } from '@joj/shared';
import { Place } from '../domain/place';
import type { PlaceRow } from './places.schema';

export function toDomain(row: PlaceRow): Place {
  const raw = row.travelMinutes as Record<string, unknown>;
  const travelMinutes = Object.fromEntries(
    OLYMPIC_SITES.map((site) => [site, Number(raw[site])]),
  ) as Record<OlympicSite, number>;
  return Place.restore({
    id: row.id,
    name: row.name,
    district: row.district,
    visitMinutes: row.visitMinutes,
    travelMinutes,
    location: null,
  });
}

export function toRow(place: Place): PlaceRow {
  return {
    id: place.id,
    name: place.name,
    district: place.district,
    visitMinutes: place.visitMinutes,
    travelMinutes: place.travelMinutes,
  };
}
