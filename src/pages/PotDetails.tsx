import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Users, Wallet, Calendar, Copy, Check, 
  Play, Upload, Trophy, Clock, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useFunds, useFundMembers, usePayments, useSpinResults, Fund } from '@/hooks/useFunds';
import SpinningWheel from '@/components/SpinningWheel';
import MiaAssistant from '@/components/MiaAssistant';

type TabType = 'overview' | 'members' | 'payments' | 'spin';

const PotDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { getFund, updateFund } = useFunds();
  const { members, loading: membersLoading, verifyMember, markWinner, refetch: refetchMembers } = useFundMembers(id);
  const { payments, loading: paymentsLoading, submitPayment, approvePayment, refetch: refetchPayments } = usePayments(id);
  const { recordSpin, refetch: refetchSpins } = useSpinResults(id);
  
  const [fund, setFund] = useState<Fund | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchFundData = async () => {
      if (!id) return;
      const { data } = await getFund(id);
      setFund(data);
      setLoading(false);
    };
    fetchFundData();
  }, [id]);

  if (loading || authLoading || membersLoading) {
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

  const isAdmin = fund.admin_id === user.id;
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
    
    const winAmount = fund.monthly_contribution * (1 - Number(fund.admin_commission) / 100);
    
    await recordSpin({
      month: fund.current_month,
      winner_id: winner.id,
      amount: winAmount,
    });

    await markWinner(winner.id, fund.current_month);
    
    await updateFund(fund.id, { current_month: fund.current_month + 1 });
    
    // Refresh data
    const { data } = await getFund(fund.id);
    setFund(data);
    await refetchMembers();
    await refetchSpins();
  };

  const handlePaymentSubmit = async () => {
    setSubmittingPayment(true);
    
    await submitPayment({
      month: fund.current_month,
      amount: fund.monthly_contribution / fund.member_count,
      proof_text: paymentNote,
    });

    setSubmittingPayment(false);
    setShowPaymentForm(false);
    setPaymentNote('');
    await refetchPayments();
  };

  const handleVerifyMember = async (memberId: string) => {
    await verifyMember(memberId);
  };

  const handleApprovePayment = async (paymentId: string) => {
    await approvePayment(paymentId);
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'payments', label: 'Payments', icon: Calendar },
    { id: 'spin', label: 'Spin', icon: Trophy },
  ];

  const progress = (fund.current_month / fund.duration) * 100;
  const verifiedMembers = members.filter(m => m.is_verified).length;

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
                {/* Status Card */}
                <div className="glass-card p-6 glow-effect">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display text-xl font-bold">{fund.name}</h3>
                      <p className="text-sm text-muted-foreground">Month {fund.current_month} of {fund.duration}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full gradient-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{verifiedMembers}</p>
                      <p className="text-xs text-muted-foreground">Members</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{fund.duration - fund.current_month + 1}</p>
                      <p className="text-xs text-muted-foreground">Left</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{members.filter(m => m.has_won).length}</p>
                      <p className="text-xs text-muted-foreground">Winners</p>
                    </div>
                  </div>
                </div>
                
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
                      <div key={member.id} className="glass-card p-4 flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary">
                            {member.profile?.full_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          {member.has_won && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                              <Trophy className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{member.profile?.full_name || 'Unknown'}</h4>
                            {member.is_verified ? (
                              <Check className="w-4 h-4 text-success flex-shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-warning flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{member.profile?.phone || 'No phone'}</p>
                          {member.has_won && member.won_month && (
                            <p className="text-xs text-primary mt-1">
                              Won in Month {member.won_month}
                            </p>
                          )}
                        </div>

                        {isAdmin && !member.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyMember(member.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        )}
                      </div>
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
                      const statusConfig = {
                        pending: { color: 'text-warning', bg: 'bg-warning/10', label: 'Pending' },
                        approved: { color: 'text-success', bg: 'bg-success/10', label: 'Approved' },
                        rejected: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Rejected' },
                      };
                      const status = statusConfig[payment.status as keyof typeof statusConfig];

                      return (
                        <div key={payment.id} className="glass-card p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{member?.profile?.full_name || 'Unknown'}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                                  {status.label}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Month {payment.month} • ₹{payment.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(payment.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {payment.proof_text && (
                            <p className="text-sm text-muted-foreground mt-3 p-2 bg-secondary/50 rounded-lg">
                              "{payment.proof_text}"
                            </p>
                          )}

                          {isAdmin && payment.status === 'pending' && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprovePayment(payment.id)}
                                className="flex-1"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
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
                  disabled={submittingPayment}
                >
                  {submittingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
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
