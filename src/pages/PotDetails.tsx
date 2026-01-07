import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Users, Wallet, Calendar, Copy, Check, 
  Play, Upload, Trophy, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import PotStatusCard from '@/components/PotStatusCard';
import MemberCard from '@/components/MemberCard';
import PaymentCard from '@/components/PaymentCard';
import SpinningWheel from '@/components/SpinningWheel';
import MiaAssistant from '@/components/MiaAssistant';

type TabType = 'overview' | 'members' | 'payments' | 'spin';

const PotDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser, getFund, verifyMember, payments, approvePayment, recordSpin, submitPayment } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');

  const fund = getFund(id || '');

  if (!fund || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Pot not found</p>
      </div>
    );
  }

  const isAdmin = fund.adminId === currentUser.id;
  const fundPayments = payments.filter(p => p.fundId === fund.id);
  const currentMonthPayments = fundPayments.filter(p => p.month === fund.currentMonth);
  const approvedAmount = currentMonthPayments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const eligibleForSpin = fund.members.filter(m => m.isVerified && !m.hasWon);

  const copyCode = () => {
    navigator.clipboard.writeText(fund.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpin = () => {
    if (eligibleForSpin.length > 0) {
      setIsSpinning(true);
    }
  };

  const handleSpinComplete = (winner: { id: string; name: string }) => {
    setIsSpinning(false);
    recordSpin({
      fundId: fund.id,
      month: fund.currentMonth,
      winnerId: winner.id,
      winnerName: winner.name,
      amount: fund.monthlyContribution * (1 - fund.adminCommission / 100),
    });
  };

  const handlePaymentSubmit = () => {
    submitPayment({
      memberId: currentUser.id,
      fundId: fund.id,
      month: fund.currentMonth,
      amount: fund.monthlyContribution / fund.memberCount,
      proofText: paymentNote,
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
              {fund.joinCode}
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
                <PotStatusCard fund={fund} collectedAmount={approvedAmount} />
                
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
                    Members ({fund.members.length}/{fund.memberCount})
                  </h2>
                </div>

                {fund.members.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No members yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your join code to invite members
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fund.members.map((member) => (
                      <MemberCard
                        key={member.userId}
                        member={member}
                        isAdmin={isAdmin}
                        onVerify={(userId) => verifyMember(fund.id, userId)}
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
                    Month {fund.currentMonth} Payments
                  </h2>
                  {!isAdmin && (
                    <Button onClick={() => setShowPaymentForm(true)}>
                      <Upload className="w-4 h-4" />
                      Submit Payment
                    </Button>
                  )}
                </div>

                {fundPayments.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No payments yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Payments will appear here once submitted
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fundPayments.map((payment) => {
                      const member = fund.members.find(m => m.userId === payment.memberId);
                      return (
                        <PaymentCard
                          key={payment.id}
                          payment={payment}
                          memberName={member?.user.name || 'Unknown'}
                          isAdmin={isAdmin}
                          onApprove={approvePayment}
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
                  Month {fund.currentMonth} Auction
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
                      members={eligibleForSpin.map(m => ({ id: m.userId, name: m.user.name }))}
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
                Pay ₹{(fund.monthlyContribution / fund.memberCount).toLocaleString()} to the admin, 
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
