import React, { useState } from 'react';
import Card from '../components/Card';

export default function ThreatIntelPage() {
  const [iocQuery, setIocQuery] = useState('');
  const [iocType, setIocType] = useState('ip');
  const [iocResult, setIocResult] = useState<any>(null);

  const lookupIOC = () => {
    // Mock IOC lookup
    setIocResult({
      value: iocQuery,
      type: iocType,
      reputation: 'Malicious',
      asn: 'AS15169 Google LLC',
      country: 'United States',
      previousAlerts: 12,
      lastSeen: new Date().toISOString(),
    });
  };

  const threatFeeds = [
    { name: 'Malicious IPs', count: 1247, lastUpdate: '5 min ago', source: 'AbuseIPDB' },
    { name: 'Phishing Domains', count: 834, lastUpdate: '15 min ago', source: 'PhishTank' },
    { name: 'Malware Hashes', count: 456, lastUpdate: '1 hour ago', source: 'VirusTotal' },
    { name: 'C2 Servers', count: 92, lastUpdate: '30 min ago', source: 'OSINT' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🔍 Threat Intelligence</h1>
        <p className="text-sm text-gray-500 mt-1">IOC lookup and threat feed monitoring</p>
      </div>

      {/* IOC Lookup Tool */}
      <Card title="🎯 IOC Lookup Tool">
        <div className="space-y-4">
          <div className="flex gap-3">
            <select value={iocType} onChange={e => setIocType(e.target.value)}
              className="border rounded px-3 py-2 text-sm">
              <option value="ip">IP Address</option>
              <option value="domain">Domain</option>
              <option value="hash">File Hash</option>
              <option value="url">URL</option>
            </select>
            <input type="text" value={iocQuery} onChange={e => setIocQuery(e.target.value)}
              placeholder={`Enter ${iocType}...`}
              className="flex-1 border rounded px-3 py-2 text-sm" />
            <button onClick={lookupIOC}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              Lookup
            </button>
          </div>

          {iocResult && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Value</p>
                  <p className="text-sm font-mono font-medium">{iocResult.value}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reputation</p>
                  <span className="text-sm font-medium px-2 py-1 bg-red-100 text-red-800 rounded">
                    {iocResult.reputation}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ASN</p>
                  <p className="text-sm">{iocResult.asn}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="text-sm">{iocResult.country}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Previous Alerts</p>
                  <p className="text-sm font-semibold text-red-600">{iocResult.previousAlerts}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Seen</p>
                  <p className="text-sm">{new Date(iocResult.lastSeen).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Threat Feeds */}
      <Card title="📡 Active Threat Feeds">
        <div className="grid md:grid-cols-2 gap-4">
          {threatFeeds.map((feed, i) => (
            <div key={i} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{feed.name}</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📊 {feed.count} indicators</p>
                <p>🔄 Updated {feed.lastUpdate}</p>
                <p>🌐 Source: {feed.source}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent IOCs */}
      <Card title="⚠️ Recently Added IOCs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Threat</th>
                <th className="p-3 text-left">Source</th>
                <th className="p-3 text-left">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-gray-50">
                <td className="p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">IP</span></td>
                <td className="p-3 font-mono text-xs">185.220.101.5</td>
                <td className="p-3">Brute Force</td>
                <td className="p-3">AbuseIPDB</td>
                <td className="p-3 text-gray-500">2 hours ago</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-3"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Domain</span></td>
                <td className="p-3 font-mono text-xs">malicious-site.com</td>
                <td className="p-3">Phishing</td>
                <td className="p-3">PhishTank</td>
                <td className="p-3 text-gray-500">5 hours ago</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-3"><span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Hash</span></td>
                <td className="p-3 font-mono text-xs">a1b2c3d4e5f6...</td>
                <td className="p-3">Malware</td>
                <td className="p-3">VirusTotal</td>
                <td className="p-3 text-gray-500">1 day ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
