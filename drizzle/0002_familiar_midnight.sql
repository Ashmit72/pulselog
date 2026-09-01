CREATE TYPE "public"."workspace_use_case" AS ENUM('personal', 'team', 'company');--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "slug" varchar(63);--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "use_case" "workspace_use_case" DEFAULT 'team' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
UPDATE "workspace"
SET "slug" = left(
	coalesce(
		nullif(trim(both '-' from regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g')), ''),
		'workspace'
	),
	54
) || '-' || left("id"::text, 8)
WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "workspace" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_owner_slug_unique" ON "workspace" USING btree ("owner_id","slug");--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_name_length_check" CHECK (char_length("workspace"."name") between 2 and 60);--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_slug_format_check" CHECK ("workspace"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
