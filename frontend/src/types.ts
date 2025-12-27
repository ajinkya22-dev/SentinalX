export interface OverviewStats {
  totalAlerts: number;
  last24hAlerts: number;
  severity: Record<string, number>;
  topSources: { source: string; count: number }[];
  recentAlerts: { id: string; severity: string; type: string; source: string; createdAt: string }[];
  incidents: Record<string, number>;
}

export interface TimeseriesPoint {
  ts: string; // ISO timestamp
  count: number;
}

export interface TimeseriesData {
  start: string;
  bucket: string;
  points: TimeseriesPoint[];
}

