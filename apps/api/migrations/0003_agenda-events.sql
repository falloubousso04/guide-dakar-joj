CREATE TABLE "agenda_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(150) NOT NULL,
	"venue" varchar(100) NOT NULL,
	"district" varchar(100) NOT NULL,
	"starts_at" timestamp (3) with time zone NOT NULL,
	"ends_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "agenda_events_starts_at_idx" ON "agenda_events" USING btree ("starts_at");