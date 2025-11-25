import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { ProjectionCalculatorService } from '../services/projection-calculator.service';
import { ProjectionGraphComponent } from './projection-graph.component';
import { ProjectionSettings, CURRENCIES } from '../models/projection-settings.model';

@Component({
  selector: 'app-main',
  imports: [ProjectionGraphComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  private readonly settingsSvc = inject(SettingsService);
  private readonly calcSvc = inject(ProjectionCalculatorService);

  readonly settings = this.settingsSvc.settings;
  readonly currencies = CURRENCIES;
  readonly Math = Math;

  readonly proj = computed(() => this.calcSvc.calculateProjection(this.settings()));

  readonly currSymbol = computed(() =>
    CURRENCIES.find((c) => c.code === this.settings().currency)?.symbol || '$'
  );

  // Incentive facts calculations
  readonly extraMonthlyImpact = computed(() => {
    const current = this.proj();
    const s = this.settings();
    const extra = this.calcSvc.calculateProjection({
      ...s,
      monthlyContribution: s.monthlyContribution + 10,
    });
    return extra.afterTaxRealValue - current.afterTaxRealValue;
  });

  readonly doubleContributionImpact = computed(() => {
    const current = this.proj();
    const s = this.settings();
    const doubled = this.calcSvc.calculateProjection({
      ...s,
      monthlyContribution: s.monthlyContribution * 2,
    });
    return doubled.afterTaxRealValue - current.afterTaxRealValue;
  });

  readonly extraYearImpact = computed(() => {
    const current = this.proj();
    const s = this.settings();
    const extraYear = this.calcSvc.calculateProjection({
      ...s,
      cashoutYears: s.cashoutYears + 1,
    });
    return extraYear.afterTaxRealValue - current.afterTaxRealValue;
  });

  readonly monthlyPassiveIncome = computed(() => {
    const finalValue = this.proj().afterTaxRealValue;
    const withdrawalRate = 0.04;
    return (finalValue * withdrawalRate) / 12;
  });

  update(key: keyof ProjectionSettings, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const val = key === 'currency' ? target.value : +target.value;
    this.settingsSvc.updateSettings({ [key]: val });
  }

  reset(): void {
    this.settingsSvc.resetToDefaults();
  }
}
