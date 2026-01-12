-- Remove the policy that allows fund members to see full profiles
-- They should only access profiles through safe_profiles view (which excludes phone)
DROP POLICY IF EXISTS "Fund members can view other members profiles" ON public.profiles;

-- Update the safe_profiles view to ensure it excludes phone
DROP VIEW IF EXISTS public.safe_profiles;

CREATE VIEW public.safe_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  created_at
FROM profiles;

-- Grant access to authenticated users
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Create a security definer function for fund members to check if they share a fund
CREATE OR REPLACE FUNCTION public.shares_fund_with(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM fund_members fm1
    JOIN fund_members fm2 ON fm1.fund_id = fm2.fund_id
    WHERE fm1.user_id = auth.uid() 
    AND fm2.user_id = target_user_id
  )
$$;

-- Add RLS policy for safe_profiles access - members who share a fund can view
-- Note: This works because safe_profiles uses security_invoker and 
-- the underlying profiles table has RLS, but we're accessing through the view
-- We need to add a policy on profiles that restricts what non-admins can see

-- Create a restricted policy for fund members - only allow viewing if you're the owner
-- or if you're a fund admin (who needs full access for verification)
-- Regular fund members will use the safe_profiles view instead

-- Keep existing policies for:
-- 1. Users viewing their own profile (full access)
-- 2. Fund admins viewing member profiles (full access for verification)
-- 
-- Remove access for regular fund members to full profiles table
-- They should query safe_profiles instead