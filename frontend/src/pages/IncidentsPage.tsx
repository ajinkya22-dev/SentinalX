import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Card from '../components/Card';

interface Incident {
  id: string;
  title: string;
  status: string;
  alerts: string[];
  createdAt: string;
  metadata?: {
    severity?: string;
    assignee?: string;
    priority?: string;
  };
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/api/incidents')
      .then(r => setIncidents(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredIncidents = incidents.filter(inc => 
    !statusFilter || inc.status === statusFilter
  );

  const statusColors: Record<string, string> = {
    open: 'bg-blue-600',
    in_progress: 'bg-amber-600',
    resolved: 'bg-green-600',
    closed: 'bg-gray-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎯 Incidents Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage security incidents</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Create Incident
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-600">Filter by Status:</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <div className="ml-auto text-sm text-gray-500">
            {filteredIncidents.length} incidents
          </div>
        </div>
      </Card>

      {/* Incidents List */}
      {loading ? (
        <div className="text-center py-12">Loading incidents...</div>
      ) : (
        <div className="grid gap-4">
          {filteredIncidents.map(incident => (
            <Card key={incident.id} className="hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedIncident(incident)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                    <span className={`text-xs text-white px-2 py-1 rounded ${statusColors[incident.status] || 'bg-gray-400'}`}>
                      {incident.status.replace(/_/g, ' ')}
                    </span>
                    {incident.metadata?.priority && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {incident.metadata.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span>📋 {incident.alerts?.length || 0} linked alerts</span>
                    <span>👤 {incident.metadata?.assignee || 'Unassigned'}</span>
                    <span>📅 {new Date(incident.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  View Details →
                </button>
              </div>
            </Card>
          ))}
          {filteredIncidents.length === 0 && (
            <Card>
              <div className="text-center py-12 text-gray-500">
                No incidents found
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Incident Details Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIncident(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{selectedIncident.title}</h2>
                <p className="text-sm text-gray-500">Incident ID: {selectedIncident.id}</p>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📅 Timeline</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-sm font-medium">Incident Created</p>
                        <p className="text-xs text-gray-500">{new Date(selectedIncident.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Alerts */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🚨 Linked Alerts ({selectedIncident.alerts?.length || 0})</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {selectedIncident.alerts && selectedIncident.alerts.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedIncident.alerts.map((alertId, i) => (
                        <li key={i} className="text-sm font-mono text-gray-700">
                          Alert ID: {alertId}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No alerts linked</p>
                  )}
                </div>
              </div>

              {/* Root Cause Analysis */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Root Cause Analysis</h3>
                <textarea className="w-full border rounded-lg p-3 text-sm" rows={4}
                  placeholder="Document root cause analysis..."></textarea>
              </div>

              {/* Attack Path */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🎯 Attack Path</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded">Initial Access</span>
                    <span>→</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded">Persistence</span>
                    <span>→</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Privilege Escalation</span>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📎 Evidence</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">+ Add Evidence</button>
              </div>

              {/* Actions Taken */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">✅ Actions Taken</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Containment: Isolated affected systems</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Eradication: Removed malware</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Recovery: Restored from backup</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-3 flex justify-end gap-2">
              <button onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100">
                Close
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
