import { useState, useEffect } from 'react';
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
  is_verified: boolean;
  has_won: boolean;
  won_month: number | null;
  joined_at: string;
  profile?: {
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
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
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFunds = async () => {
    if (!user) {
      setFunds([]);
      setLoading(false);
      return;
    }

    // Fetch funds where user is admin
    const { data: adminFunds } = await supabase
      .from('funds')
      .select('*')
      .eq('admin_id', user.id);

    // Fetch funds where user is a member
    const { data: memberFundIds } = await supabase
      .from('fund_members')
      .select('fund_id')
      .eq('user_id', user.id);

    let memberFunds: Fund[] = [];
    if (memberFundIds && memberFundIds.length > 0) {
      const fundIds = memberFundIds.map(m => m.fund_id);
      const { data } = await supabase
        .from('funds')
        .select('*')
        .in('id', fundIds);
      memberFunds = data || [];
    }

    // Combine and deduplicate
    const allFunds = [...(adminFunds || []), ...memberFunds];
    const uniqueFunds = allFunds.filter((fund, index, self) =>
      index === self.findIndex(f => f.id === fund.id)
    );

    setFunds(uniqueFunds);
    setLoading(false);
  };

  useEffect(() => {
    fetchFunds();
  }, [user]);

  const createFund = async (data: {
    name: string;
    total_amount: number;
    monthly_contribution: number;
    duration: number;
    member_count: number;
    admin_commission: number;
  }) => {
    if (!user) return { error: new Error('Not authenticated'), fund: null };

    const joinCode = generateJoinCode();

    const { data: fund, error } = await supabase
      .from('funds')
      .insert({
        ...data,
        admin_id: user.id,
        join_code: joinCode,
      })
      .select()
      .single();

    if (!error && fund) {
      await fetchFunds();
    }

    return { error, fund };
  };

  const getFund = async (id: string) => {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data, error };
  };

  const getFundByCode = async (code: string) => {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .eq('join_code', code.toUpperCase())
      .maybeSingle();

    return { data, error };
  };

  const joinFund = async (fundId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('fund_members')
      .insert({
        fund_id: fundId,
        user_id: user.id,
        is_verified: false,
      });

    if (!error) {
      await fetchFunds();
    }

    return { error };
  };

  const updateFund = async (id: string, data: Partial<Fund>) => {
    const { error } = await supabase
      .from('funds')
      .update(data)
      .eq('id', id);

    if (!error) {
      await fetchFunds();
    }

    return { error };
  };

  return {
    funds,
    loading,
    createFund,
    getFund,
    getFundByCode,
    joinFund,
    updateFund,
    refetch: fetchFunds,
  };
};

export const useFundMembers = (fundId: string | undefined) => {
  const [members, setMembers] = useState<FundMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!fundId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('fund_members')
      .select(`
        *,
        profile:profiles!fund_members_user_id_fkey(full_name, phone, avatar_url)
      `)
      .eq('fund_id', fundId);

    if (!error && data) {
      setMembers(data.map(m => ({
        ...m,
        profile: Array.isArray(m.profile) ? m.profile[0] : m.profile
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [fundId]);

  const verifyMember = async (memberId: string) => {
    const { error } = await supabase
      .from('fund_members')
      .update({ is_verified: true })
      .eq('id', memberId);

    if (!error) {
      await fetchMembers();
    }

    return { error };
  };

  const markWinner = async (userId: string, month: number) => {
    const { error } = await supabase
      .from('fund_members')
      .update({ has_won: true, won_month: month })
      .eq('fund_id', fundId)
      .eq('user_id', userId);

    if (!error) {
      await fetchMembers();
    }

    return { error };
  };

  return {
    members,
    loading,
    verifyMember,
    markWinner,
    refetch: fetchMembers,
  };
};

export const usePayments = (fundId: string | undefined) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!fundId) {
      setPayments([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('fund_id', fundId)
      .order('submitted_at', { ascending: false });

    if (!error && data) {
      setPayments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [fundId]);

  const submitPayment = async (data: {
    month: number;
    amount: number;
    proof_text?: string;
    proof_image?: string;
  }) => {
    if (!user || !fundId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('payments')
      .insert({
        fund_id: fundId,
        member_id: user.id,
        ...data,
      });

    if (!error) {
      await fetchPayments();
    }

    return { error };
  };

  const approvePayment = async (paymentId: string) => {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', paymentId);

    if (!error) {
      await fetchPayments();
    }

    return { error };
  };

  const rejectPayment = async (paymentId: string) => {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'rejected' })
      .eq('id', paymentId);

    if (!error) {
      await fetchPayments();
    }

    return { error };
  };

  return {
    payments,
    loading,
    submitPayment,
    approvePayment,
    rejectPayment,
    refetch: fetchPayments,
  };
};

export const useSpinResults = (fundId: string | undefined) => {
  const { user } = useAuth();
  const [results, setResults] = useState<SpinResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    if (!fundId) {
      setResults([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('spin_results')
      .select('*')
      .eq('fund_id', fundId)
      .order('month', { ascending: false });

    if (!error && data) {
      setResults(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, [fundId]);

  const recordSpin = async (data: {
    month: number;
    winner_id: string;
    amount: number;
  }) => {
    if (!user || !fundId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('spin_results')
      .insert({
        fund_id: fundId,
        ...data,
      });

    if (!error) {
      await fetchResults();
    }

    return { error };
  };

  return {
    results,
    loading,
    recordSpin,
    refetch: fetchResults,
  };
};
