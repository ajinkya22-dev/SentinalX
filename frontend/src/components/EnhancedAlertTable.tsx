import React, { useEffect, useState } from 'react';
import api from '../api/client';
import AlertDetailModal from './AlertDetailModal';

interface AlertItem {
  id: string;
  source: string;
  severity: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  metadata?: {
    ip?: string;
    host?: string;
    user?: string;
  };
}

const severityColor: Record<string, string> = {
  low: 'bg-gray-600',
  medium: 'bg-yellow-600',
  high: 'bg-orange-600',
  critical: 'bg-red-600'
};

const typeIcons: Record<string, string> = {
  brute_force: '🔁',
  unauthorized_access: '🛡️',
  malware: '🦠',
  intrusion: '🚨',
  ransomware: '💀',
  phishing: '🎣',
  critical: '⚠️',
};

const EnhancedAlertTable: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [severity, setSeverity] = useState('');
  const [type, setType] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk actions
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Detail modal
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, [severity, type, source, status, timeRange]);

  const fetchAlerts = () => {
    let url = '/api/alerts?limit=200';
    if (severity) url += `&severity=${encodeURIComponent(severity)}`;
    setLoading(true);
    api.get(url)
      .then(r => setAlerts(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map(a => a.id)));
    }
    setSelectAll(!selectAll);
  };

  const toggleAlert = (id: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAlerts(newSelected);
    setSelectAll(newSelected.size === filteredAlerts.length);
  };

  // Client-side filtering
  const filteredAlerts = alerts.filter(alert => {
    if (type && alert.type !== type) return false;
    if (source && alert.source !== source) return false;
    if (status && alert.status !== status) return false;
    if (searchTerm && !alert.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (timeRange !== 'all') {
      const alertDate = new Date(alert.createdAt);
      const now = new Date();
      const diff = now.getTime() - alertDate.getTime();
      const hours = diff / (1000 * 60 * 60);
      
      if (timeRange === '24h' && hours > 24) return false;
      if (timeRange === '7d' && hours > 24 * 7) return false;
      if (timeRange === '30d' && hours > 24 * 30) return false;
    }
    
    return true;
  });

  // Export functions
  const exportToCSV = () => {
    const headers = ['ID', 'Severity', 'Type', 'Source', 'Status', 'Description', 'Created At'];
    const rows = filteredAlerts.map(a => [
      a.id,
      a.severity,
      a.type,
      a.source,
      a.status,
      a.description || '',
      a.createdAt
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts_${new Date().toISOString()}.csv`;
    a.click();
  };

  const exportToJSON = () => {
    const json = JSON.stringify(filteredAlerts, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts_${new Date().toISOString()}.json`;
    a.click();
  };

  const exportToPDF = () => {
    alert('PDF export would require a PDF library like jsPDF. For demo, showing alert.');
    // In production, use jsPDF or similar library
  };

  // Bulk actions
  const bulkMarkResolved = () => {
    Promise.all(
      Array.from(selectedAlerts).map(id =>
        api.patch(`/api/alerts/${id}/status`, { status: 'resolved' })
      )
    ).then(() => {
      fetchAlerts();
      setSelectedAlerts(new Set());
      setSelectAll(false);
    });
  };

  const bulkSuppress = () => {
    if (confirm(`Suppress ${selectedAlerts.size} alerts?`)) {
      // Implementation would mark alerts as suppressed
      alert('Bulk suppress feature would be implemented here');
    }
  };

  // Get unique values for filters
  const uniqueTypes = [...new Set(alerts.map(a => a.type))];
  const uniqueSources = [...new Set(alerts.map(a => a.source))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Alerts Management</h2>
          <p className="text-sm text-gray-500">
            {filteredAlerts.length} of {alerts.length} alerts
            {selectedAlerts.size > 0 && ` • ${selectedAlerts.size} selected`}
          </p>
        </div>
        
        {/* Export Actions */}
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 flex items-center gap-1">
            📄 CSV
          </button>
          <button onClick={exportToJSON} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 flex items-center gap-1">
            📋 JSON
          </button>
          <button onClick={exportToPDF} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 flex items-center gap-1">
            📑 PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Severity */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">🔥 Severity</label>
            <select value={severity} onChange={e => setSeverity(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">🛡️ Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="">All</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">🌐 Source</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="">All</option>
              {uniqueSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">✔️ Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="">All</option>
              <option value="new">New</option>
              <option value="investigating">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>

          {/* Time Range */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">📅 Time Range</label>
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="all">All Time</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">🔍 Search</label>
            <input type="text" placeholder="Search description..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
        </div>

        {/* Clear Filters */}
        <button onClick={() => {
          setSeverity(''); setType(''); setSource(''); setStatus(''); setTimeRange('all'); setSearchTerm('');
        }} className="mt-3 text-xs text-blue-600 hover:text-blue-800">
          Clear all filters
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedAlerts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-blue-900">
            <strong>{selectedAlerts.size}</strong> alert{selectedAlerts.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button onClick={bulkMarkResolved} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
              ✓ Mark Resolved
            </button>
            <button onClick={bulkSuppress} className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
              🔇 Suppress
            </button>
            <button onClick={() => alert('Assign analyst feature')} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              👤 Assign
            </button>
            <button onClick={() => { setSelectedAlerts(new Set()); setSelectAll(false); }}
              className="px-3 py-1 text-sm border rounded hover:bg-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading && <div className="text-center py-8">Loading alerts...</div>}
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b">
                <tr>
                  <th className="p-3 text-left">
                    <input type="checkbox" checked={selectAll} onChange={toggleSelectAll}
                      className="rounded" />
                  </th>
                  <th className="p-3 text-left">Severity</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Created</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAlerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAlertId(alert.id)}>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox"
                        checked={selectedAlerts.has(alert.id)}
                        onChange={() => toggleAlert(alert.id)}
                        className="rounded" />
                    </td>
                    <td className="p-3">
                      <span className={`inline-block text-xs text-white px-2 py-1 rounded font-medium ${severityColor[alert.severity]}`}>
                        {alert.severity === 'critical' && '⚠️ '}
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-gray-900">
                      <span>
                        {typeIcons[alert.type] || ''} {alert.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 max-w-xs truncate">
                      {alert.description || 'No description'}
                    </td>
                    <td className="p-3 text-gray-600">{alert.source}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        alert.status === 'investigating' ? 'bg-amber-100 text-amber-800' :
                        alert.status === 'false_positive' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      {new Date(alert.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelectedAlertId(alert.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs">
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No alerts found matching your filters
            </div>
          )}
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlertId && (
        <AlertDetailModal alertId={selectedAlertId} onClose={() => setSelectedAlertId(null)} />
      )}
    </div>
  );
};

export default EnhancedAlertTable;
