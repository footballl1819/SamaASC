import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function initializeStorage() {
  console.log('Initializing Supabase Storage...');

  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    
    console.log('Current buckets:', buckets?.map(b => b.name) || []);

    const bucketName = 'team-assets';
    const bucketExists = buckets?.some(b => b.name === bucketName);

    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (error) {
        console.error('Error creating bucket:', error);
        return;
      }

      console.log('Bucket created successfully:', data);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }

    // Update bucket policies for public access
    console.log('Setting up bucket policies...');
    
    // These policies should be set up through the Supabase dashboard
    // or through SQL migrations, but we can verify here
    console.log('Bucket policies need to be configured in Supabase Dashboard:');
    console.log('1. Allow public SELECT on objects in team-assets bucket');
    console.log('2. Allow authenticated users to INSERT/UPDATE their own files');

    console.log('\nStorage initialization complete!');
  } catch (error) {
    console.error('Error during storage initialization:', error);
    process.exit(1);
  }
}

initializeStorage();
