-- Add BUSINESS_SYSTEMS to IntakeSource enum for Business Systems Intake form
-- Migration: 0031_add_business_systems_intake_source.sql

ALTER TYPE "IntakeSource" ADD VALUE IF NOT EXISTS 'BUSINESS_SYSTEMS';
