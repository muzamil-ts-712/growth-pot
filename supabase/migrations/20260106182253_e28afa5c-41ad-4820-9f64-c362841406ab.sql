-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funds table
CREATE TABLE public.funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  monthly_contribution INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  member_count INTEGER NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  admin_commission NUMERIC(5,2) NOT NULL DEFAULT 2.0,
  current_month INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fund_members table
CREATE TABLE public.fund_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.funds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  has_won BOOLEAN NOT NULL DEFAULT false,
  won_month INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fund_id, user_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.funds(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  proof_image TEXT,
  proof_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create spin_results table
CREATE TABLE public.spin_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.funds(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL,
  winner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  spin_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fund_id, month)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Funds policies
CREATE POLICY "Anyone can view funds they are a member of or admin" ON public.funds
  FOR SELECT TO authenticated USING (
    admin_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.fund_members WHERE fund_id = funds.id AND user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create funds" ON public.funds
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their funds" ON public.funds
  FOR UPDATE TO authenticated USING (auth.uid() = admin_id);

CREATE POLICY "Anyone can view funds by join code" ON public.funds
  FOR SELECT TO authenticated USING (true);

-- Fund members policies
CREATE POLICY "Members can view fund members of their funds" ON public.fund_members
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.funds WHERE id = fund_id AND admin_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.fund_members fm WHERE fm.fund_id = fund_members.fund_id AND fm.user_id = auth.uid())
  );

CREATE POLICY "Users can join funds" ON public.fund_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Fund admins can update members" ON public.fund_members
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.funds WHERE id = fund_id AND admin_id = auth.uid())
  );

-- Payments policies
CREATE POLICY "Fund members can view payments" ON public.payments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.funds WHERE id = fund_id AND admin_id = auth.uid()) OR
    member_id = auth.uid()
  );

CREATE POLICY "Members can submit payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Fund admins can update payments" ON public.payments
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.funds WHERE id = fund_id AND admin_id = auth.uid())
  );

-- Spin results policies
CREATE POLICY "Fund members can view spin results" ON public.spin_results
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.funds WHERE id = fund_id AND admin_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.fund_members WHERE fund_id = spin_results.fund_id AND user_id = auth.uid())
  );

CREATE POLICY "Fund admins can insert spin results" ON public.spin_results
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.funds WHERE id = fund_id AND admin_id = auth.uid())
  );

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funds_updated_at
  BEFORE UPDATE ON public.funds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate random join code function
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;