import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Payment } from '@/types';

interface PaymentCardProps {
  payment: Payment;
  memberName: string;
  isAdmin?: boolean;
  onApprove?: (paymentId: string) => void;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
};

const PaymentCard = ({ payment, memberName, isAdmin, onApprove }: PaymentCardProps) => {
  const status = statusConfig[payment.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">{memberName}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {status.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Month {payment.month} • ₹{payment.amount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(payment.submittedAt).toLocaleDateString()}
          </p>
        </div>

        {payment.proofImage && (
          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {payment.proofText && (
        <p className="text-sm text-muted-foreground mt-3 p-2 bg-secondary/50 rounded-lg">
          "{payment.proofText}"
        </p>
      )}

      {isAdmin && payment.status === 'pending' && onApprove && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            onClick={() => onApprove(payment.id)}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentCard;
