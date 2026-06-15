import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { match_id, player_id, voter_name, team_id } = body;

    if (!match_id || !player_id || !voter_name || !team_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has already voted for this match
    const { data: existingVote } = await supabase
      .from('match_votes')
      .select('*')
      .eq('match_id', match_id)
      .eq('voter_name', voter_name.trim())
      .eq('team_id', team_id)
      .single();

    if (existingVote) {
      return NextResponse.json({ error: 'Vous avez déjà voté pour ce match' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('match_votes')
      .insert({ match_id, player_id, voter_name: voter_name.trim(), team_id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
