import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import SeverityPie from '../components/SeverityPie';
import EventsTrend from '../components/EventsTrend';
import TopSources from '../components/TopSources';
import RecentAlerts from '../components/RecentAlerts';
import IncidentsStatus from '../components/IncidentsStatus';
import ComplianceDonut from '../components/ComplianceDonut';
import MitreTactics from '../components/MitreTactics';
import FIMRecentEvents from '../components/FIMRecentEvents';
import SCALatestScans from '../components/SCALatestScans';
import type { OverviewStats, TimeseriesData } from '../types';
import api from '../api/client.ts';

interface ComplianceData { standard: string; segments: { label: string; value: number }[] }
interface MitreData { tactics: { name: string; count: number }[] }
interface FimData { events: { time: string; path: string; action: string; rule?: string }[] }
interface ScaData { scans: { policy: string; endedAt: string; passed: number; failed: number; score: number }[] }

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [trend, setTrend] = useState<TimeseriesData | null>(null);
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [mitre, setMitre] = useState<MitreData | null>(null);
  const [fim, setFim] = useState<FimData | null>(null);
  const [sca, setSca] = useState<ScaData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get('/api/stats/overview'),
      api.get('/api/stats/timeseries?days=7&bucket=day'),
      api.get('/api/stats/compliance'),
      api.get('/api/stats/mitre'),
      api.get('/api/stats/fim/recent'),
      api.get('/api/stats/sca/latest'),
    ])
      .then(([ovr, ts, comp, mitreRes, fimRes, scaRes]) => {
        if (!mounted) return;
        setOverview(ovr.data);
        setTrend(ts.data);
        setCompliance(comp.data);
        setMitre(mitreRes.data);
        setFim(fimRes.data);
        setSca(scaRes.data);
      })
      .catch((e) => setError(e.message));
    return () => { mounted = false; };
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!overview || !trend || !compliance || !mitre || !fim || !sca) return <div>Loading dashboard…</div>;

  return (
    <div className="grid gap-6" style={{gridTemplateColumns: 'repeat(12, minmax(0, 1fr))'}}>
      <Card className="col-span-12" title="Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Metric label="Total alerts" value={overview.totalAlerts} />
          <Metric label="Alerts (24h)" value={overview.last24hAlerts} />
          <Metric label="Open incidents" value={overview.incidents.open || 0} />
          <Metric label="In progress" value={overview.incidents.in_progress || 0} />
          <Metric label="Resolved" value={overview.incidents.resolved || 0} />
          <Metric label="Closed" value={overview.incidents.closed || 0} />
        </div>
      </Card>

      <Card className="col-span-12 md:col-span-3" title="MITRE Top Tactics">
        <MitreTactics tactics={mitre.tactics} />
      </Card>

      <Card className="col-span-12 md:col-span-3" title="Compliance">
        <ComplianceDonut segments={compliance.segments} standard={compliance.standard} />
      </Card>

      <Card className="col-span-12 md:col-span-3" title="Severity Distribution">
        <SeverityPie data={overview.severity} />
      </Card>

      <Card className="col-span-12 md:col-span-3" title="Incidents Status">
        <IncidentsStatus counts={overview.incidents} />
      </Card>

      <Card className="col-span-12 md:col-span-6" title="Events Count Evolution">
        <EventsTrend points={trend.points} />
      </Card>

      <Card className="col-span-12 md:col-span-6" title="Recent Alerts">
        <RecentAlerts items={overview.recentAlerts} />
      </Card>

      <Card className="col-span-12 md:col-span-6" title="Top Sources">
        <TopSources items={overview.topSources} />
      </Card>

      <Card className="col-span-12 md:col-span-6" title="File Integrity (Recent)">
        <FIMRecentEvents events={fim.events} />
      </Card>

      <Card className="col-span-12" title="SCA Latest Scans">
        <SCALatestScans scans={sca.scans} />
      </Card>
    </div>
  );
};

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-200 rounded p-4 bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export default Dashboard;
