-- Fix the security definer view by explicitly setting security invoker
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
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.safe_profiles TO authenticated;