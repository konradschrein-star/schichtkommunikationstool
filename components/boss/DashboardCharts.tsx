'use client';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface ProductivityChartProps {
  data?: number[];
  labels?: string[];
}

export function ProductivityChart({
  data = [78, 82, 75, 88, 92, 85, 90],
  labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
}: ProductivityChartProps) {
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    grid: {
      top: 40,
      right: 30,
      bottom: 30,
      left: 50,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#2d333b',
          width: 2,
        },
      },
      axisLabel: {
        color: '#768390',
        fontSize: 14,
        fontWeight: 500,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: '#2d333b',
          type: 'dashed',
          width: 1,
        },
      },
      axisLabel: {
        color: '#768390',
        fontSize: 14,
        formatter: '{value}%',
      },
    },
    series: [
      {
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#8a2be2' },
              { offset: 1, color: '#00bfff' },
            ],
          },
          shadowColor: '#8a2be2',
          shadowBlur: 10,
        },
        itemStyle: {
          color: '#00bfff',
          borderWidth: 2,
          borderColor: '#0d1117',
          shadowColor: '#00bfff',
          shadowBlur: 8,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(138, 43, 226, 0.3)' },
              { offset: 1, color: 'rgba(0, 191, 255, 0.05)' },
            ],
          },
        },
        emphasis: {
          itemStyle: {
            color: '#00bfff',
            borderColor: '#fff',
            borderWidth: 3,
            shadowColor: '#00bfff',
            shadowBlur: 15,
          },
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(13, 17, 23, 0.95)',
      borderColor: '#8a2be2',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 14,
      },
      formatter: (params: any) => {
        const param = params[0];
        return `
          <div style="padding: 4px 8px;">
            <div style="color: #768390; font-size: 12px; margin-bottom: 4px;">${param.name}</div>
            <div style="font-size: 18px; font-weight: bold; color: #00bfff;">
              ${param.value}%
            </div>
          </div>
        `;
      },
    },
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '300px', width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}

interface HindranceHeatmapProps {
  data?: number[][];
}

export function HindranceHeatmap({
  data = [
    [0, 0, 2], [0, 1, 1], [0, 2, 3],
    [1, 0, 0], [1, 1, 4], [1, 2, 2],
    [2, 0, 1], [2, 1, 0], [2, 2, 5],
    [3, 0, 3], [3, 1, 2], [3, 2, 1],
    [4, 0, 0], [4, 1, 1], [4, 2, 0],
    [5, 0, 2], [5, 1, 3], [5, 2, 4],
    [6, 0, 1], [6, 1, 0], [6, 2, 2],
  ]
}: HindranceHeatmapProps) {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const shifts = ['Nacht', 'Tag 1', 'Tag 2'];

  const heatmapData = data.map(item => [item[0], item[1], item[2] || 0]);

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    grid: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 80,
    },
    xAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#2d333b',
        },
      },
      axisLabel: {
        color: '#768390',
        fontSize: 14,
        fontWeight: 500,
      },
    },
    yAxis: {
      type: 'category',
      data: shifts,
      splitArea: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#2d333b',
        },
      },
      axisLabel: {
        color: '#768390',
        fontSize: 14,
        fontWeight: 500,
      },
    },
    visualMap: {
      min: 0,
      max: 5,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#1c2128', '#8a2be2', '#ff0055'],
      },
      textStyle: {
        color: '#768390',
        fontSize: 12,
      },
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: '#8a2be2',
            borderColor: '#00bfff',
            borderWidth: 2,
          },
        },
        itemStyle: {
          borderRadius: 4,
          borderColor: '#0d1117',
          borderWidth: 2,
        },
      },
    ],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(13, 17, 23, 0.95)',
      borderColor: '#8a2be2',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 14,
      },
      formatter: (params: any) => {
        const value = params.value;
        return `
          <div style="padding: 4px 8px;">
            <div style="color: #768390; font-size: 12px; margin-bottom: 4px;">
              ${days[value[0]]} - ${shifts[value[1]]}
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #ff0055;">
              ${value[2]} Behinderungen
            </div>
          </div>
        `;
      },
    },
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '360px', width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
