-- Copy and Run this in Supabase SQL Editor

-- 1. Enable RLS on the table (Safe to run if already enabled)
ALTER TABLE "public"."hr_presence_log" ENABLE ROW LEVEL SECURITY;

-- 2. Create a Policy to allow "anon" (the dashboard) to READ the data
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."hr_presence_log";

-- Create the new policy
CREATE POLICY "Enable read access for all users"
ON "public"."hr_presence_log"
FOR SELECT
TO public      -- 'public' role includes 'anon' (unauthenticated) and 'authenticated'
USING (true);  -- 'true' means ALL rows are visible (no filtering)

-- 3. Verify it works
-- You can run this check after applying the policy:
-- SELECT count(*) FROM hr_presence_log;
