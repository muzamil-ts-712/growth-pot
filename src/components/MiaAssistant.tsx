import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const miaResponses: Record<string, string> = {
  'hello': "Hi there! 👋 I'm Mia, your Growth Pot assistant. How can I help you today?",
  'help': "I can help you with:\n• Understanding how Chitti funds work\n• Calculating your monthly payouts\n• Explaining the spinning wheel auction\n• Answering questions about payments",
  'how does chitti work': "A Chitti fund is a community savings system where:\n\n1️⃣ A group agrees on a monthly contribution\n2️⃣ Each month, contributions are pooled\n3️⃣ One member wins the pot via auction/spin\n4️⃣ This repeats until everyone wins once!",
  'payment': "To submit a payment:\n1. Pay your Admin via Cash/UPI/Bank\n2. Take a screenshot of your payment\n3. Upload it in the app\n4. Wait for Admin approval ✅",
  'spin': "The Spinning Wheel selects the monthly winner randomly from all members who haven't won yet. It's fair and transparent! 🎡",
  'default': "I'm here to help! Try asking about:\n• How Chitti works\n• Payment process\n• The spinning wheel\n• Or just say hello! 😊",
};

const MiaAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hi! I'm Mia 🌱 Your Growth Pot assistant. How can I help?", isUser: false }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput('');

    // Simple keyword matching for responses
    setTimeout(() => {
      const lowerInput = userMessage.toLowerCase();
      let response = miaResponses.default;
      
      for (const [key, value] of Object.entries(miaResponses)) {
        if (lowerInput.includes(key)) {
          response = value;
          break;
        }
      }
      
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 glass-card overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-primary p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-primary-foreground">Mia</h4>
                <p className="text-xs text-primary-foreground/80">Your Growth Assistant</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl text-sm whitespace-pre-line ${
                      msg.isUser
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-secondary-foreground rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Mia anything..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="icon" onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MiaAssistant;
