import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Fund {
  id: string;
  name: string;
  total_amount: number;
  monthly_contribution: number;
  duration: number;
  member_count: number;
  admin_id: string;
  join_code: string;
  admin_commission: number;
  current_month: number;
  status: string;
  created_at: string;
}

export interface FundMember {
  id: string;
  fund_id: string;
  user_id: string;
  joined_at: string;
  is_verified: boolean;
  has_won: boolean;
  won_month: number | null;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    phone?: string | null;
  };
}

export interface Payment {
  id: string;
  fund_id: string;
  member_id: string;
  month: number;
  amount: number;
  proof_image: string | null;
  proof_text: string | null;
  status: string;
  submitted_at: string;
  approved_at: string | null;
}

export interface SpinResult {
  id: string;
  fund_id: string;
  month: number;
  winner_id: string;
  amount: number;
  spin_date: string;
}

const generateJoinCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useFunds = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's funds (as admin or member)
  const { data: funds = [], isLoading: fundsLoading } = useQuery({
    queryKey: ['funds', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get funds where user is admin
      const { data: adminFunds, error: adminError } = await supabase
        .from('funds')
        .select('*')
        .eq('admin_id', user.id);
      
      if (adminError) throw adminError;

      // Get funds where user is member
      const { data: memberFunds, error: memberError } = await supabase
        .from('fund_members')
        .select('fund_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const memberFundIds = memberFunds.map(m => m.fund_id);
      
      if (memberFundIds.length > 0) {
        const { data: joinedFunds, error: joinedError } = await supabase
          .from('funds')
          .select('*')
          .in('id', memberFundIds);

        if (joinedError) throw joinedError;

        // Combine and dedupe
        const allFunds = [...(adminFunds || [])];
        joinedFunds?.forEach(jf => {
          if (!allFunds.find(af => af.id === jf.id)) {
            allFunds.push(jf);
          }
        });
        return allFunds as Fund[];
      }

      return adminFunds as Fund[];
    },
    enabled: !!user,
  });

  // Create fund
  const createFundMutation = useMutation({
    mutationFn: async (fundData: {
      name: string;
      total_amount: number;
      monthly_contribution: number;
      duration: number;
      member_count: number;
      admin_commission: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('funds')
        .insert({
          ...fundData,
          admin_id: user.id,
          join_code: generateJoinCode(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as Fund;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
  });

  // Join fund by code (uses secure RPC function)
  const joinFundMutation = useMutation({
    mutationFn: async (joinCode: string) => {
      if (!user) throw new Error('Not authenticated');

      // Find fund by code using secure RPC function
      const { data: fundData, error: findError } = await supabase
        .rpc('get_fund_by_join_code', { join_code_input: joinCode });

      if (findError) throw new Error('Error looking up fund');
      
      const fund = fundData?.[0];
      if (!fund) throw new Error('Invalid join code');

      // Check if already a member
      const { data: existing } = await supabase
        .from('fund_members')
        .select('id')
        .eq('fund_id', fund.id)
        .eq('user_id', user.id)
        .single();

      if (existing) return fund as Fund;

      // Join the fund
      const { error: joinError } = await supabase
        .from('fund_members')
        .insert({
          fund_id: fund.id,
          user_id: user.id,
        });

      if (joinError) throw joinError;
      return fund as Fund;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
  });

  return {
    funds,
    fundsLoading,
    createFund: createFundMutation.mutateAsync,
    joinFund: joinFundMutation.mutateAsync,
    isCreating: createFundMutation.isPending,
    isJoining: joinFundMutation.isPending,
  };
};

export const useFundDetails = (fundId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch fund details
  const { data: fund, isLoading: fundLoading } = useQuery({
    queryKey: ['fund', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funds')
        .select('*')
        .eq('id', fundId)
        .single();

      if (error) throw error;
      return data as Fund;
    },
    enabled: !!fundId,
  });

  // Fetch members with profiles
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['fund-members', fundId],
    queryFn: async () => {
      const { data: memberData, error: memberError } = await supabase
        .from('fund_members')
        .select('*')
        .eq('fund_id', fundId);

      if (memberError) throw memberError;

      // Fetch profiles for each member
      const memberUserIds = memberData.map(m => m.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, phone')
        .in('user_id', memberUserIds);

      if (profileError) throw profileError;

      return memberData.map(m => ({
        ...m,
        profile: profiles?.find(p => p.user_id === m.user_id),
      })) as FundMember[];
    },
    enabled: !!fundId,
  });

  // Fetch payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['fund-payments', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('fund_id', fundId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!fundId,
  });

  // Fetch spin results
  const { data: spinResults = [] } = useQuery({
    queryKey: ['spin-results', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spin_results')
        .select('*')
        .eq('fund_id', fundId)
        .order('month', { ascending: false });

      if (error) throw error;
      return data as SpinResult[];
    },
    enabled: !!fundId,
  });

  // Verify member
  const verifyMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('fund_members')
        .update({ is_verified: true })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-members', fundId] });
    },
  });

  // Submit payment
  const submitPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      month: number;
      amount: number;
      proof_text?: string;
      proof_image?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('payments')
        .insert({
          fund_id: fundId,
          member_id: user.id,
          ...paymentData,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-payments', fundId] });
    },
  });

  // Approve payment
  const approvePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-payments', fundId] });
    },
  });

  // Conduct spin using secure server-side RPC function
  const conductSpinMutation = useMutation({
    mutationFn: async (): Promise<{ winner_id: string; winner_name: string; amount: number; month: number }> => {
      // Call the secure server-side function that handles:
      // - Admin permission verification
      // - Duplicate spin prevention
      // - Cryptographically adequate random selection
      // - Atomic updates to spin_results, fund_members, and funds tables
      const { data, error } = await supabase
        .rpc('conduct_spin', { p_fund_id: fundId });

      if (error) {
        console.error('Spin error:', error);
        throw new Error(error.message || 'Failed to conduct spin');
      }

      if (!data || data.length === 0) {
        throw new Error('No winner returned from spin');
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund', fundId] });
      queryClient.invalidateQueries({ queryKey: ['fund-members', fundId] });
      queryClient.invalidateQueries({ queryKey: ['spin-results', fundId] });
    },
  });

  const isAdmin = fund?.admin_id === user?.id;

  return {
    fund,
    members,
    payments,
    spinResults,
    isAdmin,
    loading: fundLoading || membersLoading || paymentsLoading,
    verifyMember: verifyMemberMutation.mutateAsync,
    submitPayment: submitPaymentMutation.mutateAsync,
    approvePayment: approvePaymentMutation.mutateAsync,
    conductSpin: conductSpinMutation.mutateAsync,
    isSpinning: conductSpinMutation.isPending,
  };
};
