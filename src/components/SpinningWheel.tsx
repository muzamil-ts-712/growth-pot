import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SpinningWheelProps {
  members: { id: string; name: string }[];
  onComplete: () => void;
  isSpinning: boolean;
  predeterminedWinner: { id: string; name: string } | null;
}

/**
 * SpinningWheel - Visual animation component for the monthly spin
 * 
 * SECURITY NOTE: This component is purely visual. The actual winner selection
 * happens server-side via the conduct_spin RPC function. The predeterminedWinner
 * is provided by the server BEFORE the animation starts, ensuring:
 * 1. Winner selection cannot be manipulated client-side
 * 2. The result is cryptographically random (server-side)
 * 3. Duplicate spins are prevented at the database level
 */
const SpinningWheel = ({ members, onComplete, isSpinning, predeterminedWinner }: SpinningWheelProps) => {
  const [rotation, setRotation] = useState(0);
  const [showWinner, setShowWinner] = useState(false);

  const colors = [
    'hsl(160, 84%, 39%)',
    'hsl(170, 80%, 45%)',
    'hsl(180, 70%, 40%)',
    'hsl(150, 75%, 35%)',
    'hsl(165, 85%, 42%)',
    'hsl(175, 78%, 38%)',
  ];

  useEffect(() => {
    if (isSpinning && members.length > 0 && predeterminedWinner) {
      // Find the index of the server-determined winner
      const winnerIndex = members.findIndex(m => m.id === predeterminedWinner.id);
      
      if (winnerIndex === -1) {
        // Winner not found in members list, complete immediately
        onComplete();
        return;
      }
      
      const baseRotation = 360 * 8; // 8 full spins for visual effect
      const segmentAngle = 360 / members.length;
      const winnerAngle = winnerIndex * segmentAngle + segmentAngle / 2;
      const finalRotation = baseRotation + (360 - winnerAngle);

      setRotation(finalRotation);
      setShowWinner(false);

      // Show winner after animation completes
      setTimeout(() => {
        setShowWinner(true);
        onComplete();
      }, 5000);
    }
  }, [isSpinning, members, predeterminedWinner, onComplete]);

  const segmentAngle = 360 / members.length;

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse-glow" />
        
        {/* Wheel */}
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden shadow-2xl"
          style={{
            background: 'conic-gradient(from 0deg, ' + 
              members.map((_, i) => `${colors[i % colors.length]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(', ') + ')',
          }}
          animate={{ rotate: rotation }}
          transition={{ duration: 5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Member names on wheel */}
          {members.map((member, index) => {
            const angle = index * segmentAngle + segmentAngle / 2;
            return (
              <div
                key={member.id}
                className="absolute top-1/2 left-1/2 origin-left"
                style={{
                  transform: `rotate(${angle}deg) translateX(30%)`,
                }}
              >
                <span 
                  className="text-xs md:text-sm font-medium text-background truncate max-w-[80px] block"
                  style={{ transform: 'rotate(90deg)' }}
                >
                  {member.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
          
          {/* Center circle */}
          <div className="absolute inset-1/4 rounded-full bg-background flex items-center justify-center shadow-inner">
            <div className="w-3/4 h-3/4 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
        </motion.div>
        
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
        </div>
      </div>

      {/* Winner Announcement */}
      <AnimatePresence>
        {showWinner && predeterminedWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="mt-8 text-center"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="glass-card p-6 glow-effect"
            >
              <p className="text-muted-foreground text-sm mb-2">🎉 Winner!</p>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-gradient">
                {predeterminedWinner.name}
              </h3>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinningWheel;
