import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';

const JoinPot = () => {
  const navigate = useNavigate();
  const { currentUser, joinFund } = useAppStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [joinedFundId, setJoinedFundId] = useState<string | null>(null);

  const handleJoin = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    const fund = joinFund(code.toUpperCase(), currentUser);
    
    if (fund) {
      setSuccess(true);
      setJoinedFundId(fund.id);
      setError('');
    } else {
      setError('Invalid code. Please check and try again.');
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.toUpperCase().slice(0, 6));
    setError('');
  };

  if (success && joinedFundId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 glow-effect"
          >
            <Check className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <h1 className="font-display text-3xl font-bold mb-2">Request Sent! 🎉</h1>
          <p className="text-muted-foreground mb-8">
            Your join request has been sent to the pot admin. 
            You'll be notified once you're verified.
          </p>

          <div className="flex flex-col gap-3">
            <Button variant="hero" size="lg" onClick={() => navigate(`/pot/${joinedFundId}`)}>
              View Pot
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-md mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">Join a Pot</h1>
          <p className="text-muted-foreground mb-10">
            Enter the 6-digit code shared by the pot admin
          </p>

          {/* Code Input */}
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-mono font-bold transition-colors ${
                    code[i] 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-secondary'
                  }`}
                >
                  {code[i] || ''}
                </div>
              ))}
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="sr-only"
              autoFocus
              maxLength={6}
            />
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center font-mono text-lg uppercase tracking-widest"
              placeholder="Enter code"
              maxLength={6}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-destructive text-sm mb-4"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <Button 
            variant="hero" 
            size="lg" 
            className="w-full"
            onClick={handleJoin}
            disabled={code.length !== 6}
          >
            Join Pot
          </Button>

          <p className="text-xs text-muted-foreground mt-6">
            Don't have a code? Ask your pot admin to share it with you.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinPot;
