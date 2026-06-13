import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateAllUsers() {
  console.log('Starting migration for all users...\n');
  
  try {
    // Get all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return;
    }
    
    console.log(`Found ${teams?.length || 0} teams\n`);
    
    for (const team of teams || []) {
      console.log(`\nProcessing team: ${team.name} (${team.slug})`);
      
      // Get all users for this team
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('team_id', team.id);
      
      if (usersError) {
        console.error(`  Error fetching users for team:`, usersError);
        continue;
      }
      
      console.log(`  Found ${users?.length || 0} users`);
      
      for (const user of users || []) {
        console.log(`\n  Processing user: ${user.username}`);
        
        // Check if Supabase Auth user already exists
        try {
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id);
          
          if (authUser && !authError) {
            console.log(`    - Supabase Auth user already exists, skipping`);
            continue;
          }
        } catch (e) {
          console.log(`    - Supabase Auth user does not exist, creating...`);
        }
        
        // Create Supabase Auth user
        const userEmail = `${user.username}@${team.slug}.com`;
        const userPassword = 'password123'; // Default password for migrated users
        
        try {
          const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
            email: userEmail,
            password: userPassword,
            email_confirm: true,
            user_metadata: {
              team_id: team.id,
              username: user.username,
            },
          });
          
          if (signUpError) {
            console.error(`    - Error creating Supabase Auth user:`, signUpError);
            continue;
          }
          
          console.log(`    - Created Supabase Auth user: ${authData.user.id}`);
          console.log(`    - Email: ${userEmail}`);
          console.log(`    - Default password: ${userPassword}`);
          
          // Update custom user table with new Supabase Auth ID
          const { error: updateError } = await supabase
            .from('users')
            .update({ id: authData.user.id })
            .eq('id', user.id);
          
          if (updateError) {
            console.error(`    - Error updating custom user ID:`, updateError);
          } else {
            console.log(`    - Updated custom user ID to match Supabase Auth`);
          }
          
        } catch (e) {
          console.error(`    - Exception creating Supabase Auth user:`, e);
        }
      }
    }
    
    console.log('\n\nMigration completed!');
    console.log('\nIMPORTANT: All migrated users have been set with default password: password123');
    console.log('Users should change their password after first login.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateAllUsers();
