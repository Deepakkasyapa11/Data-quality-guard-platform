import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { dataService, Alert } from '../core/MockDataService';
import { ValidationEngine } from '../core/ValidationEngine';
import AlertFeed from './AlertFeed';
import { Button } from './ui/button';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, trend }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 hover:border-slate-700 transition-colors">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mb-2">{title}</p>
        <p className="text-3xl font-bold text-slate-100 mb-1 font-mono">{value}</p>
        {subtitle && <p className="text-slate-400 text-sm font-mono">{subtitle}</p>}
      </div>
      <div className="text-slate-600">{icon}</div>
    </div>
    {trend && (
      <div className="mt-4 pt-4 border-t border-slate-800">
        <span className={`text-xs font-mono ${
          trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-500'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trend.toUpperCase()}
        </span>
      </div>
    )}
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [metrics, setMetrics] = useState({
    totalRows: 0,
    alertCount: 0,
    criticalAlerts: 0,
    dataQualityScore: 100,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const dataset = await dataService.getDataset();
      const alertList = await dataService.getAlerts();
      const criticalCount = alertList.filter(a => a.severity === 'critical').length;
      
      const qualityScore = dataset.length > 0 
        ? Math.max(0, 100 - (alertList.length / dataset.length) * 100)
        : 100;

      setMetrics({
        totalRows: dataset.length,
        alertCount: alertList.length,
        criticalAlerts: criticalCount,
        dataQualityScore: Math.round(qualityScore),
      });
      setAlerts(alertList);
      setSeeded(dataset.length > 0);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    try {
      await dataService.seedDemoData();
      await dataService.clearAlerts();
      
      const dataset = await dataService.getDataset();
      const engine = new ValidationEngine();
      
      const validationConfigs = [
        { strategy: 'Completeness', column: 'email' },
        { strategy: 'Uniqueness', column: 'orderId' },
        { strategy: 'NumericalRange', column: 'price', threshold: 3 },
      ];

      const results = engine.validateAll(dataset, validationConfigs);

      for (const result of results) {
        if (!result.isValid) {
          await dataService.addAlert({
            timestamp: new Date(),
            severity: result.severity,
            type: validationConfigs.find(c => result.message.includes(c.column))?.strategy || 'Unknown',
            message: result.message,
            column: validationConfigs.find(c => result.message.includes(c.column))?.column || 'Unknown',
            affectedRows: result.failedRows.length,
          });
        }
      }

      await loadMetrics();
    } catch (error) {
      console.error('Failed to seed data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-100 mb-2 tracking-tight">Data Quality Guard</h1>
            <p className="text-slate-500 font-mono text-sm">Real-time metadata monitoring platform</p>
          </div>
          <div className="flex gap-3">
            <Button
              data-testid="seed-demo-btn"
              onClick={handleSeedData}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-mono"
            >
              {loading ? 'Seeding...' : seeded ? 'Reseed Demo Data' : 'Seed Demo Data'}
            </Button>
            {seeded && (
              <Button
                data-testid="view-dataset-btn"
                onClick={() => navigate('/dataset')}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono"
              >
                View Dataset
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Rows"
            value={metrics.totalRows.toLocaleString()}
            icon={<Database size={32} />}
            trend="stable"
          />
          <MetricCard
            title="Active Alerts"
            value={metrics.alertCount}
            subtitle={`${metrics.criticalAlerts} critical`}
            icon={<AlertTriangle size={32} />}
            trend={metrics.alertCount > 0 ? 'up' : 'stable'}
          />
          <MetricCard
            title="DQ Score"
            value={`${metrics.dataQualityScore}%`}
            icon={<CheckCircle size={32} />}
            trend={metrics.dataQualityScore > 95 ? 'up' : metrics.dataQualityScore < 80 ? 'down' : 'stable'}
          />
          <MetricCard
            title="Validation Rules"
            value="3"
            subtitle="Active monitors"
            icon={<Activity size={32} />}
            trend="stable"
          />
        </div>

        {!seeded && (
          <div className="bg-slate-900 border border-slate-800 p-12 text-center mb-8">
            <Database className="mx-auto mb-4 text-slate-600" size={48} />
            <h3 className="text-xl font-bold text-slate-300 mb-2">No Data Loaded</h3>
            <p className="text-slate-500 font-mono text-sm mb-6">Click "Seed Demo Data" to generate 100 rows with 3 DQ failures</p>
          </div>
        )}

        {seeded && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AlertFeed alerts={alerts} />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-4 font-mono">Validation Rules</h3>
              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 p-4">
                  <p className="text-slate-300 font-mono text-sm mb-1">Completeness Check</p>
                  <p className="text-slate-500 text-xs font-mono">email column</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4">
                  <p className="text-slate-300 font-mono text-sm mb-1">Uniqueness Check</p>
                  <p className="text-slate-500 text-xs font-mono">orderId column</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4">
                  <p className="text-slate-300 font-mono text-sm mb-1">Anomaly Detection</p>
                  <p className="text-slate-500 text-xs font-mono">price (z-score &gt; 3)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;