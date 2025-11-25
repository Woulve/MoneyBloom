import { Injectable } from '@angular/core';
import { ProjectionSettings } from '../models/projection-settings.model';

export interface DataPoint {
  date: Date;
  value: number;
  investedAmount: number;
  monthIndex: number;
  realValue: number;
  afterTaxRealValue: number;
}

export interface ProjectionResult {
  dataPoints: DataPoint[];
  finalValue: number;
  totalContributions: number;
  totalGrowth: number;
  finalRealValue: number;
  afterTaxValue: number;
  afterTaxRealValue: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectionCalculatorService {
  calculateProjection(s: ProjectionSettings): ProjectionResult {
    const months = s.cashoutYears * 12;
    const pts: DataPoint[] = [];
    const start = new Date();

    let val = s.startingAmount;
    let invested = s.startingAmount;

    pts.push({
      date: new Date(start),
      value: val,
      investedAmount: invested,
      monthIndex: 0,
      realValue: val,
      afterTaxRealValue: val, // No gains yet, so no tax
    });

    for (let m = 1; m <= months; m++) {
      val += s.monthlyContribution;
      invested += s.monthlyContribution;

      val *= 1 + s.yearlyGrowthRate / 100 / 12;

      const inflationFactor = Math.pow(1 + s.inflationRate / 100 / 12, m);
      const realVal = val / inflationFactor;

      // Calculate after-tax real value at this point
      const currentGrowth = val - invested;
      const afterTax = val - currentGrowth * (s.taxRate / 100);
      const afterTaxReal = afterTax / inflationFactor;

      pts.push({
        date: this.addMonths(start, m),
        value: val,
        investedAmount: invested,
        monthIndex: m,
        realValue: realVal,
        afterTaxRealValue: afterTaxReal,
      });
    }

    const totalInflation = Math.pow(1 + s.inflationRate / 100, s.cashoutYears);
    const realVal = val / totalInflation;
    const growth = val - invested;
    const afterTax = val - growth * (s.taxRate / 100);
    const afterTaxReal = afterTax / totalInflation;

    return {
      dataPoints: pts,
      finalValue: Math.round(val * 100) / 100,
      totalContributions: Math.round(invested * 100) / 100,
      totalGrowth: Math.round(growth * 100) / 100,
      finalRealValue: Math.round(realVal * 100) / 100,
      afterTaxValue: Math.round(afterTax * 100) / 100,
      afterTaxRealValue: Math.round(afterTaxReal * 100) / 100,
    };
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
}
