import React from 'react';

export default function TopSources({ items }: { items: { source: string; count: number }[] }) {
  return (
    <ul className="divide-y divide-gray-100 text-sm">
      {items.map((s, idx) => (
        <li key={idx} className="py-2 flex items-center justify-between">
          <span className="text-gray-700">{s.source || 'unknown'}</span>
          <span className="font-medium text-gray-900">{s.count}</span>
        </li>
      ))}
    </ul>
  );
}

