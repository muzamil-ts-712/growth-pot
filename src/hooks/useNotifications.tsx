import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  user_id: string;
  fund_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const dismissNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    dismissNotification: dismissNotification.mutate,
  };
};

// Hook for admins to send payment reminders
export const useSendReminders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fundId, fundName }: { fundId: string; fundName: string }) => {
      // Get current month for the fund
      const { data: fund, error: fundError } = await supabase
        .from('funds')
        .select('current_month, monthly_contribution, member_count')
        .eq('id', fundId)
        .single();
      
      if (fundError) throw fundError;

      // Get all members of this fund
      const { data: members, error: membersError } = await supabase
        .from('fund_members')
        .select('user_id')
        .eq('fund_id', fundId);
      
      if (membersError) throw membersError;

      // Get payments for current month
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('member_id')
        .eq('fund_id', fundId)
        .eq('month', fund.current_month);
      
      if (paymentsError) throw paymentsError;

      const paidMemberIds = new Set(payments.map(p => p.member_id));
      const unpaidMembers = members.filter(m => !paidMemberIds.has(m.user_id));

      if (unpaidMembers.length === 0) {
        return { sent: 0 };
      }

      // Create notifications for unpaid members
      const notifications = unpaidMembers.map(member => ({
        user_id: member.user_id,
        fund_id: fundId,
        type: 'payment_reminder',
        title: 'Payment Reminder 💰',
        message: `Your payment of ₹${Math.round(fund.monthly_contribution / fund.member_count).toLocaleString()} for ${fundName} (Month ${fund.current_month}) is pending. Please submit soon!`,
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (insertError) throw insertError;

      return { sent: unpaidMembers.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
