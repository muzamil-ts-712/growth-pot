import { motion } from 'framer-motion';
import { CheckCircle, Clock, Trophy, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FundMember } from '@/types';

interface MemberCardProps {
  member: FundMember;
  isAdmin?: boolean;
  isCurrentUserAdmin?: boolean;
  onVerify?: (userId: string) => void;
}

const MemberCard = ({ member, isAdmin, isCurrentUserAdmin, onVerify }: MemberCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex items-center gap-4"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary">
          {member.user.name.charAt(0).toUpperCase()}
        </div>
        {member.hasWon && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
            <Trophy className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold truncate">{member.user.name}</h4>
          {member.isVerified ? (
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-warning flex-shrink-0" />
          )}
        </div>
        {/* Only show phone to admins */}
        {isCurrentUserAdmin && member.user.phone && (
          <p className="text-sm text-muted-foreground truncate">{member.user.phone}</p>
        )}
        {member.hasWon && member.wonMonth && (
          <p className="text-xs text-primary mt-1">
            Won in Month {member.wonMonth}
          </p>
        )}
      </div>

      {/* Action */}
      {isAdmin && !member.isVerified && onVerify && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onVerify(member.userId)}
        >
          <UserCheck className="w-4 h-4 mr-1" />
          Verify
        </Button>
      )}
    </motion.div>
  );
};

export default MemberCard;
