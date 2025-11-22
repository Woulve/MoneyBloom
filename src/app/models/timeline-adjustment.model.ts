export type AdjustmentType =
  | 'contribution-change'
  | 'growth-rate-change'
  | 'one-time-deposit'
  | 'one-time-withdrawal';

export interface TimelineAdjustment {
  id: string;
  type: AdjustmentType;
  date: Date;
  value: number;
}
