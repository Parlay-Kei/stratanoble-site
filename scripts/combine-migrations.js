#!/usr/bin/env node

/**
 * Combine all migrations into a single SQL file for testing
 */

import fs from 'fs/promises'
import path from 'path'

const MIGRATIONS_DIR = 'supabase/migrations'
const OUTPUT_FILE = 'database/combined_migrations.sql'

async function combineMigrations() {
  console.log('🔗 Combining migrations into single SQL file...\n')

  try {
    // Read all migration files
    const files = await fs.readdir(MIGRATIONS_DIR)
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log(`Found ${migrationFiles.length} migration files:\n`)

    let combinedSQL = `-- Combined migrations file
-- Generated on: ${new Date().toISOString()}
-- DO NOT EDIT: This file is auto-generated from individual migration files

`

    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file)
      const content = await fs.readFile(filePath, 'utf8')
      
      console.log(`📄 Adding ${file}`)
      
      combinedSQL += `-- ============================================================================
-- Migration: ${file}
-- ============================================================================

${content}

`
    }

    // Write combined file
    await fs.writeFile(OUTPUT_FILE, combinedSQL)
    
    console.log(`\n✅ Combined migrations written to: ${OUTPUT_FILE}`)
    console.log(`📊 Total size: ${combinedSQL.length} bytes`)

  } catch (error) {
    console.error('❌ Error combining migrations:', error.message)
    process.exit(1)
  }
}

combineMigrations().catch(console.error)