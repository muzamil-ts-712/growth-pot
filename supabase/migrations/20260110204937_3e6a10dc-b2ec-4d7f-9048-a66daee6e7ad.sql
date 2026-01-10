-- Create a view for safe profile access (public info only)
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Update the profiles RLS policy for fund members to be more restrictive
-- Drop the existing shared funds policy if it exists
DROP POLICY IF EXISTS "Users can view profiles in shared funds" ON profiles;

-- Create a new policy that only allows viewing profiles in shared funds through the safe view
-- Fund members can see each other but only through the safe_profiles view
-- Full profile access (with phone) is reserved for:
-- 1. The user themselves
-- 2. Fund admins viewing their fund members