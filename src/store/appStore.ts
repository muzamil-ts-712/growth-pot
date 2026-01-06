import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Fund, User, Payment, SpinResult } from '@/types';

interface AppState {
  currentUser: User | null;
  funds: Fund[];
  payments: Payment[];
  spinResults: SpinResult[];
  
  // Auth actions
  setCurrentUser: (user: User | null) => void;
  
  // Fund actions
  createFund: (fund: Omit<Fund, 'id' | 'createdAt' | 'joinCode' | 'currentMonth' | 'status' | 'members'>) => Fund;
  getFund: (id: string) => Fund | undefined;
  joinFund: (code: string, user: User) => Fund | null;
  verifyMember: (fundId: string, userId: string) => void;
  
  // Payment actions
  submitPayment: (payment: Omit<Payment, 'id' | 'submittedAt' | 'status'>) => void;
  approvePayment: (paymentId: string) => void;
  getPaymentsForFund: (fundId: string) => Payment[];
  
  // Spin actions
  recordSpin: (result: Omit<SpinResult, 'spinDate'>) => void;
}

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const generateId = () => Math.random().toString(36).substring(2, 11);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      funds: [],
      payments: [],
      spinResults: [],
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      createFund: (fundData) => {
        const newFund: Fund = {
          ...fundData,
          id: generateId(),
          joinCode: generateCode(),
          currentMonth: 1,
          status: 'active',
          members: [],
          createdAt: new Date(),
        };
        set((state) => ({ funds: [...state.funds, newFund] }));
        return newFund;
      },
      
      getFund: (id) => get().funds.find(f => f.id === id),
      
      joinFund: (code, user) => {
        const fund = get().funds.find(f => f.joinCode === code);
        if (!fund) return null;
        
        const memberExists = fund.members.some(m => m.userId === user.id);
        if (memberExists) return fund;
        
        const newMember = {
          userId: user.id,
          user,
          joinedAt: new Date(),
          isVerified: false,
          hasWon: false,
          payments: [],
        };
        
        set((state) => ({
          funds: state.funds.map(f => 
            f.id === fund.id 
              ? { ...f, members: [...f.members, newMember] }
              : f
          )
        }));
        
        return fund;
      },
      
      verifyMember: (fundId, userId) => {
        set((state) => ({
          funds: state.funds.map(f => 
            f.id === fundId 
              ? { 
                  ...f, 
                  members: f.members.map(m => 
                    m.userId === userId ? { ...m, isVerified: true } : m
                  )
                }
              : f
          )
        }));
      },
      
      submitPayment: (paymentData) => {
        const payment: Payment = {
          ...paymentData,
          id: generateId(),
          status: 'pending',
          submittedAt: new Date(),
        };
        set((state) => ({ payments: [...state.payments, payment] }));
      },
      
      approvePayment: (paymentId) => {
        set((state) => ({
          payments: state.payments.map(p =>
            p.id === paymentId 
              ? { ...p, status: 'approved' as const, approvedAt: new Date() }
              : p
          )
        }));
      },
      
      getPaymentsForFund: (fundId) => get().payments.filter(p => p.fundId === fundId),
      
      recordSpin: (result) => {
        const spinResult: SpinResult = {
          ...result,
          spinDate: new Date(),
        };
        set((state) => ({ 
          spinResults: [...state.spinResults, spinResult],
          funds: state.funds.map(f =>
            f.id === result.fundId
              ? {
                  ...f,
                  members: f.members.map(m =>
                    m.userId === result.winnerId
                      ? { ...m, hasWon: true, wonMonth: result.month }
                      : m
                  ),
                  currentMonth: f.currentMonth + 1,
                }
              : f
          )
        }));
      },
    }),
    {
      name: 'growth-pot-storage',
    }
  )
);
