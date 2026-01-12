import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Moon, Star, Sparkles, TrendingUp, Coins, HelpCircle, Heart, PartyPopper, Trophy, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChandraChat } from '@/hooks/useChandraChat';
import chandraAvatar from '@/assets/chandra-avatar.webp';

type Mood = 'happy' | 'thinking' | 'celebrating' | 'waving' | 'idle' | 'excited' | 'proud' | 'love';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// Mood detection based on response content
const detectMood = (text: string): Mood => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('congratulations') || lowerText.includes('winner') || lowerText.includes('🎉') || lowerText.includes('🏆')) {
    return 'celebrating';
  }
  if (lowerText.includes('love') || lowerText.includes('thank') || lowerText.includes('💕') || lowerText.includes('❤️')) {
    return 'love';
  }
  if (lowerText.includes('namaste') || lowerText.includes('hello') || lowerText.includes('hi')) {
    return 'waving';
  }
  if (lowerText.includes('excited') || lowerText.includes('amazing') || lowerText.includes('wonderful')) {
    return 'excited';
  }
  if (lowerText.includes('let me') || lowerText.includes('think') || lowerText.includes('hmm')) {
    return 'thinking';
  }
  return 'happy';
};

// Chandra avatar component with mood-based animations
const ChandraFace = ({ mood, size = 'large' }: { mood: Mood; size?: 'small' | 'large' }) => {
  const baseSize = size === 'large' ? 'w-16 h-16' : 'w-12 h-12';
  
  // Face animations based on mood
  const faceAnimation = () => {
    switch (mood) {
      case 'waving': return { rotate: [0, -5, 5, -5, 0] };
      case 'celebrating': return { scale: [1, 1.1, 1], y: [0, -8, 0] };
      case 'excited': return { scale: [1, 1.15, 0.95, 1.1, 1], y: [0, -10, 0, -5, 0], rotate: [0, 5, -5, 3, 0] };
      case 'thinking': return { rotate: [0, 3, 0, -3, 0] };
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
      {/* Avatar Image */}
      <img 
        src={chandraAvatar} 
        alt="Chandra" 
        className="w-full h-full rounded-full object-cover border-2 border-purple-300 shadow-lg"
      />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-purple-400/30 blur-md -z-10" />
      
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
      
      {mood === 'thinking' && (
        <motion.div
          className="absolute -top-2 -right-1"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-sm">🤔</span>
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
  const [displayMessages, setDisplayMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Namaste! 🙏 I'm Chandra, your pot buddy! ✨\n\nI can help you setup funds, track payments, and even suggest cool names! What would you like to do?", isUser: false }
  ]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { streamChat, isLoading } = useChandraChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  // Idle animation cycle
  useEffect(() => {
    if (!isTyping && !isLoading && displayMessages.length > 0) {
      const timer = setTimeout(() => setCurrentMood('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [displayMessages, isTyping, isLoading]);

  // Trigger celebration animation
  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Check if response warrants celebration
  const checkForCelebration = (text: string) => {
    const celebrationTriggers = ['congratulations', 'winner', 'won', 'approved', '🎉', '🏆'];
    if (celebrationTriggers.some(trigger => text.toLowerCase().includes(trigger))) {
      triggerCelebration();
    }
  };

  // Public method to trigger reactions from parent components
  const triggerReaction = (type: 'paymentApproved' | 'spinWinner' | 'newMember') => {
    const reactions = {
      paymentApproved: "🎉 YAYYY! Payment Approved! 🎉\n\nYour payment has been verified! Keep up the great work, savings superstar! 💪✨",
      spinWinner: "🏆🎊 WE HAVE A WINNER! 🎊🏆\n\nCongratulations to the lucky winner! The pot is yours this month!",
      newMember: "Welcome to the family! 🎉💕\n\nSo excited to have a new member! Let's grow together! ✨"
    };

    if (type === 'paymentApproved' || type === 'spinWinner') {
      setCurrentMood('excited');
      triggerCelebration();
    } else {
      setCurrentMood('love');
    }
    
    setDisplayMessages(prev => [...prev, { text: reactions[type], isUser: false }]);
    if (!isOpen) setIsOpen(true);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    // Add user message to display
    setDisplayMessages(prev => [...prev, { text: messageText, isUser: true }]);
    setInput('');
    setIsTyping(true);
    setCurrentMood('thinking');

    // Build chat history for API
    const newUserMessage: ChatMessage = { role: 'user', content: messageText };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);

    let assistantResponse = '';

    await streamChat({
      messages: updatedHistory,
      onDelta: (chunk) => {
        assistantResponse += chunk;
        setDisplayMessages(prev => {
          const last = prev[prev.length - 1];
          if (!last?.isUser && prev.length > 1 && last?.text !== displayMessages[displayMessages.length - 1]?.text) {
            // Update the last assistant message
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: assistantResponse } : m));
          }
          // First chunk - add new assistant message
          return [...prev, { text: assistantResponse, isUser: false }];
        });
        // Update mood based on content as it streams
        const mood = detectMood(assistantResponse);
        setCurrentMood(mood);
      },
      onDone: () => {
        setIsTyping(false);
        setChatHistory(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
        checkForCelebration(assistantResponse);
        const finalMood = detectMood(assistantResponse);
        setCurrentMood(finalMood);
      },
      onError: (error) => {
        setIsTyping(false);
        setCurrentMood('thinking');
        setDisplayMessages(prev => [...prev, { 
          text: `Oops! ${error} 🌟\n\nLet me try that again in a moment!`, 
          isUser: false 
        }]);
      }
    });
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
              {displayMessages.map((msg, i) => (
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
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && isLoading && (
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
              <div ref={messagesEndRef} />
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
