import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Check if password column exists in users table
    const { data: columnInfo, error: checkError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'password'
            ) THEN
                ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT '';
            END IF;
        END $$;
      `
    });

    if (checkError) {
      console.error('Error checking/adding password column:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Schema fixed successfully' });
  } catch (error) {
    console.error('Error fixing schema:', error);
    return NextResponse.json({ error: 'Failed to fix schema' }, { status: 500 });
  }
}
