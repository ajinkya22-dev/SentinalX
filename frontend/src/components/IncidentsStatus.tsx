import React from 'react';

export default function IncidentsStatus({ counts }: { counts: Record<string, number> }) {
  const keys = ['open', 'in_progress', 'resolved', 'closed'];
  const labels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  const color: Record<string, string> = {
    open: 'bg-blue-600',
    in_progress: 'bg-amber-600',
    resolved: 'bg-emerald-600',
    closed: 'bg-gray-600',
  };
  return (
    <div className="grid grid-cols-2 gap-4">
      {keys.map(k => (
        <div key={k} className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-3 h-3 rounded-full ${color[k]}`}></span>
            <span className="text-sm text-gray-600">{labels[k]}</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{counts[k] || 0}</div>
        </div>
      ))}
    </div>
  );
}

