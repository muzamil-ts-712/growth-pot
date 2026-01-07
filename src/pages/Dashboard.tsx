import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, Plus, Users, TrendingUp, Copy, Check, 
  LogOut, Wallet, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import MiaAssistant from '@/components/MiaAssistant';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, funds, setCurrentUser } = useAppStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const userFunds = funds.filter(f => 
    f.adminId === currentUser.id || 
    f.members.some(m => m.userId === currentUser.id)
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Growth Pot</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold mb-2">
              Welcome back, {currentUser.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              {userFunds.length > 0 
                ? `You're part of ${userFunds.length} pot${userFunds.length > 1 ? 's' : ''}`
                : 'Get started by creating or joining a pot'
              }
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass-card p-4">
              <Wallet className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold">
                ₹{userFunds.reduce((sum, f) => sum + f.monthlyContribution, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Monthly Contributions</p>
            </div>
            <div className="glass-card p-4">
              <Users className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{userFunds.length}</p>
              <p className="text-xs text-muted-foreground">Active Pots</p>
            </div>
            <div className="glass-card p-4">
              <Calendar className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold">
                {userFunds.filter(f => f.status === 'active').length}
              </p>
              <p className="text-xs text-muted-foreground">Ongoing</p>
            </div>
            <div className="glass-card p-4">
              <TrendingUp className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold">
                ₹{userFunds.reduce((sum, f) => sum + f.totalAmount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Pool</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            {currentUser.role === 'admin' && (
              <Button variant="hero" onClick={() => navigate('/create-pot')}>
                <Plus className="w-4 h-4" />
                Create New Pot
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/join')}>
              <Users className="w-4 h-4" />
              Join a Pot
            </Button>
          </motion.div>

          {/* Pots List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-xl font-semibold mb-4">Your Pots</h2>
            
            {userFunds.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Sprout className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">No pots yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first pot or join an existing one to get started
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {currentUser.role === 'admin' && (
                    <Button variant="hero" onClick={() => navigate('/create-pot')}>
                      <Plus className="w-4 h-4" />
                      Create Pot
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => navigate('/join')}>
                    Join Pot
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFunds.map((fund, index) => {
                  const isAdmin = fund.adminId === currentUser.id;
                  const verifiedMembers = fund.members.filter(m => m.isVerified).length;
                  const progress = (fund.currentMonth / fund.duration) * 100;

                  return (
                    <motion.div
                      key={fund.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="glass-card p-5 hover:glow-effect transition-all cursor-pointer"
                      onClick={() => navigate(`/pot/${fund.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-display font-semibold text-lg">{fund.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {isAdmin ? 'Admin' : 'Member'} • Month {fund.currentMonth}/{fund.duration}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          fund.status === 'active' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {fund.status}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full gradient-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{verifiedMembers}/{fund.memberCount}</span>
                        </div>
                        <span className="font-semibold text-primary">
                          ₹{fund.monthlyContribution.toLocaleString()}/mo
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Join Code:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCode(fund.joinCode);
                            }}
                            className="flex items-center gap-1 text-xs font-mono bg-secondary px-2 py-1 rounded hover:bg-secondary/80"
                          >
                            {fund.joinCode}
                            {copiedCode === fund.joinCode ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <MiaAssistant />
    </div>
  );
};

export default Dashboard;
