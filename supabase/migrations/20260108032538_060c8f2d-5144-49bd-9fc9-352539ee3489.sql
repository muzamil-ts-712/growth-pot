-- Create security definer functions to break RLS recursion

-- Function to check if user is admin of a fund
CREATE OR REPLACE FUNCTION public.is_fund_admin(fund_id_input UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM funds
    WHERE id = fund_id_input AND admin_id = auth.uid()
  )
$$;

-- Function to check if user is member of a fund
CREATE OR REPLACE FUNCTION public.is_fund_member(fund_id_input UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM fund_members
    WHERE fund_id = fund_id_input AND user_id = auth.uid()
  )
$$;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Anyone can view funds they are a member of or admin" ON funds;
DROP POLICY IF EXISTS "Members can view fund members of their funds" ON fund_members;

-- Recreate funds SELECT policy using security definer function
CREATE POLICY "Users can view their own funds"
ON funds FOR SELECT
USING (
  admin_id = auth.uid() 
  OR public.is_fund_member(id)
);

-- Recreate fund_members SELECT policy using security definer function
CREATE POLICY "Users can view fund members"
ON fund_members FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_fund_admin(fund_id)
  OR public.is_fund_member(fund_id)
);