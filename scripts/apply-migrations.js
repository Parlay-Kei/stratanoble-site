import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This script applies database migrations to Supabase
// It reads the SQL files and provides them for manual application

async function main() {
  console.log('📊 Phase 3 CRM Database Migration Script');
  console.log('==========================================\n');

  const migrationsDir = path.join(__dirname, '..', 'sql', 'migrations');
  const migrations = [
    'create_leads_table.sql',
    'create_email_sequences_table.sql'
  ];

  console.log('🔍 Found migrations to apply:');
  migrations.forEach((migration, index) => {
    console.log(`${index + 1}. ${migration}`);
  });

  console.log('\n📝 Migration SQL Content:');
  console.log('=========================\n');

  for (const migration of migrations) {
    const migrationPath = path.join(migrationsDir, migration);
    
    if (fs.existsSync(migrationPath)) {
      console.log(`\n--- ${migration} ---`);
      const sqlContent = fs.readFileSync(migrationPath, 'utf8');
      console.log(sqlContent);
      console.log(`--- End of ${migration} ---\n`);
    } else {
      console.error(`❌ Migration file not found: ${migration}`);
    }
  }

  console.log('📋 Manual Application Instructions:');
  console.log('===================================');
  console.log('1. Copy the SQL content above');
  console.log('2. Open Supabase Dashboard -> SQL Editor');
  console.log('3. Paste and execute each migration in order');
  console.log('4. Verify tables are created successfully');
  console.log('\nAlternatively, run: npx supabase db push (if configured)');
  
  console.log('\n✅ Migration preparation complete!');
}

main().catch(console.error);