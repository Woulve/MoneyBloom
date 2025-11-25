export interface ProjectionSettings {
  startingAmount: number;
  monthlyContribution: number;
  yearlyGrowthRate: number;
  cashoutYears: number;
  inflationRate: number;
  taxRate: number;
  currency: string;
}

export const DEFAULT_SETTINGS: ProjectionSettings = {
  startingAmount: 10000,
  monthlyContribution: 500,
  yearlyGrowthRate: 7,
  cashoutYears: 30,
  inflationRate: 2,
  taxRate: 15,
  currency: 'USD',
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
] as const;
