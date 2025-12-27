import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  data: Record<string, number>;
}

const COLORS: Record<string, string> = {
  low: '#6B7280',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

export default function SeverityPie({ data }: Props) {
  const labels = Object.keys(data);
  const values = labels.map(k => data[k]);
  const bg = labels.map(k => COLORS[k] || '#9CA3AF');

  const chart = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: bg,
        borderWidth: 1,
      },
    ],
  };

  return <Doughnut data={chart} />;
}

