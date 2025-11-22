import { TimelineAdjustment } from './timeline-adjustment.model';

export interface SavingsAccount {
  id: string;
  name: string;
  currency: string;
  startingAmount: number;
  monthlyContribution: number;
  yearlyGrowthRate: number;
  cashoutYears: number;
  createdAt: Date;
  adjustments: TimelineAdjustment[];
}

export interface CreateSavingsAccountDto {
  name: string;
  currency: string;
  startingAmount: number;
  monthlyContribution: number;
  yearlyGrowthRate: number;
  cashoutYears: number;
}
