export type UserRole = 'admin' | 'moderator' | 'member';
export type BoxType = '1' | '2';

import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  boxes?: BoxType[];
  balance: {
    [key: string]: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AccountActivity {
  id: string;
  userId: string;
  boxId: BoxType;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  balance: number;
  createdAt: Date;
}

export interface TransferRequest {
  id: string;
  userId: string;
  boxId: BoxType;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  receiptUrl: string;
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface AdminDashboardStats {
  totalMembers: number;
  pendingRequests: {
    [key in BoxType]: number;
  };
  totalBalance: {
    [key in BoxType]: number;
  };
  recentActivities: AccountActivity[];
}

export interface BoxConfig {
  id: BoxType;
  name: string;
  monthlyAmount: number;
  description: string;
}