import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { ProjectionResult } from '../services/projection-calculator.service';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

declare const $localize: (messageParts: TemplateStringsArray, ...expressions: readonly any[]) => string;

interface TooltipParam {
  axisValue: string;
  color: string;
  seriesName: string;
  value: number;
}

const CHART_COLORS = {
  projected: '#2ba7faff',
  afterTaxReal: '#9c59b6ff',
  real: '#25e655fa',
  invested: '#979921fd',
} as const;

@Component({
  selector: 'app-projection-graph',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  template: `<div echarts [options]="opts()" class="chart-container"></div>`,
  styleUrl: './projection-graph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectionGraphComponent {
  readonly projection = input.required<ProjectionResult>();
  readonly currencySymbol = input.required<string>();

  private readonly labels = computed(() => ({
    projectedValue: $localize`:@@projectedValue:Projected Value`,
    realValue: $localize`:@@realValue:Real Value (Inflation-Adjusted)`,
    afterTaxRealValue: $localize`:@@afterTaxRealValue:Final Take-Home (After Tax & Inflation)`,
    investedAmount: $localize`:@@investedAmount:Invested Amount`,
    growth: $localize`:@@growth:Growth`,
  }));

  readonly opts = computed<EChartsOption>(() => {
    const proj = this.projection();
    const sym = this.currencySymbol();
    const pts = proj.dataPoints;
    const labels = this.labels();

    const dates = pts.map((p) => p.date.toLocaleDateString());
    const values = pts.map((p) => p.value);
    const realValues = pts.map((p) => p.realValue);
    const afterTaxRealValues = pts.map((p) => p.afterTaxRealValue);
    const invested = pts.map((p) => p.investedAmount);

    return {
      backgroundColor: 'transparent',
      animation: true,
      legend: {
        data: [labels.projectedValue, labels.realValue, labels.afterTaxRealValue, labels.investedAmount],
        textStyle: { color: '#64748b', fontSize: 13 },
        top: '0%',
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f1623',
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f8fafc', fontSize: 13 },
        axisPointer: {
          type: 'shadow',
          shadowStyle: { color: 'rgba(100, 116, 139, 0.1)' },
        },
        padding: 12,
        formatter: (params: unknown) => this.formatTooltip(params, sym, labels.growth),
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#64748b', rotate: 45 },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#64748b',
          formatter: (val: number) => `${sym}${(val / 1000).toFixed(0)}k`,
        },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
      },
      series: [
        {
          name: labels.projectedValue,
          type: 'line',
          data: values,
          smooth: true,
          lineStyle: { color: CHART_COLORS.projected, width: 2 },
          areaStyle: { color: CHART_COLORS.projected, opacity: 0.6 },
          emphasis: { focus: 'series' },
        },
        {
          name: labels.realValue,
          type: 'line',
          data: realValues,
          smooth: true,
          lineStyle: { color: CHART_COLORS.real, width: 2 },
          areaStyle: { color: CHART_COLORS.real, opacity: 0.6 },
          emphasis: { focus: 'series' },
        },
        {
          name: labels.afterTaxRealValue,
          type: 'line',
          data: afterTaxRealValues,
          smooth: true,
          lineStyle: { color: CHART_COLORS.afterTaxReal, width: 2 },
          areaStyle: { color: CHART_COLORS.afterTaxReal, opacity: 0.6 },
          emphasis: { focus: 'series' },
        },
        {
          name: labels.investedAmount,
          type: 'line',
          data: invested,
          smooth: true,
          lineStyle: { color: CHART_COLORS.invested, width: 2 },
          areaStyle: { color: CHART_COLORS.invested, opacity: 0.6 },
          emphasis: { focus: 'series' },
        },
      ],
    };
  });

  private formatTooltip(params: unknown, currencySymbol: string, growthLabel: string): string {
    const arr = params as TooltipParam[];
    if (!arr?.length) return '';

    const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

    // Date header
    const parts = [`<div style="font-weight:700;margin-bottom:8px;color:#f8fafc">${arr[0].axisValue}</div>`];

    // Value rows
    arr.forEach((p) => {
      parts.push(`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;gap:16px">
          <div style="display:flex;align-items:center">
            <span style="display:inline-block;width:10px;height:10px;background:${p.color};margin-right:8px;border-radius:50%"></span>
            <span style="color:#cbd5e1">${p.seriesName}:</span>
          </div>
          <span style="font-weight:700;color:#f8fafc">${currencySymbol}${fmt(p.value)}</span>
        </div>
      `);
    });

    // Growth calculation
    if (arr.length >= 2) {
      const growth = arr[0].value - arr[arr.length - 1].value;
      const growthPct = arr[arr.length - 1].value > 0
        ? ((growth / arr[arr.length - 1].value) * 100).toFixed(1)
        : '0.0';
      const isPositive = growth >= 0;
      const growthColor = isPositive ? '#34d399' : '#f87171';

      parts.push(`
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #1e293b">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="color:#cbd5e1">${growthLabel}:</span>
            <span style="font-weight:700;color:${growthColor}">
              ${isPositive ? '+' : ''}${currencySymbol}${fmt(growth)} (${isPositive ? '+' : ''}${growthPct}%)
            </span>
          </div>
        </div>
      `);
    }

    return parts.join('');
  }
}
