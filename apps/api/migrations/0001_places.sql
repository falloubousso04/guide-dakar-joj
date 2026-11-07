CREATE TABLE "places" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"district" varchar(100) NOT NULL,
	"visit_minutes" integer NOT NULL,
	"travel_minutes" jsonb NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "places_name_key" ON "places" USING btree ("name");