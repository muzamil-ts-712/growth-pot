import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Users, Wallet, Calendar, Copy, Check, 
  Play, Upload, Trophy, Clock, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useFundDetails } from '@/hooks/useFunds';
import PotStatusCard from '@/components/PotStatusCard';
import MemberCard from '@/components/MemberCard';
import PaymentCard from '@/components/PaymentCard';
import SpinningWheel from '@/components/SpinningWheel';
import MiaAssistant from '@/components/MiaAssistant';

type TabType = 'overview' | 'members' | 'payments' | 'spin';

const PotDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { 
    fund, 
    members, 
    payments, 
    isAdmin, 
    loading,
    verifyMember,
    submitPayment,
    approvePayment,
    recordSpin
  } = useFundDetails(id || '');
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fund || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Pot not found</p>
      </div>
    );
  }

  const currentMonthPayments = payments.filter(p => p.month === fund.current_month);
  const approvedAmount = currentMonthPayments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const eligibleForSpin = members.filter(m => m.is_verified && !m.has_won);

  const copyCode = () => {
    navigator.clipboard.writeText(fund.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpin = () => {
    if (eligibleForSpin.length > 0) {
      setIsSpinning(true);
    }
  };

  const handleSpinComplete = async (winner: { id: string; name: string }) => {
    setIsSpinning(false);
    await recordSpin({
      month: fund.current_month,
      winner_id: winner.id,
      amount: fund.monthly_contribution * (1 - fund.admin_commission / 100),
    });
  };

  const handlePaymentSubmit = async () => {
    await submitPayment({
      month: fund.current_month,
      amount: fund.monthly_contribution / fund.member_count,
      proof_text: paymentNote,
    });
    setShowPaymentForm(false);
    setPaymentNote('');
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'payments', label: 'Payments', icon: Calendar },
    { id: 'spin', label: 'Spin', icon: Trophy },
  ];

  // Convert fund to the format expected by PotStatusCard
  const fundForStatus = {
    id: fund.id,
    name: fund.name,
    totalAmount: fund.total_amount,
    monthlyContribution: fund.monthly_contribution,
    duration: fund.duration,
    memberCount: fund.member_count,
    adminId: fund.admin_id,
    joinCode: fund.join_code,
    adminCommission: fund.admin_commission,
    currentMonth: fund.current_month,
    status: fund.status as 'active' | 'completed' | 'paused',
    members: [],
    createdAt: new Date(fund.created_at),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <h1 className="font-display text-lg font-bold">{fund.name}</h1>

          {isAdmin && (
            <button
              onClick={copyCode}
              className="flex items-center gap-1 text-xs font-mono bg-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/80"
            >
              {fund.join_code}
              {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-border overflow-x-auto">
        <div className="max-w-5xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                <PotStatusCard fund={fundForStatus} collectedAmount={approvedAmount} />
                
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {!isAdmin && (
                      <Button 
                        variant="hero" 
                        className="w-full"
                        onClick={() => setShowPaymentForm(true)}
                      >
                        <Upload className="w-4 h-4" />
                        Submit Payment
                      </Button>
                    )}
                    {isAdmin && (
                      <>
                        <Button 
                          variant="hero" 
                          className="w-full"
                          onClick={() => setActiveTab('spin')}
                          disabled={eligibleForSpin.length < 2}
                        >
                          <Play className="w-4 h-4" />
                          Start Monthly Spin
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setActiveTab('payments')}
                        >
                          <Clock className="w-4 h-4" />
                          Review Payments
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">
                    Members ({members.length}/{fund.member_count})
                  </h2>
                </div>

                {members.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No members yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your join code to invite members
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={{
                          userId: member.user_id,
                          user: {
                            id: member.user_id,
                            name: member.profile?.full_name || 'Unknown',
                            email: '',
                            phone: '',
                            isVerified: member.is_verified,
                            role: 'member',
                            createdAt: new Date(),
                          },
                          joinedAt: new Date(member.joined_at),
                          isVerified: member.is_verified,
                          hasWon: member.has_won,
                          wonMonth: member.won_month || undefined,
                          payments: [],
                        }}
                        isAdmin={isAdmin}
                        onVerify={() => verifyMember(member.id)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">
                    Month {fund.current_month} Payments
                  </h2>
                  {!isAdmin && (
                    <Button onClick={() => setShowPaymentForm(true)}>
                      <Upload className="w-4 h-4" />
                      Submit Payment
                    </Button>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No payments yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Payments will appear here once submitted
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => {
                      const member = members.find(m => m.user_id === payment.member_id);
                      return (
                        <PaymentCard
                          key={payment.id}
                          payment={{
                            id: payment.id,
                            memberId: payment.member_id,
                            fundId: payment.fund_id,
                            month: payment.month,
                            amount: payment.amount,
                            proofImage: payment.proof_image || undefined,
                            proofText: payment.proof_text || undefined,
                            status: payment.status as 'pending' | 'approved' | 'rejected',
                            submittedAt: new Date(payment.submitted_at),
                            approvedAt: payment.approved_at ? new Date(payment.approved_at) : undefined,
                          }}
                          memberName={member?.profile?.full_name || 'Unknown'}
                          isAdmin={isAdmin}
                          onApprove={() => approvePayment(payment.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Spin Tab */}
            {activeTab === 'spin' && (
              <motion.div
                key="spin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h2 className="font-display text-2xl font-bold mb-2">
                  Month {fund.current_month} Auction
                </h2>
                <p className="text-muted-foreground mb-8">
                  {eligibleForSpin.length} members eligible to win
                </p>

                {eligibleForSpin.length < 2 ? (
                  <div className="glass-card p-12 max-w-md mx-auto">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Not enough eligible members</h3>
                    <p className="text-sm text-muted-foreground">
                      At least 2 verified members who haven't won are needed
                    </p>
                  </div>
                ) : (
                  <>
                    <SpinningWheel
                      members={eligibleForSpin.map(m => ({ 
                        id: m.user_id, 
                        name: m.profile?.full_name || 'Unknown' 
                      }))}
                      onComplete={handleSpinComplete}
                      isSpinning={isSpinning}
                    />

                    {isAdmin && !isSpinning && (
                      <Button
                        variant="glow"
                        size="xl"
                        onClick={handleSpin}
                        className="mt-8"
                      >
                        <Play className="w-5 h-5" />
                        Start the Spin!
                      </Button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Payment Form Modal */}
      <AnimatePresence>
        {showPaymentForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-card p-6 max-w-md w-full"
            >
              <h3 className="font-display text-xl font-bold mb-4">Submit Payment</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Pay ₹{(fund.monthly_contribution / fund.member_count).toLocaleString()} to the admin, 
                then add a note below.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Payment Note</label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full h-24 px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder="e.g., Paid via UPI - Transaction ID: ABC123"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1"
                  onClick={handlePaymentSubmit}
                >
                  Submit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MiaAssistant />
    </div>
  );
};

export default PotDetails;
