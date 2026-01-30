import React from 'react';
import { AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';
import { Alert } from '../core/MockDataService';

interface AlertFeedProps {
  alerts: Alert[];
}

const AlertFeed: React.FC<AlertFeedProps> = ({ alerts }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-900 bg-red-950/20';
      case 'warning':
        return 'border-yellow-900 bg-yellow-950/20';
      default:
        return 'border-blue-900 bg-blue-950/20';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-4 font-mono flex items-center gap-2">
        <AlertTriangle size={20} className="text-slate-500" />
        Alert Feed
      </h3>
      
      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <Info className="mx-auto mb-3 text-slate-700" size={32} />
          <p className="text-slate-500 font-mono text-sm">No alerts detected</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              data-testid="alert-item"
              className={`border p-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      {alert.type}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-200 text-sm font-mono mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                    <span>Column: <span className="text-slate-400">{alert.column}</span></span>
                    <span>Affected: <span className="text-slate-400">{alert.affectedRows} rows</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertFeed;