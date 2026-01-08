-- Fix 1: Profiles table - Replace overly permissive SELECT policy with fund-based access
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view profiles in shared funds"
ON profiles FOR SELECT
USING (
  -- User can see their own profile
  user_id = auth.uid()
  OR
  -- User can see profiles of members in funds they're part of
  EXISTS (
    SELECT 1 FROM fund_members fm1
    JOIN fund_members fm2 ON fm1.fund_id = fm2.fund_id
    WHERE fm1.user_id = auth.uid()
    AND fm2.user_id = profiles.user_id
  )
  OR
  -- User can see profiles in funds they admin
  EXISTS (
    SELECT 1 FROM funds f
    JOIN fund_members fm ON f.id = fm.fund_id
    WHERE f.admin_id = auth.uid()
    AND fm.user_id = profiles.user_id
  )
);

-- Fix 2: Funds table - Drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view funds by join code" ON funds;

-- Create secure RPC function for join-by-code lookup
CREATE OR REPLACE FUNCTION get_fund_by_join_code(join_code_input TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  total_amount INT,
  monthly_contribution INT,
  duration INT,
  member_count INT,
  admin_commission NUMERIC,
  current_month INT,
  status TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id, f.name, f.total_amount, f.monthly_contribution,
    f.duration, f.member_count, f.admin_commission,
    f.current_month, f.status
  FROM funds f
  WHERE f.join_code = UPPER(join_code_input)
  AND f.status = 'active';
END;
$$;

GRANT EXECUTE ON FUNCTION get_fund_by_join_code TO authenticated;