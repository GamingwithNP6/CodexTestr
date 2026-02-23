-- Replace permissive insert policy with role-specific ownership checks.
DROP POLICY IF EXISTS "Allow public inserts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow anon inserts with null user_id" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated inserts for own user_id" ON public.contact_submissions;

-- NOTE: `WITH CHECK (true)` is unsafe for INSERT here because it allows callers
-- to set any `user_id`, enabling spoofed ownership and bypassing per-user isolation.
CREATE POLICY "Allow anon inserts with null user_id"
ON public.contact_submissions
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow authenticated inserts for own user_id"
ON public.contact_submissions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
