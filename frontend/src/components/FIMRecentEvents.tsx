import React from 'react';

export interface FIMEvent { time: string; path: string; action: string; rule?: string }

export default function FIMRecentEvents({ events }: { events: FIMEvent[] }) {
  if (!events.length) return <div className="text-xs text-gray-500">No recent events</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="p-2">Time</th>
            <th className="p-2">Path</th>
            <th className="p-2">Action</th>
            <th className="p-2">Rule</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((e, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="p-2 text-gray-500">{new Date(e.time).toLocaleString()}</td>
              <td className="p-2 text-gray-900">{e.path}</td>
              <td className="p-2 text-gray-700">{e.action}</td>
              <td className="p-2 text-gray-700">{e.rule || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

