import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { ProjectionResult } from '../services/projection-calculator.service';

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface TooltipParam {
  axisValue: string;
  color: string;
  seriesName: string;
  value: number;
}

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

  readonly opts = computed<EChartsOption>(() => {
    const proj = this.projection();
    const sym = this.currencySymbol();
    const pts = proj.dataPoints;

    return {
      backgroundColor: 'transparent',
      legend: {
        data: ['Projected Value', 'Real Value (Inflation-Adjusted)', 'Invested Amount'],
        textStyle: { color: '#64748b' },
        top: '0%',
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#1e293b' },
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const arr = params as TooltipParam[];
          if (!arr?.length) return '';

          const fmt = (n: number) =>
            n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

          let html = `<div style="font-weight: bold; margin-bottom: 4px;">${arr[0].axisValue}</div>`;

          arr.forEach((p) => {
            html += `
              <div style="display: flex; align-items: center; margin-top: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${p.color}; margin-right: 8px; border-radius: 50%;"></span>
                <span>${p.seriesName}: ${sym}${fmt(p.value)}</span>
              </div>
            `;
          });

          if (arr.length >= 2) {
            const growth = arr[0].value - arr[arr.length - 1].value;
            const growthPct =
              arr[arr.length - 1].value > 0
                ? ((growth / arr[arr.length - 1].value) * 100).toFixed(1)
                : '0.0';
            html += `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                <div>Growth: ${sym}${fmt(growth)} (${growthPct}%)</div>
              </div>
            `;
          }

          return html;
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
        data: pts.map((p) => p.date.toLocaleDateString()),
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
          name: 'Projected Value',
          type: 'bar',
          data: pts.map((p) => p.value),
          itemStyle: { color: '#3b82f6' },
        },
        {
          name: 'Real Value (Inflation-Adjusted)',
          type: 'bar',
          data: pts.map((p) => p.realValue),
          itemStyle: { color: '#f59e0b' },
        },
        {
          name: 'Invested Amount',
          type: 'bar',
          data: pts.map((p) => p.investedAmount),
          itemStyle: { color: '#10b981' },
        },
      ],
    };
  });
}
