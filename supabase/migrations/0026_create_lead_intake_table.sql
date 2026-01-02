-- Create LeadIntake table for intake form submissions
-- This table stores submissions from lead capture forms (Lead Leak Check, Lead Rescue, Phase 3, Resource Download)
-- Migration: 0026_create_lead_intake_table.sql
-- Created: 2026-01-02

-- Create enum types
DO $$ BEGIN
    CREATE TYPE "IntakeSource" AS ENUM ('LEAD_RESCUE', 'PHASE_3', 'LEAD_LEAK_CHECK', 'RESOURCE_DOWNLOAD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "IntakeStatus" AS ENUM ('NEW', 'REVIEWED', 'CONVERTED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create LeadIntake table
CREATE TABLE IF NOT EXISTS "LeadIntake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" "IntakeSource" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "IntakeStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "idempotencyKey" TEXT UNIQUE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "LeadIntake_email_idx" ON "LeadIntake"("email");
CREATE INDEX IF NOT EXISTS "LeadIntake_source_idx" ON "LeadIntake"("source");
CREATE INDEX IF NOT EXISTS "LeadIntake_status_idx" ON "LeadIntake"("status");
CREATE INDEX IF NOT EXISTS "LeadIntake_createdAt_idx" ON "LeadIntake"("createdAt");

-- Add comment
COMMENT ON TABLE "LeadIntake" IS 'Stores intake form submissions from lead capture forms. Used for tracking and processing leads from various sources.';
