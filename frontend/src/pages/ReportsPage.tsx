import React, { useState } from 'react';
import Card from '../components/Card';
import { Line } from 'react-chartjs-2';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('executive');
  const [timeRange, setTimeRange] = useState('week');

  const scheduledReports = [
    { name: 'Daily Security Summary', frequency: 'Daily', nextRun: '6:00 AM', recipients: 'soc-team@company.com', status: 'active' },
    { name: 'Weekly Executive Report', frequency: 'Weekly', nextRun: 'Monday 8:00 AM', recipients: 'executives@company.com', status: 'active' },
    { name: 'Monthly Compliance Report', frequency: 'Monthly', nextRun: '1st of month', recipients: 'compliance@company.com', status: 'active' },
  ];

  const metricsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'MTTR (hours)',
        data: [4.2, 3.8, 5.1, 3.5, 4.0, 2.9, 3.2],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'MTTD (hours)',
        data: [2.1, 1.9, 2.5, 1.8, 2.0, 1.5, 1.6],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Generate reports and track SOC metrics</p>
      </div>

      {/* Generate Report */}
      <Card title="📝 Generate Report">
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm">
                <option value="executive">Executive Summary</option>
                <option value="technical">Technical Deep Dive</option>
                <option value="compliance">Compliance Report</option>
                <option value="incident">Incident Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm">
                <option value="day">Last 24 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* SOC Metrics */}
      <Card title="📈 SOC Performance Metrics">
        <Line data={metricsData} options={{ 
          responsive: true, 
          plugins: { 
            legend: { position: 'top' },
            title: { display: true, text: 'Mean Time To Respond (MTTR) vs Mean Time To Detect (MTTD)' }
          },
          scales: { y: { beginAtZero: true } }
        }} />
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="⏱️ MTTR">
          <p className="text-3xl font-bold text-blue-600">3.8 hrs</p>
          <p className="text-xs text-gray-500 mt-1">-12% from last week</p>
        </Card>
        <Card title="🔍 MTTD">
          <p className="text-3xl font-bold text-green-600">1.9 hrs</p>
          <p className="text-xs text-gray-500 mt-1">-18% from last week</p>
        </Card>
        <Card title="✅ Resolution Rate">
          <p className="text-3xl font-bold text-purple-600">94.2%</p>
          <p className="text-xs text-gray-500 mt-1">+3% from last week</p>
        </Card>
      </div>

      {/* Scheduled Reports */}
      <Card title="🕒 Scheduled Reports">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Report Name</th>
                <th className="p-3 text-left">Frequency</th>
                <th className="p-3 text-left">Next Run</th>
                <th className="p-3 text-left">Recipients</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scheduledReports.map((report, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold">{report.name}</td>
                  <td className="p-3">{report.frequency}</td>
                  <td className="p-3 text-gray-600">{report.nextRun}</td>
                  <td className="p-3 text-xs font-mono">{report.recipients}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {report.status}
                    </span>
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

      {/* Recent Reports */}
      <Card title="📄 Recent Reports">
        <div className="space-y-2">
          {[
            { name: 'Executive Summary - Week 47', date: '2024-11-18', size: '2.4 MB' },
            { name: 'Incident Analysis - October', date: '2024-11-01', size: '5.1 MB' },
            { name: 'Compliance Report - Q3', date: '2024-10-15', size: '8.7 MB' },
          ].map((report, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-semibold">{report.name}</p>
                  <p className="text-xs text-gray-500">{report.date} • {report.size}</p>
                </div>
              </div>
              <button className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm">Download</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
