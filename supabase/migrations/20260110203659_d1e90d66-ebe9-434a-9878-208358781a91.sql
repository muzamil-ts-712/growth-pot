-- Fix 1: Add length constraint to payment proof_text
ALTER TABLE payments 
ALTER COLUMN proof_text TYPE VARCHAR(500);

-- Fix 2: Update spin_results RLS policy to require explicit authentication
DROP POLICY IF EXISTS "Fund members can view spin results" ON spin_results;

CREATE POLICY "Authenticated fund members can view spin results"
ON spin_results FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    public.is_fund_admin(fund_id)
    OR
    public.is_fund_member(fund_id)
  )
);

-- Fix 3: Add DELETE policy for fund_members so users can leave funds
CREATE POLICY "Users can leave funds"
ON fund_members FOR DELETE
USING (user_id = auth.uid());

-- Fix 4: Update profiles RLS policy to restrict phone number visibility
-- First drop the existing policy that exposes phone numbers
DROP POLICY IF EXISTS "Fund members can view each other profiles" ON profiles;

-- Create a more restrictive policy: users can only see their own profile or other members' basic info (excluding phone)
-- Since we can't do field-level RLS, we'll create a view for safe profile access
-- For now, restrict to own profile only for full details
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Allow fund admins to see member profiles (they need contact info)
CREATE POLICY "Fund admins can view member profiles"
ON profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM fund_members fm
    INNER JOIN funds f ON f.id = fm.fund_id
    WHERE fm.user_id = profiles.user_id
    AND f.admin_id = auth.uid()
  )
);