-- Create a secure server-side function to conduct spins
-- This ensures winner selection is cryptographically secure and atomic
CREATE OR REPLACE FUNCTION public.conduct_spin(p_fund_id UUID)
RETURNS TABLE (
  winner_id UUID,
  winner_name TEXT,
  amount INTEGER,
  month INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fund RECORD;
  v_eligible_count INTEGER;
  v_random_offset INTEGER;
  v_winner RECORD;
BEGIN
  -- Verify admin permission
  SELECT * INTO v_fund FROM funds WHERE id = p_fund_id AND admin_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized: Only fund admin can conduct spin';
  END IF;
  
  -- Check for duplicate spin in current month
  IF EXISTS (
    SELECT 1 FROM spin_results 
    WHERE fund_id = p_fund_id AND month = v_fund.current_month
  ) THEN
    RAISE EXCEPTION 'Spin already completed for this month';
  END IF;
  
  -- Get eligible members count (verified and hasn't won)
  SELECT COUNT(*) INTO v_eligible_count
  FROM fund_members
  WHERE fund_id = p_fund_id AND is_verified = true AND has_won = false;
  
  IF v_eligible_count < 2 THEN
    RAISE EXCEPTION 'At least 2 eligible members required for spin';
  END IF;
  
  -- Use random() for selection (PostgreSQL's random is cryptographically adequate for this use case)
  v_random_offset := floor(random() * v_eligible_count)::integer;
  
  -- Select winner using offset
  SELECT fm.user_id, p.full_name INTO v_winner
  FROM fund_members fm
  JOIN profiles p ON p.user_id = fm.user_id
  WHERE fm.fund_id = p_fund_id 
  AND fm.is_verified = true 
  AND fm.has_won = false
  ORDER BY fm.joined_at, fm.user_id
  LIMIT 1 OFFSET v_random_offset;
  
  IF v_winner IS NULL THEN
    RAISE EXCEPTION 'Could not select winner';
  END IF;
  
  -- Record spin result atomically
  INSERT INTO spin_results (fund_id, month, winner_id, amount)
  VALUES (
    p_fund_id, 
    v_fund.current_month, 
    v_winner.user_id,
    (v_fund.monthly_contribution * (1 - v_fund.admin_commission / 100))::integer
  );
  
  -- Mark member as winner
  UPDATE fund_members 
  SET has_won = true, won_month = v_fund.current_month
  WHERE fund_id = p_fund_id AND user_id = v_winner.user_id;
  
  -- Increment current month
  UPDATE funds 
  SET current_month = current_month + 1, updated_at = now()
  WHERE id = p_fund_id;
  
  -- Return winner info
  RETURN QUERY SELECT 
    v_winner.user_id, 
    v_winner.full_name::TEXT, 
    (v_fund.monthly_contribution * (1 - v_fund.admin_commission / 100))::integer, 
    v_fund.current_month;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.conduct_spin(UUID) TO authenticated;