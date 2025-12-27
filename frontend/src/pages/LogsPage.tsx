import React, { useState } from 'react';
import Card from '../components/Card';

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const logSources = [
    { name: 'Suricata IDS', status: 'active', lastHeartbeat: '30s ago', eventsToday: 15234 },
    { name: 'Wazuh', status: 'active', lastHeartbeat: '1m ago', eventsToday: 8942 },
    { name: 'EDR Agent', status: 'active', lastHeartbeat: '45s ago', eventsToday: 3421 },
    { name: 'Firewall', status: 'active', lastHeartbeat: '2m ago', eventsToday: 45231 },
    { name: 'CloudTrail', status: 'warning', lastHeartbeat: '10m ago', eventsToday: 1123 },
  ];

  const mockLogs = [
    { id: 1, timestamp: new Date().toISOString(), source: 'Suricata', host: 'web-srv-01', message: 'Potential SQL injection attempt detected', severity: 'high' },
    { id: 2, timestamp: new Date().toISOString(), source: 'Wazuh', host: 'app-srv-02', message: 'File integrity check: /etc/passwd modified', severity: 'critical' },
    { id: 3, timestamp: new Date().toISOString(), source: 'Firewall', host: 'fw-01', message: 'Blocked connection from 185.220.101.5', severity: 'medium' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📝 Logs Explorer</h1>
        <p className="text-sm text-gray-500 mt-1">Search and analyze security logs</p>
      </div>

      {/* Log Search */}
      <Card title="🔍 Log Search">
        <div className="space-y-3">
          <div className="flex gap-3">
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
              className="border rounded px-3 py-2 text-sm">
              <option value="">All Sources</option>
              <option value="suricata">Suricata</option>
              <option value="wazuh">Wazuh</option>
              <option value="edr">EDR</option>
              <option value="firewall">Firewall</option>
              <option value="cloudtrail">CloudTrail</option>
            </select>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search logs by keyword, host, or message..."
              className="flex-1 border rounded px-3 py-2 text-sm" />
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              Search
            </button>
          </div>
        </div>
      </Card>

      {/* Log Results */}
      <Card title="📋 Log Results">
        <div className="space-y-2">
          {mockLogs.map(log => (
            <div key={log.id} onClick={() => setSelectedLog(log)}
              className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{log.source}</span>
                    <span className="text-xs text-gray-500">{log.host}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{log.severity}</span>
                  </div>
                  <p className="text-sm text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-xs">View JSON →</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Log Sources Status */}
      <Card title="🌐 Log Sources">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logSources.map((source, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{source.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  source.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {source.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>💓 Heartbeat: {source.lastHeartbeat}</p>
                <p>📊 Events today: {source.eventsToday.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* JSON Viewer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Log Details (JSON)</h2>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                &times;
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
