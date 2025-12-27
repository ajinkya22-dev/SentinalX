import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

interface Segment { label: string; value: number; }
export default function ComplianceDonut({ segments, standard }: { segments: Segment[]; standard: string }) {
  const data = {
    labels: segments.map(s => s.label),
    datasets: [
      {
        data: segments.map(s => s.value),
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">Standard: {standard}</div>
      <Doughnut data={data} />
    </div>
  );
}

