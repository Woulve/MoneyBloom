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
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.86 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.75 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 155.88 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rate: 0.80 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.40 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.54 },
] as const;

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const fromRate = CURRENCIES.find(c => c.code === fromCurrency)?.rate ?? 1.0;
  const toRate = CURRENCIES.find(c => c.code === toCurrency)?.rate ?? 1.0;
  return (amount / fromRate) * toRate;
}
