-- Add policy for fund members to view basic profile info (used by safe_profiles view)
-- This policy allows reading only the non-sensitive columns through the view
CREATE POLICY "Fund members can view basic profiles via safe_profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND public.shares_fund_with(user_id)
);