import React from 'react';

export interface Tactic { name: string; count: number }

export default function MitreTactics({ tactics }: { tactics: Tactic[] }) {
  if (!tactics.length) return <div className="text-xs text-gray-500">No data</div>;
  return (
    <ul className="text-sm divide-y divide-gray-100">
      {tactics.map(t => (
        <li key={t.name} className="flex items-center justify-between py-2">
          <span className="text-gray-700">{t.name}</span>
          <span className="font-medium text-gray-900">{t.count}</span>
        </li>
      ))}
    </ul>
  );
}

