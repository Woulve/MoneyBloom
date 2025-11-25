import { Component, ChangeDetectionStrategy, inject, computed, LOCALE_ID } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SettingsService } from '../services/settings.service';
import { ProjectionCalculatorService } from '../services/projection-calculator.service';
import { ProjectionGraphComponent } from './projection-graph.component';
import { ProjectionSettings, CURRENCIES, convertCurrency } from '../models/projection-settings.model';

@Component({
  selector: 'app-main',
  imports: [ProjectionGraphComponent, DecimalPipe],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  private readonly settingsSvc = inject(SettingsService);
  private readonly calcSvc = inject(ProjectionCalculatorService);
  readonly locale = inject(LOCALE_ID);

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

    if (key === 'currency') {
      const newCurrency = target.value;
      const oldCurrency = this.settings().currency;
      const currentSettings = this.settings();

      const convertedSettings: Partial<ProjectionSettings> = {
        currency: newCurrency,
        startingAmount: Math.round(convertCurrency(currentSettings.startingAmount, oldCurrency, newCurrency)),
        monthlyContribution: Math.round(convertCurrency(currentSettings.monthlyContribution, oldCurrency, newCurrency)),
      };

      this.settingsSvc.updateSettings(convertedSettings);
    } else {
      const val = +target.value;
      this.settingsSvc.updateSettings({ [key]: val });
    }
  }

  reset(): void {
    this.settingsSvc.resetToDefaults();
  }

  switchLanguage(newLocale: string): void {
    // In development, you need to restart the server with the desired locale
    // npm start (English) or npm run start:de (German)
    if (!this.isProduction()) {
      console.warn(
        'Language switching in development requires restarting the dev server.\n' +
        'Run "npm start" for English or "npm run start:de" for German.'
      );
      return;
    }

    const currentPath = window.location.pathname;
    const currentLocale = this.locale;

    // Remove current locale from path if present
    let newPath = currentPath;
    if (currentPath.startsWith(`/${currentLocale}/`)) {
      newPath = currentPath.substring(`/${currentLocale}`.length);
    } else if (currentPath === `/${currentLocale}`) {
      newPath = '/';
    }

    // Add new locale to path
    if (newLocale !== 'en-US') {
      newPath = `/${newLocale}${newPath}`;
    }

    // Navigate to new locale
    window.location.href = newPath;
  }

  private isProduction(): boolean {
    // Check if running in production build (localized bundles exist)
    return window.location.pathname.includes('/en-US/') ||
           window.location.pathname.includes('/de/') ||
           document.querySelector('meta[name="build-mode"]')?.getAttribute('content') === 'production';
  }
}
