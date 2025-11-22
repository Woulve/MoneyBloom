import { Injectable, signal } from '@angular/core';
import {
  SavingsAccount,
  CreateSavingsAccountDto,
} from '../models/savings-account.model';
import {
  TimelineAdjustment,
  AdjustmentType,
} from '../models/timeline-adjustment.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly STORAGE_KEY = 'moneybloom_accounts';
  private readonly accounts = signal<SavingsAccount[]>(this.loadFromStorage());

  readonly allAccounts = this.accounts.asReadonly();

  constructor() {
    // Persist to localStorage whenever accounts change
    this.setupAutoSave();
  }

  createAccount(dto: CreateSavingsAccountDto): SavingsAccount {
    const newAccount: SavingsAccount = {
      id: crypto.randomUUID(),
      ...dto,
      createdAt: new Date(),
      adjustments: [],
    };

    this.accounts.update((accounts) => [...accounts, newAccount]);
    return newAccount;
  }

  getAccountById(id: string): SavingsAccount | undefined {
    return this.accounts().find((account) => account.id === id);
  }

  deleteAccount(id: string): void {
    this.accounts.update((accounts) =>
      accounts.filter((account) => account.id !== id)
    );
  }

  addAdjustment(accountId: string, adjustment: TimelineAdjustment): void {
    this.accounts.update((accounts) =>
      accounts.map((account) => {
        if (account.id === accountId) {
          const updatedAdjustments = [...account.adjustments, adjustment].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
          );
          return { ...account, adjustments: updatedAdjustments };
        }
        return account;
      })
    );
  }

  updateAdjustment(
    accountId: string,
    adjustmentId: string,
    updates: Partial<TimelineAdjustment>
  ): void {
    this.accounts.update((accounts) =>
      accounts.map((account) => {
        if (account.id === accountId) {
          const updatedAdjustments = account.adjustments
            .map((adj) =>
              adj.id === adjustmentId ? { ...adj, ...updates } : adj
            )
            .sort((a, b) => a.date.getTime() - b.date.getTime());
          return { ...account, adjustments: updatedAdjustments };
        }
        return account;
      })
    );
  }

  deleteAdjustment(accountId: string, adjustmentId: string): void {
    this.accounts.update((accounts) =>
      accounts.map((account) => {
        if (account.id === accountId) {
          const updatedAdjustments = account.adjustments.filter(
            (adj) => adj.id !== adjustmentId
          );
          return { ...account, adjustments: updatedAdjustments };
        }
        return account;
      })
    );
  }

  private loadFromStorage(): SavingsAccount[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored) as Array<{
        id: string;
        name: string;
        currency?: string;
        startingAmount: number;
        monthlyContribution: number;
        yearlyGrowthRate: number;
        cashoutYears: number;
        createdAt: string;
        adjustments: Array<{
          id: string;
          type: AdjustmentType;
          date: string;
          value: number;
        }>;
      }>;

      // Convert date strings back to Date objects
      return parsed.map((account) => ({
        ...account,
        currency: account.currency || 'USD', // Default to USD for old accounts
        createdAt: new Date(account.createdAt),
        adjustments: account.adjustments.map((adj) => ({
          ...adj,
          date: new Date(adj.date),
        })),
      }));
    } catch (error) {
      console.error('Failed to load accounts from storage:', error);
      return [];
    }
  }

  private setupAutoSave(): void {
    // Use effect to save whenever accounts change
    // Note: In a real app, we might debounce this
    if (typeof window !== 'undefined') {
      // Check for browser environment
      const saveToStorage = () => {
        try {
          localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(this.accounts())
          );
        } catch (error) {
          console.error('Failed to save accounts to storage:', error);
        }
      };

      // Save on every change
      setInterval(() => {
        saveToStorage();
      }, 1000);
    }
  }
}
