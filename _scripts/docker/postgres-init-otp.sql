-- Creates the `otp` table after the test dump has been restored.
--
-- Why this lives here rather than in the dump:
--   The OTP table is needed by integration tests in dev/test, but the
--   feature migration (1778582320185-add-otp-table.ts) is gated to
--   prod/preprod. Regenerating the test dump to add `otp` ends up
--   capturing PostGIS-internal tables (tiger.*, topology.*) that break
--   `pg_restore` when it runs as the non-superuser `domifa_user`.
--
-- This script runs as a postgres docker init step (mounted under
-- /docker-entrypoint-initdb.d/), so it executes after the dump restore
-- and is idempotent (CREATE ... IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS "otp" (
  "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "version" integer NOT NULL DEFAULT 1,
  "email" text NOT NULL,
  "code" text NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "attempts" integer NOT NULL DEFAULT 0,
  "used" boolean NOT NULL DEFAULT false,
  "purpose" text,
  CONSTRAINT "PK_otp" PRIMARY KEY ("uuid")
);

CREATE INDEX IF NOT EXISTS "IDX_otp_email_used_expires"
  ON "otp" ("email", "used", "expiresAt");
