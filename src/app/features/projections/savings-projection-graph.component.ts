import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  inject,
} from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  MarkPointComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { EChartsType } from 'echarts/core';
import { SavingsAccount } from '../../models/savings-account.model';
import { ProjectionCalculatorService } from '../../services/projection-calculator.service';
import { AdjustmentMarkerPopupComponent } from './adjustment-marker-popup.component';
import { AccountService } from '../../services/account.service';
import { TimelineAdjustment } from '../../models/timeline-adjustment.model';
import { CurrencyService } from '../../services/currency.service';


interface ChartClickEvent {
  componentType: string;
  componentSubType?: string;
  dataIndex?: number;
  data?: {
    adjustmentId?: string;
    adjustmentIndex?: number;
  };
  event: {
    event: {
      pageX: number;
      pageY: number;
    };
  };
}

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, MarkPointComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-savings-projection-graph',
  imports: [NgxEchartsDirective, AdjustmentMarkerPopupComponent],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './savings-projection-graph.component.html',
  styleUrl: './savings-projection-graph.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavingsProjectionGraphComponent {
  private readonly calculatorService = inject(ProjectionCalculatorService);
  private readonly accountService = inject(AccountService);
  private readonly currencyService = inject(CurrencyService);

  readonly account = input.required<SavingsAccount>();
  readonly inflationRate = input<number>(0);
  readonly taxRate = input<number>(0);

  private readonly chartInstance = signal<EChartsType | null>(null);
  readonly showPopup = signal(false);
  readonly clickedDate = signal<Date | null>(null);
  readonly editingAdjustment = signal<TimelineAdjustment | null>(null);

  // Map to store adjustments by their coordinate for tooltip lookup
  private adjustmentsByCoord = new Map<string, TimelineAdjustment>();

  readonly chartOptions = computed<EChartsOption>(() => {
    const acc = this.account();
    const projection = this.calculatorService.calculateProjection(
      acc,
      this.inflationRate(),
      this.taxRate()
    );

    const dates = projection.dataPoints.map((p) => p.date.toLocaleDateString());
    const values = projection.dataPoints.map((p) => p.value);
    const investedAmounts = projection.dataPoints.map((p) => p.investedAmount);
    const realValues = projection.dataPoints.map((p) => p.realValue);

    // Clear and rebuild the adjustments map
    this.adjustmentsByCoord.clear();

    // Create markers for adjustments
    const markPoints = acc.adjustments.map((adj, index) => {
      const dateStr = adj.date.toLocaleDateString();
      const dataIndex = dates.indexOf(dateStr);
      const coordKey = `${dataIndex}`;

      // Store adjustment in map for tooltip lookup
      this.adjustmentsByCoord.set(coordKey, adj);

      return {
        name: adj.type,
        coord: [dataIndex >= 0 ? dataIndex : 0, values[dataIndex >= 0 ? dataIndex : 0] || 0],
        value: adj.id, // Use ID as value for identification
        itemStyle: {
          color: this.getAdjustmentColor(adj.type),
        },
        label: {
          show: false, // Hide label text
        },
        symbol: 'pin',
        symbolSize: 50,
        adjustmentId: adj.id, // Store adjustment ID for click handling
        adjustmentIndex: index, // Store index for reference
      };
    });

    return {
      backgroundColor: 'transparent',
      legend: {
        data: ['Projected Value', 'Real Value (Inflation-Adjusted)', 'Invested Amount'],
        textStyle: {
          color: '#9CA3AF',
        },
        top: '0%',
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: '#374151',
        textStyle: {
          color: '#F9FAFB',
        },
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: unknown) => {
          const paramArray = params as any[];

          if (!paramArray || paramArray.length === 0) {
            return '';
          }

          // Check if this is a mark point (adjustment marker)
          const firstParam = paramArray[0];
          if (firstParam.componentSubType === 'markPoint') {
            // Try to get adjustment by ID from value field
            const adjustmentId = firstParam.value;
            if (adjustmentId) {
              const adjustment = acc.adjustments.find(adj => adj.id === adjustmentId);
              if (adjustment) {
                return this.getAdjustmentTooltip(adjustment);
              }
            }

            // Fallback: try to get by coordinate
            if (firstParam.data?.coord && Array.isArray(firstParam.data.coord)) {
              const coordKey = `${firstParam.data.coord[0]}`;
              const adjustment = this.adjustmentsByCoord.get(coordKey);
              if (adjustment) {
                return this.getAdjustmentTooltip(adjustment);
              }
            }

            return 'Adjustment marker';
          }

          // Regular bar tooltip showing both values
          const date = firstParam.axisValue;
          let tooltipContent = `<div style="font-weight: bold; margin-bottom: 4px;">${date}</div>`;

          paramArray.forEach((param) => {
            const color = param.color;
            const seriesName = param.seriesName;
            const value = param.value;
            tooltipContent += `
              <div style="display: flex; align-items: center; margin-top: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; margin-right: 8px; border-radius: 50%;"></span>
                <span>${seriesName}: ${this.formatCurrency(value)}</span>
              </div>
            `;
          });

          // Add growth amount if we have the values
          if (paramArray.length >= 2) {
            const projectedValue = paramArray[0].value;
            const investedValue = paramArray[paramArray.length - 1].value; // Last one is invested amount
            const growth = projectedValue - investedValue;
            const growthPercent = investedValue > 0 ? (growth / investedValue * 100).toFixed(1) : '0.0';
            tooltipContent += `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #374151;">
                <div>Growth: ${this.formatCurrency(growth)} (${growthPercent}%)</div>
              </div>
            `;
          }

          return tooltipContent;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          color: '#9CA3AF',
          rotate: 45,
        },
        axisLine: {
          lineStyle: {
            color: '#374151',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#9CA3AF',
          formatter: (value: number) => {
            const accountCurrency = this.account().currency;
            const convertedValue = this.currencyService.convertBetweenCurrencies(
              value,
              accountCurrency,
              this.currencyService.selectedCurrency().code
            );
            const symbol = this.currencyService.selectedCurrency().symbol;
            return `${symbol}${(convertedValue / 1000).toFixed(0)}k`;
          },
        },
        axisLine: {
          lineStyle: {
            color: '#374151',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#374151',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: 'Projected Value',
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#3B82F6',
          },
          markPoint: {
            data: markPoints,
          },
        },
        {
          name: 'Real Value (Inflation-Adjusted)',
          type: 'bar',
          data: realValues,
          itemStyle: {
            color: '#F59E0B',
          },
        },
        {
          name: 'Invested Amount',
          type: 'bar',
          data: investedAmounts,
          itemStyle: {
            color: '#10B981',
          },
        },
      ],
    };
  });

  onChartInit(chart: EChartsType): void {
    this.chartInstance.set(chart);

    chart.on('click', (params: unknown) => {
      const clickEvent = params as ChartClickEvent;

      // Check if clicked on a marker (markPoint)
      if (clickEvent.componentType === 'markPoint') {
        const adjustmentId = clickEvent.data?.adjustmentId;
        if (adjustmentId) {
          this.onMarkerClick(adjustmentId);
        }
        return;
      }

      // Otherwise handle regular series click to add new adjustment
      if (clickEvent.componentType === 'series' && clickEvent.dataIndex !== undefined) {
        const dataIndex = clickEvent.dataIndex;
        const projection = this.calculatorService.calculateProjection(
          this.account(),
          this.inflationRate(),
          this.taxRate()
        );
        const clickedDataPoint = projection.dataPoints[dataIndex];

        if (clickedDataPoint) {
          this.clickedDate.set(clickedDataPoint.date);
          this.editingAdjustment.set(null);
          this.showPopup.set(true);
        }
      }
    });
  }

  onMarkerClick(adjustmentId: string): void {
    const adjustment = this.account().adjustments.find(adj => adj.id === adjustmentId);
    if (adjustment) {
      // Open edit popup for the clicked adjustment
      this.editingAdjustment.set(adjustment);
      this.clickedDate.set(adjustment.date);
      this.showPopup.set(true);
    }
  }

  onPopupClose(): void {
    this.showPopup.set(false);
    this.clickedDate.set(null);
    this.editingAdjustment.set(null);
  }

  onAdjustmentAdded(adjustment: TimelineAdjustment): void {
    this.accountService.addAdjustment(this.account().id, adjustment);
    this.showPopup.set(false);
    this.clickedDate.set(null);
    this.editingAdjustment.set(null);
  }

  onAdjustmentUpdated(adjustment: TimelineAdjustment): void {
    this.accountService.updateAdjustment(this.account().id, adjustment.id, adjustment);
    this.showPopup.set(false);
    this.clickedDate.set(null);
    this.editingAdjustment.set(null);
  }

  onAdjustmentDeleted(adjustmentId: string): void {
    this.accountService.deleteAdjustment(this.account().id, adjustmentId);
    this.showPopup.set(false);
    this.clickedDate.set(null);
    this.editingAdjustment.set(null);
  }

  private formatCurrency(value: number): string {
    return this.currencyService.formatAccountAmount(value, this.account().currency);
  }

  private getAdjustmentColor(type: string): string {
    switch (type) {
      case 'contribution-change':
        return '#F59E0B';
      case 'growth-rate-change':
        return '#8B5CF6';
      case 'one-time-deposit':
        return '#10B981';
      case 'one-time-withdrawal':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }

  private getAdjustmentTooltip(adjustment: TimelineAdjustment): string {
    const typeLabels: Record<string, string> = {
      'contribution-change': 'Monthly Contribution Change',
      'growth-rate-change': 'Growth Rate Change',
      'one-time-deposit': 'One-time Deposit',
      'one-time-withdrawal': 'One-time Withdrawal',
    };

    const typeLabel = typeLabels[adjustment.type] || adjustment.type;
    const date = adjustment.date.toLocaleDateString();

    let valueStr: string;
    if (adjustment.type === 'growth-rate-change') {
      valueStr = `${adjustment.value}%`;
    } else {
      valueStr = this.formatCurrency(adjustment.value);
    }

    return `
      <div style="font-weight: bold; margin-bottom: 4px;">${typeLabel}</div>
      <div>Date: ${date}</div>
      <div>Value: ${valueStr}</div>
      <div style="margin-top: 4px; font-size: 11px; color: #9CA3AF;">Click to delete</div>
    `;
  }
}
