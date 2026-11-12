import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const PLACES_NAME_KEY = 'places_name_key';

export const places = pgTable(
  'places',
  {
    id: uuid('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    district: varchar('district', { length: 100 }).notNull(),
    visitMinutes: integer('visit_minutes').notNull(),
    travelMinutes: jsonb('travel_minutes').notNull(),
    // Les deux ou aucune : un lieu sans emplacement connu n'a pas de lien vers la carte.
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
  },
  (table) => [uniqueIndex(PLACES_NAME_KEY).on(table.name)],
);

export type PlaceRow = typeof places.$inferSelect;
