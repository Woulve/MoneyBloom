import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { ProjectionCalculatorService } from '../../services/projection-calculator.service';
import { CreateAccountFormComponent } from './create-account-form.component';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-account-list',
  imports: [RouterLink, CreateAccountFormComponent],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountListComponent {
  private readonly accountService = inject(AccountService);
  private readonly calculatorService = inject(ProjectionCalculatorService);
  private readonly currencyService = inject(CurrencyService);

  readonly accounts = this.accountService.allAccounts;
  readonly showCreateForm = signal(false);

  openCreateForm(): void {
    this.showCreateForm.set(true);
  }

  closeCreateForm(): void {
    this.showCreateForm.set(false);
  }

  deleteAccount(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this account?')) {
      this.accountService.deleteAccount(id);
    }
  }

  getProjectedValue(accountId: string): number {
    const account = this.accountService.getAccountById(accountId);
    if (!account) return 0;

    const projection = this.calculatorService.calculateProjection(account);
    return projection.finalValue;
  }

  formatCurrency(value: number, accountId: string): string {
    const account = this.accountService.getAccountById(accountId);
    if (!account) return value.toString();

    return this.currencyService.formatAccountAmount(value, account.currency);
  }
}
