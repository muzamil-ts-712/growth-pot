import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Moon, Star, Sparkles, TrendingUp, Users, Coins, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Mood = 'happy' | 'thinking' | 'celebrating' | 'waving' | 'idle';

const chandraResponses: Record<string, { text: string; mood: Mood }> = {
  'hello': { text: "Namaste! 🙏 I'm Chandra, your friendly pot assistant! Ready to help you grow your savings! ✨", mood: 'waving' },
  'hi': { text: "Hey there! 🌙 Chandra here! What can I help you with today?", mood: 'happy' },
  'help': { text: "I'm here to help you! 💫\n\n• 🏦 Setup your fund\n• 💰 Track payments\n• 📊 View summaries\n• 💡 Suggest fund names\n\nJust ask me anything!", mood: 'happy' },
  'setup': { text: "To setup your fund:\n\n1️⃣ Click 'Create New Pot'\n2️⃣ Name your pot (I can suggest names!)\n3️⃣ Set contribution & duration\n4️⃣ Share the join code!\n\nNeed a name suggestion? Just ask! 🎯", mood: 'thinking' },
  'name': { text: "Ooh, naming time! 🌟 Here are some ideas:\n\n• 'Golden Circle'\n• 'Unity Pot'\n• 'Dream Builders'\n• 'Fortune Friends'\n• 'Money Monsoon'\n\nWant more? Just say 'more names'! 💫", mood: 'celebrating' },
  'more names': { text: "More creative names! ✨\n\n• 'Lakshmi Blessings'\n• 'Wealth Warriors'\n• 'Savings Squad'\n• 'Prosperity Pool'\n• 'Growth Garden'\n\nPick one you love! 🎉", mood: 'happy' },
  'payment': { text: "Payment tracking made easy! 💸\n\n1. Go to your pot details\n2. Click 'Submit Payment'\n3. Add payment proof\n4. Wait for approval ✅\n\nI'll celebrate when it's approved! 🎊", mood: 'thinking' },
  'track': { text: "To track your payments:\n\n📊 Check your pot's dashboard\n💰 See pending & approved\n📅 View payment history\n\nEverything at a glance! 👀", mood: 'happy' },
  'summary': { text: "Here's what I can tell you:\n\n🎯 Your pot progress\n💰 Total collected\n👥 Member status\n🏆 Past winners\n\nGo to Pot Details for full stats! 📈", mood: 'thinking' },
  'spin': { text: "The magical spin! 🎡✨\n\nEvery month, one lucky member wins the pot! The wheel spins fairly for everyone who hasn't won yet.\n\nMay fortune favor you! 🌟", mood: 'celebrating' },
  'win': { text: "🎉 CONGRATULATIONS! 🎉\n\nWinning feels amazing! The pot money is all yours this month! Use it wisely and keep contributing! 💪", mood: 'celebrating' },
  'chitti': { text: "Chitti is magical! 🌙\n\n1️⃣ Friends contribute monthly\n2️⃣ Pool the money together\n3️⃣ One person wins each month\n4️⃣ Everyone wins once!\n\nTogether we grow! 🌱", mood: 'happy' },
  'default': { text: "Hmm, let me think... 🤔\n\nI can help with:\n• 🏦 Fund setup\n• 💰 Payment tracking\n• 📊 Summaries\n• 💡 Name suggestions\n\nTry asking about these! ✨", mood: 'thinking' },
};

