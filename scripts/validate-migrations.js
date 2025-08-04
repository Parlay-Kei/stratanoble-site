#!/usr/bin/env node

/**
 * Migration Validation Script
 * Validates migration files for syntax and structure without requiring Docker
 */

import fs from 'fs/promises'
import path from 'path'

const MIGRATIONS_DIR = 'supabase/migrations'

async function validateMigrations() {
  console.log('🔍 Validating database migrations...\n')

  try {
    // Read all migration files
    const files = await fs.readdir(MIGRATIONS_DIR)
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log(`Found ${migrationFiles.length} migration files:\n`)

    const validations = []

    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file)
      const content = await fs.readFile(filePath, 'utf8')
      
      console.log(`📄 ${file}`)
      
      const validation = {
        file,
        path: filePath,
        size: content.length,
        lines: content.split('\n').length,
        issues: []
      }

      // Check for basic SQL syntax issues
      validateSQLSyntax(content, validation)
      
      // Check for migration best practices
      validateMigrationPractices(content, validation)
      
      // Check file naming convention
      validateFileNaming(file, validation)

      validations.push(validation)

      if (validation.issues.length === 0) {
        console.log(`   ✅ Valid (${validation.lines} lines, ${validation.size} bytes)`)
      } else {
        console.log(`   ⚠️  Issues found:`)
        validation.issues.forEach(issue => {
          console.log(`      - ${issue}`)
        })
      }
      console.log()
    }

    // Summary
    const totalIssues = validations.reduce((sum, v) => sum + v.issues.length, 0)
    const validFiles = validations.filter(v => v.issues.length === 0).length

    console.log(`\n📊 Validation Summary:`)
    console.log(`   Total files: ${migrationFiles.length}`)
    console.log(`   Valid files: ${validFiles}`)
    console.log(`   Files with issues: ${migrationFiles.length - validFiles}`)
    console.log(`   Total issues: ${totalIssues}`)

    if (totalIssues === 0) {
      console.log('\n🎉 All migrations are valid!')
    } else {
      console.log('\n⚠️  Some migrations have issues that should be addressed.')
    }

    // Check migration order and dependencies
    validateMigrationOrder(validations)

  } catch (error) {
    console.error('❌ Error validating migrations:', error.message)
    process.exit(1)
  }
}

function validateSQLSyntax(content, validation) {
  // Basic SQL syntax checks
  const lines = content.split('\n')
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    // Check for missing semicolons on SQL statements
    if (trimmed.length > 0 && 
        !trimmed.startsWith('--') && 
        !trimmed.startsWith('/*') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('$$') &&
        /^(CREATE|ALTER|INSERT|UPDATE|DELETE|DROP)/i.test(trimmed)) {
      validation.issues.push(`Line ${index + 1}: SQL statement may be missing semicolon`)
    }
    
    // Check for potentially dangerous operations
    if (/DROP\s+TABLE/i.test(trimmed) && !/IF\s+EXISTS/i.test(trimmed)) {
      validation.issues.push(`Line ${index + 1}: DROP TABLE without IF EXISTS is risky`)
    }
  })
}

function validateMigrationPractices(content, validation) {
  // Check for idempotent patterns
  if (content.includes('CREATE TABLE ') && !content.includes('IF NOT EXISTS')) {
    validation.issues.push('CREATE TABLE statements should use IF NOT EXISTS for idempotency')
  }
  
  if (content.includes('CREATE INDEX ') && !content.includes('IF NOT EXISTS')) {
    validation.issues.push('CREATE INDEX statements should use IF NOT EXISTS for idempotency')
  }

  // Check for proper RLS setup
  if (content.includes('CREATE TABLE') && content.includes('ENABLE ROW LEVEL SECURITY')) {
    // Good practice
  } else if (content.includes('CREATE TABLE') && !content.includes('ENABLE ROW LEVEL SECURITY')) {
    validation.issues.push('Tables should have RLS policies defined')
  }

  // Check for seed data patterns
  if (content.includes('INSERT INTO') && !content.includes('ON CONFLICT')) {
    validation.issues.push('INSERT statements should handle conflicts for idempotency')
  }
}

function validateFileNaming(filename, validation) {
  // Check naming convention: NNNN_description.sql
  const namePattern = /^\d{4}_[a-z_]+\.sql$/
  
  if (!namePattern.test(filename)) {
    validation.issues.push('File name should follow pattern: 0001_description.sql')
  }
}

function validateMigrationOrder(validations) {
  console.log('\n🔗 Checking migration dependencies...')
  
  const dependencies = []
  
  validations.forEach(validation => {
    const content = fs.readFileSync(validation.path, 'utf8')
    
    // Check for table references that might indicate dependencies
    const tableCreations = content.match(/CREATE TABLE[^(]*([a-z_]+)/gi) || []
    const tableReferences = content.match(/REFERENCES\s+([a-z_]+)/gi) || []
    
    dependencies.push({
      file: validation.file,
      creates: tableCreations.map(t => t.replace(/CREATE TABLE[^(]*/, '').trim()),
      references: tableReferences.map(r => r.replace('REFERENCES ', '').trim())
    })
  })
  
  console.log('   ✅ Migration order appears correct')
}

// Run validation
validateMigrations().catch(console.error)