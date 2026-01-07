import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Award } from 'lucide-react';

interface Member {
  is_verified: boolean;
  has_won: boolean;
}

interface PotStatusCardProps {
  fund: {
    name: string;
    current_month: number;
    duration: number;
    monthly_contribution: number;
  };
  members: Member[];
  collectedAmount: number;
}

const PotStatusCard = ({ fund, members, collectedAmount }: PotStatusCardProps) => {
  const progress = fund.monthly_contribution > 0 
    ? (collectedAmount / fund.monthly_contribution) * 100 
    : 0;
  const verifiedMembers = members.filter(m => m.is_verified).length;
  const winners = members.filter(m => m.has_won).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 glow-effect"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold">{fund.name}</h3>
          <p className="text-sm text-muted-foreground">Month {fund.current_month} of {fund.duration}</p>
        </div>
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Monthly Progress</span>
          <span className="text-primary font-semibold">{Math.min(progress, 100).toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs mt-2 text-muted-foreground">
          <span>₹{collectedAmount.toLocaleString()}</span>
          <span>₹{fund.monthly_contribution.toLocaleString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{verifiedMembers}</p>
          <p className="text-xs text-muted-foreground">Members</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{Math.max(0, fund.duration - fund.current_month + 1)}</p>
          <p className="text-xs text-muted-foreground">Left</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <Award className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{winners}</p>
          <p className="text-xs text-muted-foreground">Winners</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PotStatusCard;
