import React, { useEffect, useState } from 'react';
import api from '../api/client.ts';

interface AlertItem {
  id: string;
  source: string;
  severity: string;
  type: string;
  createdAt: string;
}

const severityColor: Record<string,string> = {
  low: 'bg-gray-600',
  medium: 'bg-yellow-600',
  high: 'bg-orange-600',
  critical: 'bg-red-600'
};

const AlertTable: React.FC = () => {
  const [alerts,setAlerts] = useState<AlertItem[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [severity,setSeverity] = useState('');

  useEffect(()=>{
    let url = '/api/alerts?limit=200';
    if (severity) url += `&severity=${encodeURIComponent(severity)}`;
    setLoading(true);
    api.get(url)
      .then(r=> setAlerts(r.data))
      .catch(e=> setError(e.message))
      .finally(()=> setLoading(false));
  },[severity]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide">Alerts</h2>
        <select className="border rounded px-2 py-1 text-sm" value={severity} onChange={e=> setSeverity(e.target.value)}>
          <option value="">All severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left">
                <th className="p-2">Severity</th>
                <th className="p-2">Type</th>
                <th className="p-2">Source</th>
                <th className="p-2">Created</th>
                <th className="p-2">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alerts.map(a=> (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="p-2"><span className={`text-xs text-white px-2 py-0.5 rounded ${severityColor[a.severity] || 'bg-gray-400'}`}>{a.severity}</span></td>
                  <td className="p-2 text-gray-900">{a.type}</td>
                  <td className="p-2 text-gray-700">{a.source}</td>
                  <td className="p-2 text-gray-500">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="p-2 font-mono text-[11px] text-gray-500">{a.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AlertTable;
