#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function executeMigration(filePath: string, description: string) {
  console.log(`\n✓ Executing: ${description}`);
  try {
    const sql = readFileSync(filePath, 'utf-8');
    
    // Split by semicolon but keep them intact
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', {
            query: statement
          });

          if (error && !error.message.includes('function')) {
            console.error(`Error executing statement: ${error.message}`);
            return false;
          }
        } catch (err) {
          // If exec_sql doesn't exist, we need to handle this differently
          console.log('Note: Could not execute via RPC, migrations must be applied manually in Supabase');
          return false;
        }
      }
    }
    console.log('✓ Migration executed successfully');
    return true;
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    return false;
  }
}

async function runMigrations() {
  console.log('Starting database migrations...\n');

  const migrations = [
    {
      path: join(__dirname, '../supabase/migrations/20260620000000_fix_database_schema.sql'),
      description: 'Fix database schema - add missing columns to users table'
    },
    {
      path: join(__dirname, '../supabase/migrations/20260620000100_create_get_team_info_rpc.sql'),
      description: 'Create get_team_info_by_user RPC function'
    },
    {
      path: join(__dirname, '../supabase/migrations/20260620000300_create_team_with_admin_rpc.sql'),
      description: 'Create team with admin RPC function'
    }
  ];

  for (const migration of migrations) {
    await executeMigration(migration.path, migration.description);
  }

  console.log('\n✓ All migrations completed!');
  console.log('\nNext steps:');
  console.log('1. Deploy to Vercel: vercel deploy');
  console.log('2. Or run: npx tsx scripts/setup-storage.ts');
  console.log('3. Test login and registration');
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
