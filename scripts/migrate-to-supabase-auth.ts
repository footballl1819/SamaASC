import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateTeams() {
  console.log('Starting migration to Supabase Auth...');
  
  try {
    // Get all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return;
    }
    
    console.log(`Found ${teams?.length || 0} teams`);
    
    for (const team of teams || []) {
      console.log(`\nProcessing team: ${team.name} (${team.slug})`);
      
      // Check if admin user exists in custom users table
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('team_id', team.id)
        .eq('username', 'admin')
        .single();
      
      if (adminError || !adminUser) {
        console.log(`  - No admin user found in custom table, skipping`);
        continue;
      }
      
      console.log(`  - Found admin user: ${adminUser.id}`);
      
      // Check if Supabase Auth user already exists
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(adminUser.id);
        
        if (authUser && !authError) {
          console.log(`  - Supabase Auth user already exists, skipping`);
          continue;
        }
      } catch (e) {
        console.log(`  - Supabase Auth user does not exist, creating...`);
      }
      
      // Create Supabase Auth user
      const adminEmail = `admin@${team.slug}.com`;
      const adminPassword = 'admin123';
      
      try {
        const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            team_id: team.id,
            username: 'admin',
          },
        });
        
        if (signUpError) {
          console.error(`  - Error creating Supabase Auth user:`, signUpError);
          continue;
        }
        
        console.log(`  - Created Supabase Auth user: ${authData.user.id}`);
        
        // Update custom user table with new Supabase Auth ID
        const { error: updateError } = await supabase
          .from('users')
          .update({ id: authData.user.id })
          .eq('id', adminUser.id);
        
        if (updateError) {
          console.error(`  - Error updating custom user ID:`, updateError);
        } else {
          console.log(`  - Updated custom user ID to match Supabase Auth`);
        }
        
      } catch (e) {
        console.error(`  - Exception creating Supabase Auth user:`, e);
      }
    }
    
    console.log('\nMigration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateTeams();
