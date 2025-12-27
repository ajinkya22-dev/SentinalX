import React from 'react';

interface Scan {
  policy: string;
  endedAt: string;
  passed: number;
  failed: number;
  score: number;
}

export default function SCALatestScans({ scans }: { scans: Scan[] }) {
  if (!scans.length) return <div className="text-xs text-gray-500">No scans</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="p-2">Policy</th>
            <th className="p-2">Ended</th>
            <th className="p-2">Passed</th>
            <th className="p-2">Failed</th>
            <th className="p-2">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {scans.map((s, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="p-2 text-gray-900">{s.policy}</td>
              <td className="p-2 text-gray-500">{new Date(s.endedAt).toLocaleString()}</td>
              <td className="p-2 text-emerald-700 font-medium">{s.passed}</td>
              <td className="p-2 text-red-600 font-medium">{s.failed}</td>
              <td className="p-2 font-semibold">{s.score.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

