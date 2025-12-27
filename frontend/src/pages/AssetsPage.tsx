import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api/client.ts';

interface WazuhAgent {
  id: string;
  name: string;
  ip: string;
  status: string;
  os?: {
    name?: string;
    platform?: string;
    version?: string;
  };
  version?: string;
  lastKeepAlive?: string;
  group?: string[];
}

export default function AssetsPage() {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [agents, setAgents] = useState<WazuhAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/wazuh/agents?limit=500');
      if (response.data?.success) {
        setAgents(response.data.data || []);
      } else {
        setError('Failed to fetch agents');
      }
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      setError(err.message || 'Failed to connect to Wazuh');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'never_connected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastSeen = (timestamp: string | undefined) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return timestamp;
    }
  };

  const activeAgents = agents.filter(a => a.status?.toLowerCase() === 'active').length;
  const disconnectedAgents = agents.filter(a => a.status?.toLowerCase() === 'disconnected').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">💻 Wazuh Agents</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading agents...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">💻 Wazuh Agents</h1>
        <Card>
          <div className="text-red-600 p-4">
            <p className="font-semibold">Error loading agents:</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={fetchAgents}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💻 Wazuh Agents</h1>
          <p className="text-sm text-gray-500 mt-1">Connected agents from Wazuh Manager</p>
        </div>
        <button 
          onClick={fetchAgents}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          🔄 Refresh
        </button>
      </div>

      {/* Agent Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card title="Total Agents">
          <p className="text-3xl font-bold text-blue-600">{agents.length}</p>
          <p className="text-xs text-gray-500 mt-1">Registered with Wazuh</p>
        </Card>
        <Card title="Active Now">
          <p className="text-3xl font-bold text-green-600">{activeAgents}</p>
          <p className="text-xs text-gray-500 mt-1">Connected & reporting</p>
        </Card>
        <Card title="Disconnected">
          <p className="text-3xl font-bold text-red-600">{disconnectedAgents}</p>
          <p className="text-xs text-gray-500 mt-1">Not responding</p>
        </Card>
        <Card title="Manager IP">
          <p className="text-xl font-bold text-purple-600 font-mono">10.71.38.232</p>
          <p className="text-xs text-gray-500 mt-1">Wazuh Manager</p>
        </Card>
      </div>

      {/* Agents Table */}
      <Card title="🖥️ Agent Inventory">
        {agents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No agents found</p>
            <p className="text-sm mt-2">Connect agents to your Wazuh manager at 10.71.38.232</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left">Agent ID</th>
                  <th className="p-3 text-left">Agent Name</th>
                  <th className="p-3 text-left">Operating System</th>
                  <th className="p-3 text-left">IP Address</th>
                  <th className="p-3 text-left">Version</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Last Seen</th>
                  <th className="p-3 text-left">Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {agents.map(agent => (
                  <tr key={agent.id} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAsset(agent)}>
                    <td className="p-3 font-mono text-xs font-semibold">{agent.id}</td>
                    <td className="p-3 font-semibold">{agent.name || 'N/A'}</td>
                    <td className="p-3">
                      {agent.os?.name || agent.os?.platform || 'Unknown'}
                      {agent.os?.version && <span className="text-gray-500 text-xs"> ({agent.os.version})</span>}
                    </td>
                    <td className="p-3 font-mono text-xs">{agent.ip || 'N/A'}</td>
                    <td className="p-3 text-xs">{agent.version || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(agent.status)}`}>
                        {agent.status || 'unknown'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{formatLastSeen(agent.lastKeepAlive)}</td>
                    <td className="p-3 text-xs">
                      {agent.group?.length ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {agent.group.join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
