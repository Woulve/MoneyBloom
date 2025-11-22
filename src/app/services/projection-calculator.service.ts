import { Injectable } from '@angular/core';
import { SavingsAccount } from '../models/savings-account.model';
import { TimelineAdjustment } from '../models/timeline-adjustment.model';

export interface ProjectionDataPoint {
  date: Date;
  value: number;
  investedAmount: number;
  monthIndex: number;
  realValue: number; // Value adjusted for inflation
}

export interface ProjectionResult {
  dataPoints: ProjectionDataPoint[];
  finalValue: number;
  totalContributions: number;
  totalGrowth: number;
  finalRealValue: number; // Final value adjusted for inflation
  afterTaxValue: number; // Final value after taxes on gains
  afterTaxRealValue: number; // Real value after taxes
}

@Injectable({
  providedIn: 'root',
})
export class ProjectionCalculatorService {
  calculateProjection(
    account: SavingsAccount,
    inflationRate = 0,
    taxRate = 0
  ): ProjectionResult {
    const totalMonths = account.cashoutYears * 12;
    const dataPoints: ProjectionDataPoint[] = [];
    const startDate = account.createdAt;

    let currentValue = account.startingAmount;
    let currentMonthlyContribution = account.monthlyContribution;
    let currentGrowthRate = account.yearlyGrowthRate;
    let totalContributions = account.startingAmount;

    // Sort adjustments by date
    const sortedAdjustments = [...account.adjustments].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    // Add initial data point
    dataPoints.push({
      date: new Date(startDate),
      value: currentValue,
      investedAmount: totalContributions,
      monthIndex: 0,
      realValue: currentValue, // No inflation yet at month 0
    });

    for (let month = 1; month <= totalMonths; month++) {
      const currentDate = this.addMonths(startDate, month);

      // Apply any adjustments that occur before this month
      const applicableAdjustments = sortedAdjustments.filter((adj) => {
        const adjustmentMonth = this.getMonthsDifference(startDate, adj.date);
        return adjustmentMonth === month;
      });

      for (const adjustment of applicableAdjustments) {
        switch (adjustment.type) {
          case 'contribution-change':
            currentMonthlyContribution = adjustment.value;
            break;
          case 'growth-rate-change':
            currentGrowthRate = adjustment.value;
            break;
          case 'one-time-deposit':
            currentValue += adjustment.value;
            totalContributions += adjustment.value;
            break;
          case 'one-time-withdrawal':
            currentValue -= adjustment.value;
            break;
        }
      }

      // Add monthly contribution
      currentValue += currentMonthlyContribution;
      totalContributions += currentMonthlyContribution;

      // Apply monthly growth (compound interest)
      const monthlyGrowthRate = currentGrowthRate / 100 / 12;
      currentValue *= 1 + monthlyGrowthRate;

      // Calculate real value (adjusted for inflation)
      const monthlyInflationRate = inflationRate / 100 / 12;
      const inflationFactor = Math.pow(1 + monthlyInflationRate, month);
      const realValue = currentValue / inflationFactor;

      dataPoints.push({
        date: new Date(currentDate),
        value: currentValue,
        investedAmount: totalContributions,
        monthIndex: month,
        realValue,
      });
    }

    const finalValue = currentValue;
    const totalGrowth = finalValue - totalContributions;

    // Calculate inflation-adjusted final value
    const totalInflationFactor = Math.pow(1 + inflationRate / 100, account.cashoutYears);
    const finalRealValue = finalValue / totalInflationFactor;

    // Calculate after-tax value (tax only on gains)
    const taxOnGains = totalGrowth * (taxRate / 100);
    const afterTaxValue = finalValue - taxOnGains;

    // Calculate real value after taxes
    const afterTaxRealValue = afterTaxValue / totalInflationFactor;

    return {
      dataPoints,
      finalValue,
      totalContributions,
      totalGrowth,
      finalRealValue,
      afterTaxValue,
      afterTaxRealValue,
    };
  }

  calculateValueAtDate(account: SavingsAccount, targetDate: Date): number {
    const projection = this.calculateProjection(account);
    const targetTime = targetDate.getTime();

    // Find the closest data point
    const closestPoint = projection.dataPoints.reduce((prev, curr) => {
      return Math.abs(curr.date.getTime() - targetTime) <
        Math.abs(prev.date.getTime() - targetTime)
        ? curr
        : prev;
    });

    return closestPoint.value;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const yearDiff = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();
    return yearDiff * 12 + monthDiff;
  }
}
