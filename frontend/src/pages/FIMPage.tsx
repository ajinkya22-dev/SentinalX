import React, { useState } from 'react';
import Card from '../components/Card';

export default function FIMPage() {
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const fimEvents = [
    { id: 1, file: '/etc/passwd', host: 'web-srv-01', action: 'modified', timestamp: new Date().toISOString(), oldHash: 'a1b2c3d4...', newHash: 'e5f6g7h8...', severity: 'critical' },
    { id: 2, file: '/var/www/html/index.php', host: 'app-srv-02', action: 'modified', timestamp: new Date().toISOString(), oldHash: 'x9y8z7w6...', newHash: 'v5u4t3s2...', severity: 'high' },
    { id: 3, file: '/etc/shadow', host: 'db-srv-01', action: 'read', timestamp: new Date().toISOString(), oldHash: 'p1q2r3s4...', newHash: 'p1q2r3s4...', severity: 'medium' },
    { id: 4, file: '/bin/bash', host: 'web-srv-01', action: 'deleted', timestamp: new Date().toISOString(), oldHash: 'm5n6o7p8...', newHash: null, severity: 'critical' },
  ];

  const monitoredPaths = [
    { path: '/etc', host: 'All Servers', files: 234, lastCheck: '2 min ago', status: 'active' },
    { path: '/var/www', host: 'Web Servers', files: 892, lastCheck: '5 min ago', status: 'active' },
    { path: '/bin', host: 'All Servers', files: 156, lastCheck: '1 min ago', status: 'active' },
    { path: '/usr/local/bin', host: 'App Servers', files: 67, lastCheck: '3 min ago', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📁 File Integrity Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor file system changes and detect unauthorized modifications</p>
      </div>

      {/* FIM Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card title="Events Today">
          <p className="text-3xl font-bold text-blue-600">127</p>
          <p className="text-xs text-gray-500 mt-1">+12 from yesterday</p>
        </Card>
        <Card title="Critical Changes">
          <p className="text-3xl font-bold text-red-600">8</p>
          <p className="text-xs text-gray-500 mt-1">Require attention</p>
        </Card>
        <Card title="Monitored Files">
          <p className="text-3xl font-bold text-green-600">1,349</p>
          <p className="text-xs text-gray-500 mt-1">Across 12 hosts</p>
        </Card>
        <Card title="Integrity Score">
          <p className="text-3xl font-bold text-purple-600">98.2%</p>
          <p className="text-xs text-gray-500 mt-1">System-wide</p>
        </Card>
      </div>

      {/* Recent FIM Events */}
      <Card title="🔔 Recent File Integrity Events">
        <div className="space-y-2">
          {fimEvents.map(event => (
            <div key={event.id} onClick={() => setSelectedFile(event)}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{event.severity}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.action === 'modified' ? 'bg-blue-100 text-blue-800' :
                      event.action === 'deleted' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{event.action}</span>
                    <span className="text-xs text-gray-500">{event.host}</span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-gray-900 mb-1">{event.file}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="text-gray-500">Old Hash: </span>
                      <span className="font-mono">{event.oldHash}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">New Hash: </span>
                      <span className="font-mono">{event.newHash || 'N/A'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-xs ml-4">Details →</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monitored Paths */}
      <Card title="📂 Monitored Paths">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Path</th>
                <th className="p-3 text-left">Host Filter</th>
                <th className="p-3 text-left">Files</th>
                <th className="p-3 text-left">Last Check</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monitoredPaths.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{item.path}</td>
                  <td className="p-3">{item.host}</td>
                  <td className="p-3 font-semibold">{item.files}</td>
                  <td className="p-3 text-gray-500">{item.lastCheck}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
