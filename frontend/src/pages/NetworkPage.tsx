import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Bar, Line } from 'react-chartjs-2';

export default function NetworkPage() {
  const [timeRange, setTimeRange] = useState('1h');

  const topIPs = [
    { ip: '192.168.1.50', connections: 8234, bytes: '450 MB', country: 'Internal' },
    { ip: '185.220.101.5', connections: 152, bytes: '2.3 MB', country: 'RU', flagged: true },
    { ip: '10.0.2.15', connections: 6891, bytes: '320 MB', country: 'Internal' },
    { ip: '203.0.113.45', connections: 89, bytes: '1.8 MB', country: 'CN', flagged: true },
  ];

  const topPorts = [
    { port: 443, protocol: 'HTTPS', connections: 15234, percentage: 45 },
    { port: 80, protocol: 'HTTP', connections: 8942, percentage: 26 },
    { port: 22, protocol: 'SSH', connections: 3421, percentage: 10 },
    { port: 3389, protocol: 'RDP', connections: 1234, percentage: 4 },
  ];

  const idsEvents = [
    { category: 'Attempted User Privilege Gain', count: 45, severity: 'high' },
    { category: 'Web Application Attack', count: 32, severity: 'critical' },
    { category: 'Potentially Bad Traffic', count: 128, severity: 'medium' },
    { category: 'Misc Attack', count: 15, severity: 'high' },
  ];

  const anomalyData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'Traffic Volume (Mbps)',
      data: [45, 52, 180, 210, 195, 95],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    }]
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🌐 Network Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Network traffic analysis and IDS events</p>
      </div>

      {/* Network Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card title="Total Connections">
          <p className="text-3xl font-bold text-blue-600">34,521</p>
          <p className="text-xs text-gray-500 mt-1">Last hour</p>
        </Card>
        <Card title="Data Transferred">
          <p className="text-3xl font-bold text-green-600">1.2 GB</p>
          <p className="text-xs text-gray-500 mt-1">Last hour</p>
        </Card>
        <Card title="Unique IPs">
          <p className="text-3xl font-bold text-purple-600">892</p>
          <p className="text-xs text-gray-500 mt-1">Active now</p>
        </Card>
        <Card title="IDS Alerts">
          <p className="text-3xl font-bold text-red-600">220</p>
          <p className="text-xs text-gray-500 mt-1">Last hour</p>
        </Card>
      </div>

      {/* Traffic Trend */}
      <Card title="📊 Traffic Trend">
        <Line data={anomalyData} options={{ 
          responsive: true, 
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }} />
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top IPs */}
        <Card title="🔝 Top IP Addresses">
          <div className="space-y-2">
            {topIPs.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{item.ip}</span>
                    {item.flagged && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Flagged</span>}
                  </div>
                  <p className="text-xs text-gray-500">{item.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.connections.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{item.bytes}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Ports */}
        <Card title="🔌 Top Ports">
          <div className="space-y-2">
            {topPorts.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{item.port} ({item.protocol})</span>
                  <span className="text-gray-600">{item.connections.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* IDS Events */}
      <Card title="🚨 IDS Events by Category">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Count</th>
                <th className="p-3 text-left">Severity</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {idsEvents.map((event, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3">{event.category}</td>
                  <td className="p-3 font-semibold">{event.count}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{event.severity}</span>
                  </td>
                  <td className="p-3">
                    <button className="text-blue-600 hover:text-blue-800 text-xs">View Details →</button>
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