// Cute animated Chandra face component
const ChandraFace = ({ mood, size = 'large' }: { mood: Mood; size?: 'small' | 'large' }) => {
  const baseSize = size === 'large' ? 'w-16 h-16' : 'w-10 h-10';
  const eyeSize = size === 'large' ? 'w-2 h-2' : 'w-1.5 h-1.5';
  const mouthSize = size === 'large' ? 'w-4' : 'w-3';
  
  return (
    <motion.div 
      className={`${baseSize} rounded-full bg-gradient-to-br from-amber-300 to-orange-400 relative shadow-lg`}
      animate={
        mood === 'waving' ? { rotate: [0, -10, 10, -10, 0] } :
        mood === 'celebrating' ? { scale: [1, 1.1, 1], y: [0, -5, 0] } :
        mood === 'thinking' ? { rotate: [0, 5, 0, -5, 0] } :
        { y: [0, -2, 0] }
      }
      transition={{ duration: mood === 'celebrating' ? 0.5 : 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md -z-10" />
      
      {/* Eyes */}
      <motion.div 
        className={`absolute ${size === 'large' ? 'top-5 left-4' : 'top-3 left-2.5'} ${eyeSize} rounded-full bg-gray-800`}
        animate={mood === 'happy' || mood === 'celebrating' ? { scaleY: [1, 0.2, 1] } : {}}
        transition={{ duration: 0.3, repeat: mood === 'celebrating' ? Infinity : 0, repeatDelay: 2 }}
      />
      <motion.div 
        className={`absolute ${size === 'large' ? 'top-5 right-4' : 'top-3 right-2.5'} ${eyeSize} rounded-full bg-gray-800`}
        animate={mood === 'happy' || mood === 'celebrating' ? { scaleY: [1, 0.2, 1] } : {}}
        transition={{ duration: 0.3, repeat: mood === 'celebrating' ? Infinity : 0, repeatDelay: 2 }}
      />
      
      {/* Blush */}
      <div className={`absolute ${size === 'large' ? 'top-7 left-2' : 'top-4 left-1'} w-2 h-1 rounded-full bg-pink-300/60`} />
      <div className={`absolute ${size === 'large' ? 'top-7 right-2' : 'top-4 right-1'} w-2 h-1 rounded-full bg-pink-300/60`} />
      
      {/* Mouth */}
      <motion.div 
        className={`absolute ${size === 'large' ? 'bottom-4 left-1/2' : 'bottom-2.5 left-1/2'} -translate-x-1/2 ${mouthSize} h-1 rounded-full bg-gray-800`}
        style={{
          borderRadius: mood === 'happy' || mood === 'celebrating' || mood === 'waving' ? '0 0 50% 50%' : '50%',
          height: mood === 'happy' || mood === 'celebrating' || mood === 'waving' ? (size === 'large' ? '8px' : '5px') : (size === 'large' ? '4px' : '3px'),
        }}
      />
      
      {/* Stars around when celebrating */}
      {mood === 'celebrating' && (
        <>
          <motion.div
            className="absolute -top-2 -right-1"
            animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
          </motion.div>
          <motion.div
            className="absolute -top-1 -left-2"
            animate={{ rotate: -360, scale: [1, 0.8, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
          </motion.div>
        </>
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

  // Idle animation cycle
  useEffect(() => {
    if (!isTyping && messages.length > 0) {
      const timer = setTimeout(() => setCurrentMood('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  const processMessage = (userMessage: string) => {
    const lowerInput = userMessage.toLowerCase();
    let response = chandraResponses.default;
    
    for (const [key, value] of Object.entries(chandraResponses)) {
      if (lowerInput.includes(key)) {
        response = value;
        break;
      }
    }
    
    return response;
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
      {/* Floating Chandra Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-1 rounded-full shadow-xl shadow-amber-500/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <motion.div 
            className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
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
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-4 flex items-center gap-4">
              <ChandraFace mood={currentMood} size="large" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-white text-lg">Chandra</h4>
                  <Moon className="w-4 h-4 text-amber-100" />
                </div>
                <p className="text-xs text-amber-100">Your Pot Buddy ✨</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-amber-100">
                    {isTyping ? 'Thinking...' : 'Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActions onAction={handleSend} />

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-amber-50/5 to-transparent">
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
                        : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-foreground rounded-bl-sm shadow-sm'
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
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-3 rounded-2xl rounded-bl-sm">
                    <motion.div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-amber-500"
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
                className="flex-1 bg-secondary rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Button 
                size="icon" 
                onClick={() => handleSend()}
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 rounded-xl"
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
