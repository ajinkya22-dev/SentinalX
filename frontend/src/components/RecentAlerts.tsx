import React from 'react';

export interface RecentAlertItem {
  id: string;
  severity: string;
  type: string;
  source: string;
  createdAt: string;
}

const SevBadge = ({ sev }: { sev: string }) => {
  const map: Record<string, string> = {
    low: 'bg-gray-600',
    medium: 'bg-yellow-600',
    high: 'bg-orange-600',
    critical: 'bg-red-600',
  };
  return (
    <span className={`text-white text-xs px-2 py-0.5 rounded ${map[sev] || 'bg-gray-400'}`}>{sev}</span>
  );
};

export default function RecentAlerts({ items }: { items: RecentAlertItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="p-2">Severity</th>
            <th className="p-2">Type</th>
            <th className="p-2">Source</th>
            <th className="p-2">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(a => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="p-2"><SevBadge sev={a.severity} /></td>
              <td className="p-2 text-gray-900">{a.type}</td>
              <td className="p-2 text-gray-700">{a.source}</td>
              <td className="p-2 text-gray-500">{new Date(a.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

