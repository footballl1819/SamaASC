-- Configure Supabase Storage policies for team-assets bucket
-- This ensures users can upload and access profile photos

-- Note: Storage policies are managed through the Supabase Dashboard or API
-- This SQL migration documents the required configuration:

-- Required Storage Policy 1: Allow public read access to profile photos
-- Object pattern: user-profiles/*
-- Role: anon
-- Operations: SELECT

-- Required Storage Policy 2: Allow authenticated users to upload their own photos
-- Object pattern: user-profiles/${user_id}*
-- Role: authenticated
-- Operations: INSERT

-- Required Storage Policy 3: Allow authenticated users to update their own photos
-- Object pattern: user-profiles/${user_id}*
-- Role: authenticated
-- Operations: UPDATE

-- Since storage policies cannot be configured via SQL, they must be set up via:
-- 1. Supabase Dashboard -> Storage -> team-assets -> Policies
-- 2. Or via the Supabase Management API

-- MANUAL SETUP REQUIRED:
-- Login to Supabase Dashboard -> Storage tab
-- Find "team-assets" bucket
-- Add these policies:

-- Policy 1 (Public Read):
-- CREATE POLICY "public_read" ON storage.objects
-- FOR SELECT TO anon USING (bucket_id = 'team-assets' AND (storage.foldername(name))[1] = 'user-profiles');

-- Policy 2 (Authenticated Upload):
-- CREATE POLICY "user_upload" ON storage.objects
-- FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'team-assets' AND (storage.foldername(name))[1] = 'user-profiles' AND auth.uid()::text = (regexp_matches(name, 'user-profiles/([a-f0-9-]+)', 'g'))[1]);

-- Policy 3 (Authenticated Update):
-- CREATE POLICY "user_update" ON storage.objects
-- FOR UPDATE TO authenticated
-- USING (bucket_id = 'team-assets' AND (storage.foldername(name))[1] = 'user-profiles' AND auth.uid()::text = (regexp_matches(name, 'user-profiles/([a-f0-9-]+)', 'g'))[1])
-- WITH CHECK (bucket_id = 'team-assets' AND (storage.foldername(name))[1] = 'user-profiles' AND auth.uid()::text = (regexp_matches(name, 'user-profiles/([a-f0-9-]+)', 'g'))[1]);
