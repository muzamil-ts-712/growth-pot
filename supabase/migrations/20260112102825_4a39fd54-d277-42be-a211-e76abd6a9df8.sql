-- Fix 1: Update profiles RLS policies to explicitly require authentication
-- Drop and recreate policies with explicit auth.uid() IS NOT NULL checks

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fund admins can view member profiles (already has auth check, but make explicit)
DROP POLICY IF EXISTS "Fund admins can view member profiles" ON public.profiles;
CREATE POLICY "Fund admins can view member profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1
    FROM fund_members fm
    JOIN funds f ON f.id = fm.fund_id
    WHERE fm.user_id = profiles.user_id 
    AND f.admin_id = auth.uid()
  )
);

-- Fund members basic profile access (already has check, recreate for consistency)
DROP POLICY IF EXISTS "Fund members can view basic profiles via safe_profiles" ON public.profiles;
CREATE POLICY "Fund members can view basic profiles via safe_profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND public.shares_fund_with(user_id)
);

-- Fix 2: Update payments RLS policies to explicitly require authentication
DROP POLICY IF EXISTS "Fund members can view payments" ON public.payments;
CREATE POLICY "Fund members can view payments"
ON public.payments
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Fund admin can view
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = payments.fund_id 
      AND funds.admin_id = auth.uid()
    )
    OR 
    -- Member can view their own payment
    member_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Members can submit payments" ON public.payments;
CREATE POLICY "Members can submit payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = member_id);

DROP POLICY IF EXISTS "Fund admins can update payments" ON public.payments;
CREATE POLICY "Fund admins can update payments"
ON public.payments
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM funds
    WHERE funds.id = payments.fund_id 
    AND funds.admin_id = auth.uid()
  )
);

-- Fix 3: For safe_profiles view - it uses security_invoker so it respects 
-- the underlying profiles RLS. The issue is that views themselves can't have 
-- RLS in the traditional sense. We already have proper RLS on profiles table.
-- The safe_profiles view will now properly respect the updated profiles RLS.

-- Additionally, ensure anon role cannot access profiles directly
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.safe_profiles FROM anon;
REVOKE ALL ON public.payments FROM anon;