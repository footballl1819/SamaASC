import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Add scorers column if it doesn't exist
    const { data: scorersCheck } = await supabase.rpc('check_column_exists', {
      table_name: 'matches',
      column_name: 'scorers'
    });

    if (!scorersCheck) {
      await supabase.rpc('add_column_if_not_exists', {
        table_name: 'matches',
        column_name: 'scorers',
        column_type: 'text'
      });
    }

    // Add formation column if it doesn't exist
    const { data: formationCheck } = await supabase.rpc('check_column_exists', {
      table_name: 'matches',
      column_name: 'formation'
    });

    if (!formationCheck) {
      await supabase.rpc('add_column_if_not_exists', {
        table_name: 'matches',
        column_name: 'formation',
        column_type: 'text',
        default_value: '4-3-3'
      });
    }

    return NextResponse.json({ success: true, message: 'Matches schema fixed successfully' });
  } catch (error) {
    console.error('Error fixing matches schema:', error);
    
    // Try direct SQL approach if RPC fails
    try {
      const { error: error1 } = await supabase.rpc('exec_sql', {
        sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'scorers') THEN ALTER TABLE matches ADD COLUMN scorers TEXT; END IF; END $$;`
      });
      
      const { error: error2 } = await supabase.rpc('exec_sql', {
        sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'formation') THEN ALTER TABLE matches ADD COLUMN formation TEXT DEFAULT '4-3-3'; END IF; END $$;`
      });

      if (error1 || error2) {
        throw new Error('Failed to add columns');
      }

      return NextResponse.json({ success: true, message: 'Matches schema fixed successfully' });
    } catch (fallbackError) {
      return NextResponse.json({ 
        error: 'Failed to fix schema. Please apply the migration manually.',
        details: (error as Error).message
      }, { status: 500 });
    }
  }
}
