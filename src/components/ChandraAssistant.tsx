import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Moon, Star, Sparkles, TrendingUp, Coins, HelpCircle, Heart, PartyPopper, Trophy, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Mood = 'happy' | 'thinking' | 'celebrating' | 'waving' | 'idle' | 'excited' | 'proud' | 'love';

const chandraResponses: Record<string, { text: string; mood: Mood }> = {
  'hello': { text: "Namaste! 🙏 I'm Chandra, your friendly pot assistant! Ready to help you grow your savings! ✨", mood: 'waving' },
  'hi': { text: "Hey there! 🌙 Chandra here! What can I help you with today?", mood: 'happy' },
  'help': { text: "I'm here to help you! 💫\n\n• 🏦 Setup your fund\n• 💰 Track payments\n• 📊 View summaries\n• 💡 Suggest fund names\n\nJust ask me anything!", mood: 'happy' },
  'setup': { text: "To setup your fund:\n\n1️⃣ Click 'Create New Pot'\n2️⃣ Name your pot (I can suggest names!)\n3️⃣ Set contribution & duration\n4️⃣ Share the join code!\n\nNeed a name suggestion? Just ask! 🎯", mood: 'thinking' },
  'name': { text: "Ooh, naming time! 🌟 Here are some ideas:\n\n• 'Golden Circle'\n• 'Unity Pot'\n• 'Dream Builders'\n• 'Fortune Friends'\n• 'Money Monsoon'\n\nWant more? Just say 'more names'! 💫", mood: 'celebrating' },
  'more names': { text: "More creative names! ✨\n\n• 'Lakshmi Blessings'\n• 'Wealth Warriors'\n• 'Savings Squad'\n• 'Prosperity Pool'\n• 'Growth Garden'\n\nPick one you love! 🎉", mood: 'happy' },
  'payment': { text: "Payment tracking made easy! 💸\n\n1. Go to your pot details\n2. Click 'Submit Payment'\n3. Add payment proof\n4. Wait for approval ✅\n\nI'll celebrate when it's approved! 🎊", mood: 'thinking' },
  'approved': { text: "🎉 YAYYY! Payment Approved! 🎉\n\nYour payment has been verified! Keep up the great work, savings superstar! 💪✨\n\nYou're one step closer to your goals! 🌟", mood: 'excited' },
  'track': { text: "To track your payments:\n\n📊 Check your pot's dashboard\n💰 See pending & approved\n📅 View payment history\n\nEverything at a glance! 👀", mood: 'happy' },
  'summary': { text: "Here's what I can tell you:\n\n🎯 Your pot progress\n💰 Total collected\n👥 Member status\n🏆 Past winners\n\nGo to Pot Details for full stats! 📈", mood: 'thinking' },
  'spin': { text: "The magical spin! 🎡✨\n\nEvery month, one lucky member wins the pot! The wheel spins fairly for everyone who hasn't won yet.\n\nMay fortune favor you! 🌟", mood: 'celebrating' },
  'winner': { text: "🏆🎊 WE HAVE A WINNER! 🎊🏆\n\nCongratulations to the lucky winner! The pot is yours this month!\n\nEveryone celebrate! 🎉💃🕺", mood: 'excited' },
  'win': { text: "🎉 CONGRATULATIONS! 🎉\n\nWinning feels amazing! The pot money is all yours this month! Use it wisely and keep contributing! 💪", mood: 'celebrating' },
  'congratulations': { text: "🥳 Woohoo! This calls for a celebration! 🎊\n\nI'm so happy for you! Keep shining bright like a star! ⭐💖", mood: 'love' },
  'thank': { text: "Aww, you're so sweet! 💕\n\nI love helping you! It makes my heart happy! 🌸✨\n\nAnything else I can help with?", mood: 'love' },
  'chitti': { text: "Chitti is magical! 🌙\n\n1️⃣ Friends contribute monthly\n2️⃣ Pool the money together\n3️⃣ One person wins each month\n4️⃣ Everyone wins once!\n\nTogether we grow! 🌱", mood: 'happy' },
  'default': { text: "Hmm, let me think... 🤔\n\nI can help with:\n• 🏦 Fund setup\n• 💰 Payment tracking\n• 📊 Summaries\n• 💡 Name suggestions\n\nTry asking about these! ✨", mood: 'thinking' },
};

