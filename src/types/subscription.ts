export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELED';

export interface Subscription {
  id: string;
  name: string;
  amountKRW: number;
  cycle: BillingCycle;
  anchorDate: string;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStore {
  schemaVersion: 1;
  subscriptions: Subscription[];
  updatedAt: string;
}

export const statusLabels: Record<SubscriptionStatus, string> = {
  ACTIVE: '활성', PAUSED: '일시정지', CANCELED: '해지',
};
