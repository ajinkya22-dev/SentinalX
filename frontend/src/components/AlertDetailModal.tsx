import React, { useState, useEffect } from 'react';
import api from '../api/client';

interface AlertDetail {
  id: string;
  source: string;
  severity: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  metadata?: {
    ip?: string;
    host?: string;
    user?: string;
    [key: string]: any;
  };
}

interface Props {
  alertId: string;
  onClose: () => void;
}

const severityColor: Record<string, string> = {
  low: 'bg-gray-600',
  medium: 'bg-yellow-600',
  high: 'bg-orange-600',
  critical: 'bg-red-600'
};

const mitreMapping: Record<string, string[]> = {
  intrusion: ['Initial Access', 'Persistence'],
  brute_force: ['Credential Access', 'Initial Access'],
  privilege_escalation: ['Privilege Escalation', 'Defense Evasion'],
  data_exfiltration: ['Exfiltration', 'Command and Control'],
  malware: ['Execution', 'Persistence', 'Defense Evasion'],
  lateral_movement: ['Lateral Movement', 'Discovery'],
  ransomware: ['Impact', 'Defense Evasion'],
  phishing: ['Initial Access', 'Credential Access'],
};

export default function AlertDetailModal({ alertId, onClose }: Props) {
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    api.get(`/api/alerts/${alertId}`)
      .then(r => setAlert(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [alertId]);

  const updateStatus = (newStatus: string) => {
    api.patch(`/api/alerts/${alertId}/status`, { status: newStatus })
      .then(() => {
        if (alert) setAlert({ ...alert, status: newStatus });
      })
      .catch(e => console.error(e));
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6">Loading...</div>
    </div>
  );

  if (!alert) return null;

  const mitreTactics = mitreMapping[alert.type] || ['Unknown'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Alert Details</h2>
            <p className="text-sm text-gray-500 font-mono">{alert.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Alert Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Alert Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Severity</p>
                <span className={`inline-block text-xs text-white px-2 py-1 rounded mt-1 ${severityColor[alert.severity]}`}>
                  {alert.severity.toUpperCase()}
                  {alert.severity === 'critical' && ' ⚠️'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {alert.type === 'brute_force' && '🔁 '}
                  {alert.type === 'unauthorized_access' && '🛡️ '}
                  {alert.type.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{alert.source}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Detected</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{alert.description || 'No description available'}</p>
          </div>

          {/* IOC Section */}
          {alert.metadata && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Indicators of Compromise (IOC)</h3>
              <div className="grid grid-cols-2 gap-4">
                {alert.metadata.ip && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs text-blue-600 font-medium">Source IP</p>
                    <p className="text-sm font-mono text-gray-900 mt-1">{alert.metadata.ip}</p>
                  </div>
                )}
                {alert.metadata.host && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <p className="text-xs text-purple-600 font-medium">Host</p>
                    <p className="text-sm font-mono text-gray-900 mt-1">{alert.metadata.host}</p>
                  </div>
                )}
                {alert.metadata.user && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-xs text-green-600 font-medium">User</p>
                    <p className="text-sm font-mono text-gray-900 mt-1">{alert.metadata.user}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MITRE ATT&CK */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">MITRE ATT&CK Mapping</h3>
            <div className="flex flex-wrap gap-2">
              {mitreTactics.map((tactic, i) => (
                <span key={i} className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full border border-red-300">
                  {tactic}
                </span>
              ))}
            </div>
          </div>

          {/* Raw Logs */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Raw Metadata (JSON)</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify({ ...alert, metadata: alert.metadata || {} }, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
            <div className="space-y-3">
              {/* Status */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Change Status</label>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus('new')} 
                    className={`px-3 py-1 rounded text-sm ${alert.status === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    New
                  </button>
                  <button onClick={() => updateStatus('investigating')} 
                    className={`px-3 py-1 rounded text-sm ${alert.status === 'investigating' ? 'bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    Investigating
                  </button>
                  <button onClick={() => updateStatus('false_positive')} 
                    className={`px-3 py-1 rounded text-sm ${alert.status === 'false_positive' ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    False Positive
                  </button>
                  <button onClick={() => updateStatus('resolved')} 
                    className={`px-3 py-1 rounded text-sm ${alert.status === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    Resolved
                  </button>
                </div>
              </div>

              {/* Assign Analyst */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Assign Analyst</label>
                <input type="text" placeholder="Enter analyst name" value={assignee} onChange={e => setAssignee(e.target.value)}
                  className="border rounded px-3 py-1 text-sm w-full max-w-xs" />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Add Notes</label>
                <textarea placeholder="Investigation notes..." value={notes} onChange={e => setNotes(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full" rows={3} />
              </div>

              {/* Attach Evidence */}
              <div>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  📎 Attach Evidence
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">
            Close
          </button>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
