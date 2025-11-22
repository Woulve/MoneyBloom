import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  computed,
  effect,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TimelineAdjustment,
  AdjustmentType,
} from '../../models/timeline-adjustment.model';

@Component({
  selector: 'app-adjustment-marker-popup',
  imports: [ReactiveFormsModule],
  templateUrl: './adjustment-marker-popup.component.html',
  styleUrl: './adjustment-marker-popup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdjustmentMarkerPopupComponent {
  private readonly fb = inject(FormBuilder);

  readonly date = input.required<Date>();
  readonly existingAdjustment = input<TimelineAdjustment | null>(null);

  readonly close = output<void>();
  readonly adjustmentAdded = output<TimelineAdjustment>();
  readonly adjustmentUpdated = output<TimelineAdjustment>();
  readonly adjustmentDeleted = output<string>();


  readonly form = this.fb.nonNullable.group({
    type: ['contribution-change' as AdjustmentType, [Validators.required]],
    value: [0, [Validators.required]],
  });

  readonly isEditMode = computed(() => this.existingAdjustment() !== null);

  constructor() {
    // Populate form when editing existing adjustment
    effect(() => {
      const adj = this.existingAdjustment();
      if (adj) {
        this.form.patchValue({
          type: adj.type,
          value: adj.value,
        });
      }
    });
  }

  readonly adjustmentTypes: { value: AdjustmentType; label: string }[] = [
    { value: 'contribution-change', label: 'Change Monthly Contribution' },
    { value: 'growth-rate-change', label: 'Change Growth Rate' },
    { value: 'one-time-deposit', label: 'One-time Deposit' },
    { value: 'one-time-withdrawal', label: 'One-time Withdrawal' },
  ];

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();

      if (this.isEditMode()) {
        // Update existing adjustment
        const existing = this.existingAdjustment()!;
        const updated: TimelineAdjustment = {
          ...existing,
          type: formValue.type,
          value: formValue.value,
        };
        this.adjustmentUpdated.emit(updated);
      } else {
        // Create new adjustment
        const adjustment: TimelineAdjustment = {
          id: crypto.randomUUID(),
          type: formValue.type,
          date: this.date(),
          value: formValue.value,
        };
        this.adjustmentAdded.emit(adjustment);
      }
    }
  }

  onDelete(): void {
    const existing = this.existingAdjustment();
    if (existing && confirm('Delete this adjustment?')) {
      this.adjustmentDeleted.emit(existing.id);
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  getValueLabel(): string {
    const type = this.form.controls.type.value;
    switch (type) {
      case 'contribution-change':
        return 'New Monthly Contribution ($)';
      case 'growth-rate-change':
        return 'New Growth Rate (%)';
      case 'one-time-deposit':
        return 'Deposit Amount ($)';
      case 'one-time-withdrawal':
        return 'Withdrawal Amount ($)';
      default:
        return 'Value';
    }
  }

  getValuePlaceholder(): string {
    const type = this.form.controls.type.value;
    switch (type) {
      case 'contribution-change':
        return '500';
      case 'growth-rate-change':
        return '7.5';
      case 'one-time-deposit':
        return '10000';
      case 'one-time-withdrawal':
        return '5000';
      default:
        return '0';
    }
  }
}
