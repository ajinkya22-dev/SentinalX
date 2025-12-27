import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  points: { ts: string; count: number }[];
}

export default function EventsTrend({ points }: Props) {
  const labels = points.map(p => new Date(p.ts).toLocaleString());
  const data = {
    labels,
    datasets: [
      {
        label: 'Alerts',
        data: points.map(p => p.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.2,
        fill: true,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  } as const;

  return <Line data={data} options={options} />;
}

