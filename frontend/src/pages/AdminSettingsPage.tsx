import React, { useState } from 'react';
import Card from '../components/Card';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('users');

  const users = [
    { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'Analyst', status: 'active', lastLogin: '5 hours ago' },
    { id: 3, name: 'Bob Wilson', email: 'bob@company.com', role: 'Viewer', status: 'inactive', lastLogin: '2 days ago' },
  ];

  const alertRules = [
    { id: 1, name: 'Brute Force Detection', severity: 'high', conditions: 'Failed logins > 5', action: 'Create Alert', enabled: true },
    { id: 2, name: 'Port Scan Detection', severity: 'medium', conditions: 'Port scans > 10', action: 'Create Alert', enabled: true },
    { id: 3, name: 'Large Data Transfer', severity: 'low', conditions: 'Data transfer > 1GB', action: 'Log Only', enabled: false },
  ];

  const logSources = [
    { id: 1, name: 'Suricata IDS', type: 'IDS', status: 'connected', endpoint: 'tcp://192.168.1.10:514', eventsPerMin: 120 },
    { id: 2, name: 'Wazuh Agent', type: 'EDR', status: 'connected', endpoint: 'https://wazuh.company.com', eventsPerMin: 85 },
    { id: 3, name: 'Firewall Logs', type: 'Firewall', status: 'disconnected', endpoint: 'syslog://192.168.1.1:514', eventsPerMin: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Admin Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users, alerts, integrations, and system configuration</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex gap-6">
          {['users', 'alerts', 'sources', 'system', 'api'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'users' ? '👥 Users & Roles' :
               tab === 'alerts' ? '🔔 Alert Rules' :
               tab === 'sources' ? '📡 Log Sources' :
               tab === 'system' ? '🖥️ System Health' :
               '🔑 API Keys'}
            </button>
          ))}
        </nav>
      </div>

      {/* Users & Roles Tab */}
      {activeTab === 'users' && (
        <Card title="👥 User Management">
          <div className="mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              + Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Last Login</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold">{user.name}</td>
                    <td className="p-3 text-gray-600">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'Analyst' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{user.role}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>{user.status}</span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{user.lastLogin}</td>
                    <td className="p-3">
                      <button className="text-blue-600 hover:text-blue-800 text-xs mr-2">Edit</button>
                      <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Alert Rules Tab */}
      {activeTab === 'alerts' && (
        <Card title="🔔 Alert Rule Configuration">
          <div className="mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              + Create Rule
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left">Rule Name</th>
                  <th className="p-3 text-left">Severity</th>
                  <th className="p-3 text-left">Conditions</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {alertRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold">{rule.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        rule.severity === 'high' ? 'bg-red-100 text-red-800' :
                        rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>{rule.severity}</span>
                    </td>
                    <td className="p-3 text-gray-600 font-mono text-xs">{rule.conditions}</td>
                    <td className="p-3">{rule.action}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>{rule.enabled ? 'Enabled' : 'Disabled'}</span>
                    </td>
                    <td className="p-3">
                      <button className="text-blue-600 hover:text-blue-800 text-xs mr-2">Edit</button>
                      <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Log Sources Tab */}
      {activeTab === 'sources' && (
        <Card title="📡 Log Source Connections">
          <div className="mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              + Add Source
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left">Source Name</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Endpoint</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Events/Min</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logSources.map(source => (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold">{source.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {source.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-600">{source.endpoint}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        source.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>{source.status}</span>
                    </td>
                    <td className="p-3 font-semibold">{source.eventsPerMin}</td>
                    <td className="p-3">
                      <button className="text-blue-600 hover:text-blue-800 text-xs mr-2">Test</button>
                      <button className="text-blue-600 hover:text-blue-800 text-xs mr-2">Edit</button>
                      <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card title="CPU Usage">
              <p className="text-3xl font-bold text-blue-600">34%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '34%' }}></div>
              </div>
            </Card>
            <Card title="Memory Usage">
              <p className="text-3xl font-bold text-green-600">58%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '58%' }}></div>
              </div>
            </Card>
            <Card title="Disk Usage">
              <p className="text-3xl font-bold text-orange-600">72%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </Card>
          </div>
          <Card title="🖥️ System Information">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform:</span>
                  <span className="font-semibold">SentinalX v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="font-semibold">12 days, 4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Database:</span>
                  <span className="font-semibold">MongoDB 7.0</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">API Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Queue Size:</span>
                  <span className="font-semibold">142 jobs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Workers:</span>
                  <span className="font-semibold">8 active</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <Card title="🔑 API Key Management">
          <div className="mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              + Generate Key
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'VirusTotal API', key: 'vt_********************', created: '2024-10-15', lastUsed: '2 hours ago', status: 'active' },
              { name: 'AbuseIPDB API', key: 'ab_********************', created: '2024-10-20', lastUsed: '5 hours ago', status: 'active' },
              { name: 'Slack Webhook', key: 'sk_********************', created: '2024-11-01', lastUsed: '1 day ago', status: 'inactive' },
            ].map((api, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{api.name}</h3>
                    <p className="font-mono text-xs text-gray-600 mb-2">{api.key}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Created: {api.created}</span>
                      <span>Last used: {api.lastUsed}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      api.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>{api.status}</span>
                    <button className="text-red-600 hover:text-red-800 text-xs">Revoke</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
