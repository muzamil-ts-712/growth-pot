export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  idImage?: string;
  isVerified: boolean;
  role: 'admin' | 'member';
  createdAt: Date;
}

export interface Fund {
  id: string;
  name: string;
  totalAmount: number;
  monthlyContribution: number;
  duration: number;
  memberCount: number;
  adminId: string;
  joinCode: string;
  adminCommission: number;
  currentMonth: number;
  status: 'active' | 'completed' | 'paused';
  members: FundMember[];
  createdAt: Date;
}

export interface FundMember {
  userId: string;
  user: User;
  joinedAt: Date;
  isVerified: boolean;
  hasWon: boolean;
  wonMonth?: number;
  payments: Payment[];
}

export interface Payment {
  id: string;
  memberId: string;
  fundId: string;
  month: number;
  amount: number;
  proofImage?: string;
  proofText?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  approvedAt?: Date;
}

export interface SpinResult {
  fundId: string;
  month: number;
  winnerId: string;
  winnerName: string;
  amount: number;
  spinDate: Date;
}
