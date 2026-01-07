import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Mail, Lock, User, Phone, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname === '/signup';
  const { setCurrentUser } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'member' as 'admin' | 'member',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mock user
    const user = {
      id: Math.random().toString(36).substring(2, 11),
      name: formData.name || 'Demo User',
      email: formData.email,
      phone: formData.phone,
      isVerified: true,
      role: formData.role,
      createdAt: new Date(),
    };

    setCurrentUser(user);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col px-6 py-8 lg:px-16">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </motion.button>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Sprout className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">
                  {isSignup ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isSignup ? 'Start your savings journey' : 'Log in to your account'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-12 pl-11 pr-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Enter your full name"
                      required={isSignup}
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full h-12 pl-11 pr-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full h-12 pl-11 pr-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full h-12 pl-11 pr-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {isSignup && (
                <div>
                  <label className="block text-sm font-medium mb-2">I want to</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.role === 'admin'
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-secondary hover:border-primary/50'
                      }`}
                    >
                      <Shield className={`w-5 h-5 mb-2 ${formData.role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="font-medium text-sm">Create Pots</p>
                      <p className="text-xs text-muted-foreground">As an Admin</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'member' }))}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.role === 'member'
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-secondary hover:border-primary/50'
                      }`}
                    >
                      <User className={`w-5 h-5 mb-2 ${formData.role === 'member' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="font-medium text-sm">Join Pots</p>
                      <p className="text-xs text-muted-foreground">As a Member</p>
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" variant="hero" size="lg" className="w-full mt-6">
                {isSignup ? 'Create Account' : 'Log In'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-primary hover:underline"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center gradient-dark relative">
        <div className="absolute inset-0 gradient-radial" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 max-w-md text-center px-8"
        >
          <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 glow-effect">
            <Sprout className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">
            Your Digital{' '}
            <span className="text-gradient">Chitti</span>
            {' '}Fund
          </h2>
          <p className="text-muted-foreground">
            Transform your community savings with transparent ledgers, 
            fair auctions, and seamless payment tracking.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
