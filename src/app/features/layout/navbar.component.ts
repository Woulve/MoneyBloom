import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <h1 class="app-title">MoneyBloom</h1>
        </div>

        <div class="navbar-controls">
          <div class="currency-selector">
            <label for="currency-select" class="currency-label">Currency:</label>
            <select
              id="currency-select"
              class="currency-select"
              [value]="currencyService.selectedCurrency().code"
              (change)="onCurrencyChange($event)"
            >
              @for (currency of currencyService.availableCurrencies; track currency.code) {
                <option [value]="currency.code">
                  {{ currency.symbol }} {{ currency.code }} - {{ currency.name }}
                </option>
              }
            </select>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-bottom: 1px solid #334155;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
    }

    .app-title {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: -0.025em;
    }

    .navbar-controls {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .currency-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .currency-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #cbd5e1;
      white-space: nowrap;
    }

    .currency-select {
      padding: 0.5rem 0.75rem;
      background-color: #1e293b;
      border: 1px solid #475569;
      border-radius: 0.5rem;
      color: #f1f5f9;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 200px;
    }

    .currency-select:hover {
      border-color: #64748b;
      background-color: #334155;
    }

    .currency-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .currency-select option {
      background-color: #1e293b;
      color: #f1f5f9;
      padding: 0.5rem;
    }

    @media (max-width: 768px) {
      .navbar-container {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }

      .currency-selector {
        width: 100%;
      }

      .currency-select {
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  readonly currencyService = inject(CurrencyService);

  onCurrencyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.currencyService.setCurrency(target.value);
  }
}
