-- Enable RLS on the safe_profiles view
ALTER VIEW public.safe_profiles SET (security_invoker = on);

-- Note: Views don't support RLS directly in the same way tables do
-- The safe_profiles view already has security_invoker = true, which means
-- it respects the RLS of the underlying profiles table.
-- 
-- To fix this properly, we need to add a SELECT policy on profiles that 
-- allows fund members to view each other's basic profile info.

-- Add policy for fund members to view each other's profiles (for safe_profiles view access)
CREATE POLICY "Fund members can view other members profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM fund_members fm1
    JOIN fund_members fm2 ON fm1.fund_id = fm2.fund_id
    WHERE fm1.user_id = auth.uid() 
    AND fm2.user_id = profiles.user_id
  )
);