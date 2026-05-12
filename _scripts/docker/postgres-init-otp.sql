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
