import { motion } from 'framer-motion';
import { CheckCircle, Clock, Trophy, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MemberCardProps {
  member: {
    id: string;
    user_id: string;
    has_won: boolean;
    won_month: number | null;
    is_verified: boolean;
    profile?: {
      full_name: string;
      phone: string | null;
    };
  };
  isAdmin?: boolean;
  onVerify?: (memberId: string) => void;
}

const MemberCard = ({ member, isAdmin, onVerify }: MemberCardProps) => {
  const name = member.profile?.full_name || 'Unknown';
  const phone = member.profile?.phone || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex items-center gap-4"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary">
          {name.charAt(0).toUpperCase()}
        </div>
        {member.has_won && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
            <Trophy className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold truncate">{name}</h4>
          {member.is_verified ? (
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-warning flex-shrink-0" />
          )}
        </div>
        {phone && <p className="text-sm text-muted-foreground truncate">{phone}</p>}
        {member.has_won && member.won_month && (
          <p className="text-xs text-primary mt-1">
            Won in Month {member.won_month}
          </p>
        )}
      </div>

      {/* Action */}
      {isAdmin && !member.is_verified && onVerify && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onVerify(member.id)}
        >
          <UserCheck className="w-4 h-4 mr-1" />
          Verify
        </Button>
      )}
    </motion.div>
  );
};

export default MemberCard;
