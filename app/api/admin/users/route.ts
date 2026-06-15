import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, name, team_id, role } = body;

    if (!email || !password || !username || !name || !team_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Create user record in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        team_id,
        username,
        name,
        role: role || 'member',
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user record:', userError);
      // Rollback: delete auth user if user record creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const team_id = searchParams.get('team_id');

    if (!id || !team_id) {
      return NextResponse.json({ error: 'Missing id or team_id' }, { status: 400 });
    }

    // Get user to check role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .eq('team_id', team_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 });
    }

    // Delete user record
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('team_id', team_id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Delete auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      return NextResponse.json({ error: authDeleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
