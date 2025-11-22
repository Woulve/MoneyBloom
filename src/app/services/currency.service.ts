import { Injectable, signal, computed } from '@angular/core';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // Conversion rate to USD (1 unit = X USD)
}

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  // Available currencies with their conversion rates
  private readonly currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1 },
    { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 1.09 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 1.27 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 0.0067 },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 0.72 },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 0.65 },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToUSD: 1.13 },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rateToUSD: 0.14 },
  ];

  // Selected currency signal
  private readonly selectedCurrencyCode = signal<string>('USD');

  // Computed selected currency object
  readonly selectedCurrency = computed(() => {
    const code = this.selectedCurrencyCode();
    return this.currencies.find((c) => c.code === code) || this.currencies[0];
  });

  // Get all available currencies
  readonly availableCurrencies = this.currencies;

  /**
   * Set the selected currency
   */
  setCurrency(currencyCode: string): void {
    const currency = this.currencies.find((c) => c.code === currencyCode);
    if (currency) {
      this.selectedCurrencyCode.set(currencyCode);
    }
  }

  /**
   * Convert amount from USD to the selected currency
   */
  convertFromUSD(amountInUSD: number): number {
    const selectedCurr = this.selectedCurrency();
    return amountInUSD / selectedCurr.rateToUSD;
  }

  /**
   * Convert amount from the selected currency to USD
   */
  convertToUSD(amount: number): number {
    const selectedCurr = this.selectedCurrency();
    return amount * selectedCurr.rateToUSD;
  }

  /**
   * Format a USD amount in the selected currency
   */
  formatCurrency(amountInUSD: number): string {
    const convertedAmount = this.convertFromUSD(amountInUSD);
    const currency = this.selectedCurrency();

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedAmount);
  }

  /**
   * Format a USD amount in the selected currency with decimals
   */
  formatCurrencyDetailed(amountInUSD: number, decimals = 2): string {
    const convertedAmount = this.convertFromUSD(amountInUSD);
    const currency = this.selectedCurrency();

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(convertedAmount);
  }

  /**
   * Get currency by code
   */
  getCurrencyByCode(code: string): Currency | undefined {
    return this.currencies.find((c) => c.code === code);
  }

  /**
   * Convert amount from one currency to another via USD
   */
  convertBetweenCurrencies(
    amount: number,
    fromCurrencyCode: string,
    toCurrencyCode: string
  ): number {
    const fromCurrency = this.getCurrencyByCode(fromCurrencyCode);
    const toCurrency = this.getCurrencyByCode(toCurrencyCode);

    if (!fromCurrency || !toCurrency) {
      return amount; // Return original if currencies not found
    }

    // Convert from source currency to USD, then to target currency
    const amountInUSD = amount * fromCurrency.rateToUSD;
    return amountInUSD / toCurrency.rateToUSD;
  }

  /**
   * Format an amount in a specific currency
   */
  formatInCurrency(amount: number, currencyCode: string): string {
    const currency = this.getCurrencyByCode(currencyCode);
    if (!currency) {
      return amount.toString();
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format an amount stored in account currency, displaying in selected currency
   */
  formatAccountAmount(
    amount: number,
    accountCurrency: string
  ): string {
    const convertedAmount = this.convertBetweenCurrencies(
      amount,
      accountCurrency,
      this.selectedCurrency().code
    );
    return this.formatInCurrency(convertedAmount, this.selectedCurrency().code);
  }
}