// Cute girl Chandra face component with more expressions
const ChandraFace = ({ mood, size = 'large' }: { mood: Mood; size?: 'small' | 'large' }) => {
  const baseSize = size === 'large' ? 'w-16 h-16' : 'w-10 h-10';
  
  // Hair color
  const hairGradient = 'from-purple-900 via-purple-800 to-purple-900';
  
  // Face animations based on mood
  const faceAnimation = () => {
    switch (mood) {
      case 'waving': return { rotate: [0, -10, 10, -10, 0] };
      case 'celebrating': return { scale: [1, 1.1, 1], y: [0, -8, 0] };
      case 'excited': return { scale: [1, 1.15, 0.95, 1.1, 1], y: [0, -10, 0, -5, 0], rotate: [0, 5, -5, 3, 0] };
      case 'thinking': return { rotate: [0, 5, 0, -5, 0] };
      case 'love': return { scale: [1, 1.05, 1], y: [0, -3, 0] };
      case 'proud': return { y: [0, -5, 0], scale: [1, 1.08, 1] };
      default: return { y: [0, -2, 0] };
    }
  };

  const animationDuration = mood === 'celebrating' || mood === 'excited' ? 0.6 : 2;
  
  return (
    <motion.div 
      className={`${baseSize} relative`}
      animate={faceAnimation()}
      transition={{ duration: animationDuration, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Hair - back layer */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-b ${hairGradient} scale-110`} />
      
      {/* Face */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-amber-200 via-amber-100 to-amber-200 shadow-inner">
        {/* Hair bangs */}
        <div className={`absolute -top-0.5 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-b-full bg-gradient-to-b ${hairGradient}`} />
        <div className={`absolute top-0 left-1 w-3 h-4 rounded-b-full bg-gradient-to-b ${hairGradient} rotate-12`} />
        <div className={`absolute top-0 right-1 w-3 h-4 rounded-b-full bg-gradient-to-b ${hairGradient} -rotate-12`} />
        
        {/* Eyes */}
        <motion.div 
          className={`absolute ${size === 'large' ? 'top-6 left-3' : 'top-3.5 left-2'} ${size === 'large' ? 'w-2.5 h-3' : 'w-1.5 h-2'} rounded-full bg-gray-800`}
          animate={
            mood === 'happy' || mood === 'celebrating' || mood === 'love' || mood === 'excited'
              ? { scaleY: [1, 0.2, 1] }
              : mood === 'thinking'
              ? { x: [0, 2, 0] }
              : {}
          }
          transition={{ duration: 0.3, repeat: mood === 'celebrating' || mood === 'excited' ? Infinity : 0, repeatDelay: mood === 'excited' ? 0.5 : 2 }}
        >
          {/* Eye shine */}
          <div className={`absolute ${size === 'large' ? 'top-0.5 left-0.5 w-1 h-1' : 'top-0 left-0 w-0.5 h-0.5'} rounded-full bg-white`} />
        </motion.div>
        <motion.div 
          className={`absolute ${size === 'large' ? 'top-6 right-3' : 'top-3.5 right-2'} ${size === 'large' ? 'w-2.5 h-3' : 'w-1.5 h-2'} rounded-full bg-gray-800`}
          animate={
            mood === 'happy' || mood === 'celebrating' || mood === 'love' || mood === 'excited'
              ? { scaleY: [1, 0.2, 1] }
              : mood === 'thinking'
              ? { x: [0, 2, 0] }
              : {}
          }
          transition={{ duration: 0.3, repeat: mood === 'celebrating' || mood === 'excited' ? Infinity : 0, repeatDelay: mood === 'excited' ? 0.5 : 2 }}
        >
          {/* Eye shine */}
          <div className={`absolute ${size === 'large' ? 'top-0.5 left-0.5 w-1 h-1' : 'top-0 left-0 w-0.5 h-0.5'} rounded-full bg-white`} />
        </motion.div>
        
        {/* Heart eyes for love mood */}
        {mood === 'love' && (
          <>
            <motion.div 
              className={`absolute ${size === 'large' ? 'top-5 left-2' : 'top-3 left-1.5'}`}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Heart className={`${size === 'large' ? 'w-4 h-4' : 'w-2.5 h-2.5'} text-pink-500 fill-pink-500`} />
            </motion.div>
            <motion.div 
              className={`absolute ${size === 'large' ? 'top-5 right-2' : 'top-3 right-1.5'}`}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
            >
              <Heart className={`${size === 'large' ? 'w-4 h-4' : 'w-2.5 h-2.5'} text-pink-500 fill-pink-500`} />
            </motion.div>
          </>
        )}
        
        {/* Blush */}
        <motion.div 
          className={`absolute ${size === 'large' ? 'top-8 left-1.5' : 'top-5 left-1'} ${size === 'large' ? 'w-2.5 h-1.5' : 'w-1.5 h-1'} rounded-full bg-pink-300/70`}
          animate={mood === 'love' || mood === 'excited' ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.div 
          className={`absolute ${size === 'large' ? 'top-8 right-1.5' : 'top-5 right-1'} ${size === 'large' ? 'w-2.5 h-1.5' : 'w-1.5 h-1'} rounded-full bg-pink-300/70`}
          animate={mood === 'love' || mood === 'excited' ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Mouth */}
        <motion.div 
          className={`absolute ${size === 'large' ? 'bottom-3 left-1/2' : 'bottom-2 left-1/2'} -translate-x-1/2`}
          animate={mood === 'excited' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          {mood === 'excited' || mood === 'celebrating' ? (
            // Big open smile for excited/celebrating
            <div className={`${size === 'large' ? 'w-5 h-3' : 'w-3 h-2'} rounded-b-full bg-gray-800 relative overflow-hidden`}>
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${size === 'large' ? 'w-3 h-1.5' : 'w-2 h-1'} rounded-t-full bg-pink-400`} />
            </div>
          ) : mood === 'thinking' ? (
            // Wavy thinking mouth
            <div className={`${size === 'large' ? 'w-4 h-1' : 'w-2.5 h-0.5'} rounded-full bg-gray-700`} />
          ) : (
            // Regular happy smile
            <div 
              className={`${size === 'large' ? 'w-4 h-2' : 'w-2.5 h-1'} rounded-b-full bg-gray-800`}
              style={{ borderRadius: '0 0 50% 50%' }}
            />
          )}
        </motion.div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-md -z-10" />
      
      {/* Decorative elements based on mood */}
      {(mood === 'celebrating' || mood === 'excited') && (
        <>
          <motion.div
            className="absolute -top-3 -right-1"
            animate={{ rotate: 360, scale: [0.8, 1.3, 0.8], y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </motion.div>
          <motion.div
            className="absolute -top-2 -left-2"
            animate={{ rotate: -360, scale: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -right-2"
            animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <PartyPopper className="w-3 h-3 text-pink-500" />
          </motion.div>
        </>
      )}
      
      {mood === 'love' && (
        <>
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -8, 0], scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
          </motion.div>
        </>
      )}
      
      {mood === 'proud' && (
        <>
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-4 h-4 text-yellow-500" />
          </motion.div>
        </>
      )}

      {mood === 'waving' && (
        <motion.div
          className="absolute -right-3 top-1/2"
          animate={{ rotate: [0, 20, -10, 20, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <span className="text-lg">👋</span>
        </motion.div>
      )}
    </motion.div>
  );
};

// Quick action buttons
const QuickActions = ({ onAction }: { onAction: (text: string) => void }) => (
  <div className="flex flex-wrap gap-2 p-3 border-b border-border">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onAction('setup')}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20"
    >
      <TrendingUp className="w-3 h-3" />
      Setup Fund
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onAction('payment')}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20"
    >
      <Coins className="w-3 h-3" />
      Payments
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onAction('name')}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20"
    >
      <Sparkles className="w-3 h-3" />
      Suggest Names
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onAction('help')}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20"
    >
      <HelpCircle className="w-3 h-3" />
      Help
    </motion.button>
  </div>
);

const ChandraAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState<Mood>('idle');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Namaste! 🙏 I'm Chandra, your pot buddy! ✨\n\nI can help you setup funds, track payments, and even suggest cool names! What would you like to do?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Idle animation cycle
  useEffect(() => {
    if (!isTyping && messages.length > 0) {
      const timer = setTimeout(() => setCurrentMood('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  // Trigger celebration animation
  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const processMessage = (userMessage: string) => {
    const lowerInput = userMessage.toLowerCase();
    let response = chandraResponses.default;
    
    // Check for celebration triggers
    const celebrationTriggers = ['approved', 'winner', 'won', 'congratulations', 'congrats'];
    const shouldCelebrate = celebrationTriggers.some(trigger => lowerInput.includes(trigger));
    
    for (const [key, value] of Object.entries(chandraResponses)) {
      if (lowerInput.includes(key)) {
        response = value;
        break;
      }
    }
    
    if (shouldCelebrate) {
      triggerCelebration();
    }
    
    return response;
  };

  // Public method to trigger reactions from parent components
  const triggerReaction = (type: 'paymentApproved' | 'spinWinner' | 'newMember') => {
    switch (type) {
      case 'paymentApproved':
        setCurrentMood('excited');
        triggerCelebration();
        setMessages(prev => [...prev, { text: chandraResponses.approved.text, isUser: false }]);
        break;
      case 'spinWinner':
        setCurrentMood('excited');
        triggerCelebration();
        setMessages(prev => [...prev, { text: chandraResponses.winner.text, isUser: false }]);
        break;
      case 'newMember':
        setCurrentMood('love');
        setMessages(prev => [...prev, { text: "Welcome to the family! 🎉💕\n\nSo excited to have a new member! Let's grow together! ✨", isUser: false }]);
        break;
    }
    if (!isOpen) setIsOpen(true);
  };

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    setMessages(prev => [...prev, { text: messageText, isUser: true }]);
    setInput('');
    setIsTyping(true);
    setCurrentMood('thinking');

    setTimeout(() => {
      const response = processMessage(messageText);
      setCurrentMood(response.mood);
      setMessages(prev => [...prev, { text: response.text, isUser: false }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Confetti Celebration Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  top: '100%', 
                  left: `${Math.random() * 100}%`,
                  rotate: 0,
                  scale: 0
                }}
                animate={{ 
                  top: '-10%', 
                  rotate: Math.random() * 720 - 360,
                  scale: [0, 1, 0.8]
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  ease: 'easeOut',
                  delay: Math.random() * 0.5
                }}
              >
                {i % 5 === 0 ? (
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ) : i % 5 === 1 ? (
                  <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                ) : i % 5 === 2 ? (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                ) : i % 5 === 3 ? (
                  <Gift className="w-3 h-3 text-purple-500" />
                ) : (
                  <div className={`w-3 h-3 rounded-full ${['bg-pink-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]}`} />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chandra Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-1 rounded-full shadow-xl shadow-purple-500/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <motion.div 
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center"
            initial={{ rotate: 0 }}
            animate={{ rotate: 180 }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.div>
        ) : (
          <ChandraFace mood={currentMood} size="small" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header with Chandra */}
            <div className="bg-gradient-to-r from-purple-500 via-purple-400 to-pink-400 p-4 flex items-center gap-4 relative overflow-hidden">
              {/* Sparkle background */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                    animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
                  >
                    <Star className="w-2 h-2 text-white fill-white" />
                  </motion.div>
                ))}
              </div>
              <ChandraFace mood={currentMood} size="large" />
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-white text-lg">Chandra</h4>
                  <Moon className="w-4 h-4 text-purple-100" />
                </div>
                <p className="text-xs text-purple-100">Your Pot Buddy ✨</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-purple-100">
                    {isTyping ? 'Thinking...' : currentMood === 'excited' ? '🎉 Celebrating!' : 'Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActions onAction={handleSend} />

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-purple-50/5 to-transparent">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                      msg.isUser
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-foreground rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-3 rounded-2xl rounded-bl-sm">
                    <motion.div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-purple-500"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Chandra anything..."
                className="flex-1 bg-secondary rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <Button 
                size="icon" 
                onClick={() => handleSend()}
                className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChandraAssistant;
