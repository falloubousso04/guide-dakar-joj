// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm.
import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const agendaEvents = pgTable(
  'agenda_events',
  {
    id: uuid('id').primaryKey(),
    title: varchar('title', { length: 150 }).notNull(),
    venue: varchar('venue', { length: 100 }).notNull(),
    district: varchar('district', { length: 100 }).notNull(),
    // Précision milliseconde = celle de Date en JavaScript.
    startsAt: timestamp('starts_at', { withTimezone: true, precision: 3 }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true, precision: 3 }).notNull(),
  },
  // L'agenda d'une journée filtre sur l'heure de début.
  (table) => [index('agenda_events_starts_at_idx').on(table.startsAt)],
);

export type AgendaEventRow = typeof agendaEvents.$inferSelect;
