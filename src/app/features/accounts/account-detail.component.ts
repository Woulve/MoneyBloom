import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { ProjectionCalculatorService } from '../../services/projection-calculator.service';
import { SavingsProjectionGraphComponent } from '../projections/savings-projection-graph.component';
import { CurrencyService } from '../../services/currency.service';
import { FormsModule } from '@angular/forms';
import { SavingsAccount } from '../../models/savings-account.model';

@Component({
  selector: 'app-account-detail',
  imports: [RouterLink, SavingsProjectionGraphComponent, FormsModule],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);
  private readonly calculatorService = inject(ProjectionCalculatorService);
  private readonly currencyService = inject(CurrencyService);

  private readonly accountId = signal<string | null>(null);

  readonly account = computed(() => {
    const id = this.accountId();
    return id ? this.accountService.getAccountById(id) : undefined;
  });

  // Signals for visualization parameters (editable via sliders)
  readonly visualStartingAmount = signal(0);
  readonly visualMonthlyContribution = signal(0);
  readonly visualGrowthRate = signal(7);
  readonly visualInflationRate = signal(2.5); // Average inflation rate
  readonly visualTaxRate = signal(20); // Capital gains tax rate

  // Create a virtual account with the current visualization parameters
  readonly visualAccount = computed((): SavingsAccount | undefined => {
    const acc = this.account();
    if (!acc) return undefined;

    return {
      ...acc,
      startingAmount: this.visualStartingAmount(),
      monthlyContribution: this.visualMonthlyContribution(),
      yearlyGrowthRate: this.visualGrowthRate(),
    };
  });

  readonly projection = computed(() => {
    const acc = this.visualAccount();
    return acc ? this.calculatorService.calculateProjection(
      acc,
      this.visualInflationRate(),
      this.visualTaxRate()
    ) : null;
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.accountId.set(id);

      if (id && !this.accountService.getAccountById(id)) {
        this.router.navigate(['/accounts']);
      }
    });

    // Initialize visualization parameters when account loads
    effect(() => {
      const acc = this.account();
      if (acc) {
        this.visualStartingAmount.set(acc.startingAmount);
        this.visualMonthlyContribution.set(acc.monthlyContribution);
        this.visualGrowthRate.set(acc.yearlyGrowthRate);
      }
    });
  }

  formatCurrency(value: number): string {
    const acc = this.account();
    if (!acc) return value.toString();

    return this.currencyService.formatAccountAmount(value, acc.currency);
  }

  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  resetToOriginal(): void {
    const acc = this.account();
    if (acc) {
      this.visualStartingAmount.set(acc.startingAmount);
      this.visualMonthlyContribution.set(acc.monthlyContribution);
      this.visualGrowthRate.set(acc.yearlyGrowthRate);
    }
  }
}
