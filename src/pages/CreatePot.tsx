import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sprout, Users, Calendar, Wallet, Percent, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';

const CreatePot = () => {
  const navigate = useNavigate();
  const { currentUser, createFund } = useAppStore();
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [createdFund, setCreatedFund] = useState<{ joinCode: string; id: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    totalAmount: 100000,
    duration: 10,
    memberCount: 10,
    adminCommission: 2,
  });

  const monthlyContribution = formData.totalAmount / formData.duration;

  const handleCreate = () => {
    if (!currentUser) return;

    const fund = createFund({
      name: formData.name,
      totalAmount: formData.totalAmount,
      monthlyContribution,
      duration: formData.duration,
      memberCount: formData.memberCount,
      adminId: currentUser.id,
      adminCommission: formData.adminCommission,
    });

    setCreatedFund({ joinCode: fund.joinCode, id: fund.id });
    setStep(3);
  };

  const copyCode = () => {
    if (createdFund) {
      navigator.clipboard.writeText(createdFund.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </motion.button>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-12"
        >
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s <= step 
                  ? 'gradient-primary text-primary-foreground' 
                  : 'bg-secondary text-muted-foreground'
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`hidden sm:block text-sm ${s <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Review' : 'Share'}
              </span>
              {s < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </motion.div>

        {/* Step 1: Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Sprout className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Create Your Pot</h1>
                <p className="text-sm text-muted-foreground">Set up your community savings fund</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Pot Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-12 px-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g., Family Savings 2026"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Wallet className="w-4 h-4 text-primary" />
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseInt(e.target.value) || 0 }))}
                    className="w-full h-12 px-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    className="w-full h-12 px-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    min={1}
                    max={24}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    Number of Members
                  </label>
                  <input
                    type="number"
                    value={formData.memberCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, memberCount: parseInt(e.target.value) || 1 }))}
                    className="w-full h-12 px-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    min={2}
                    max={50}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Percent className="w-4 h-4 text-primary" />
                    Admin Commission (%)
                  </label>
                  <input
                    type="number"
                    value={formData.adminCommission}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminCommission: parseFloat(e.target.value) || 0 }))}
                    className="w-full h-12 px-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    min={0}
                    max={10}
                    step={0.5}
                  />
                </div>
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full mt-4"
                onClick={() => setStep(2)}
                disabled={!formData.name}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="font-display text-2xl font-bold mb-2">Review Your Pot</h1>
            <p className="text-muted-foreground mb-8">Make sure everything looks correct</p>

            <div className="glass-card p-6 mb-6">
              <h3 className="font-display text-xl font-bold mb-6">{formData.name}</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Total Pool</span>
                  <span className="font-semibold">₹{formData.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold">{formData.duration} months</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-semibold">{formData.memberCount} people</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Monthly Contribution</span>
                  <span className="font-semibold text-primary">₹{monthlyContribution.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Your Commission</span>
                  <span className="font-semibold">{formData.adminCommission}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="hero" size="lg" className="flex-1" onClick={handleCreate}>
                Create Pot
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && createdFund && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 glow-effect"
            >
              <Check className="w-10 h-10 text-primary-foreground" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold mb-2">Pot Created! 🎉</h1>
            <p className="text-muted-foreground mb-8">Share this code with your members</p>

            <div className="glass-card p-6 max-w-sm mx-auto mb-8">
              <p className="text-sm text-muted-foreground mb-3">Join Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-bold tracking-widest text-gradient">
                  {createdFund.joinCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button variant="hero" size="lg" onClick={() => navigate(`/pot/${createdFund.id}`)}>
                View Your Pot
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CreatePot;
