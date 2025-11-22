import {
  Component,
  ChangeDetectionStrategy,
  output,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-create-account-form',
  imports: [ReactiveFormsModule],
  templateUrl: './create-account-form.component.html',
  styleUrl: './create-account-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  readonly currencyService = inject(CurrencyService);

  readonly close = output<void>();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    currency: ['USD', [Validators.required]],
    startingAmount: [0, [Validators.required, Validators.min(0)]],
    monthlyContribution: [0, [Validators.required, Validators.min(0)]],
    yearlyGrowthRate: [7, [Validators.required, Validators.min(0), Validators.max(100)]],
    cashoutYears: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
  });

  onSubmit(): void {
    if (this.form.valid) {
      const account = this.accountService.createAccount(this.form.getRawValue());
      this.close.emit();
      this.router.navigate(['/accounts', account.id]);
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
