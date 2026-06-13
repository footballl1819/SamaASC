import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigration() {
  console.log('Checking migration status...\n');
  
  try {
    // Get all users from custom table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users?.length || 0} users in custom table:\n`);
    
    for (const user of users || []) {
      console.log(`User: ${user.username}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Team ID: ${user.team_id}`);
      
      // Check if Supabase Auth user exists
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id);
        
        if (authUser && !authError) {
          console.log(`  Supabase Auth user: EXISTS ✅`);
          console.log(`  Auth email: ${authUser.user.email}`);
        } else {
          console.log(`  Supabase Auth user: NOT FOUND ❌`);
        }
      } catch (e) {
        console.log(`  Supabase Auth user: NOT FOUND ❌ (exception)`);
      }
      
      console.log('');
    }
    
    // Get all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return;
    }
    
    console.log(`\nFound ${teams?.length || 0} teams:\n`);
    
    for (const team of teams || []) {
      console.log(`Team: ${team.name} (${team.slug})`);
      console.log(`  ID: ${team.id}`);
      
      // Count users for this team
      const { data: teamUsers } = await supabase
        .from('users')
        .select('id')
        .eq('team_id', team.id);
      
      console.log(`  Users: ${teamUsers?.length || 0}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

checkMigration();
