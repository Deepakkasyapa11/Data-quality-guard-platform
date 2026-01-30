import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, TrendingUp } from 'lucide-react';
import { dataService, EcommerceRow } from '../core/MockDataService';
import { calculateStats, generateDistributionData } from '../core/statsUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from './ui/button';

const DatasetDetail: React.FC = () => {
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<EcommerceRow[]>([]);
  const [priceStats, setPriceStats] = useState<any>(null);
  const [priceDistribution, setPriceDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadDataset();
  }, []);

  const loadDataset = async () => {
    try {
      const data = await dataService.getDataset();
      setDataset(data);

      const prices = data.map(row => row.price).filter(p => !isNaN(p));
      const stats = calculateStats(prices);
      setPriceStats(stats);

      const distribution = generateDistributionData(prices, 20);
      setPriceDistribution(distribution);
    } catch (error) {
      console.error('Failed to load dataset:', error);
    }
  };

  const highlightAnomalies = (row: EcommerceRow) => {
    const anomalies = [];
    if (!row.email || row.email === '') anomalies.push('email');
    if (row.price > 10000) anomalies.push('price');
    return anomalies;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              onClick={() => navigate('/')}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Dataset Explorer</h1>
              <p className="text-slate-500 font-mono text-sm">{dataset.length} rows loaded</p>
            </div>
          </div>
        </div>

        {priceStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-4 font-mono flex items-center gap-2">
                <TrendingUp size={20} className="text-slate-500" />
                Price Distribution
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priceDistribution}>
                  <XAxis 
                    dataKey="bin" 
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #334155',
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#475569" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-4 font-mono">Statistical Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-3">
                  <p className="text-slate-500 text-xs font-mono mb-1">MEAN</p>
                  <p className="text-slate-200 text-lg font-mono">${priceStats.mean.toFixed(2)}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3">
                  <p className="text-slate-500 text-xs font-mono mb-1">STD DEV</p>
                  <p className="text-slate-200 text-lg font-mono">${priceStats.stdDev.toFixed(2)}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3">
                  <p className="text-slate-500 text-xs font-mono mb-1">MIN</p>
                  <p className="text-slate-200 text-lg font-mono">${priceStats.min.toFixed(2)}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3">
                  <p className="text-slate-500 text-xs font-mono mb-1">MAX</p>
                  <p className="text-slate-200 text-lg font-mono">${priceStats.max.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 font-mono flex items-center gap-2">
              <Database size={20} className="text-slate-500" />
              Raw Data View
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dataset.map((row) => {
                  const anomalies = highlightAnomalies(row);
                  return (
                    <tr 
                      key={row.id} 
                      data-testid="data-row"
                      className={`hover:bg-slate-800/50 ${
                        anomalies.length > 0 ? 'bg-red-950/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-slate-400">{row.id}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-300">{row.orderId}</td>
                      <td className={`px-4 py-3 text-sm font-mono ${
                        anomalies.includes('email') ? 'text-red-400' : 'text-slate-300'
                      }`}>
                        {row.email || <span className="text-red-500">NULL</span>}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-300">{row.productName}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-300">{row.quantity}</td>
                      <td className={`px-4 py-3 text-sm font-mono ${
                        anomalies.includes('price') ? 'text-red-400 font-bold' : 'text-slate-300'
                      }`}>
                        ${row.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-300">
                        <span className={`px-2 py-1 text-xs border ${
                          row.status === 'completed' ? 'border-emerald-800 text-emerald-400' :
                          row.status === 'pending' ? 'border-yellow-800 text-yellow-400' :
                          row.status === 'shipped' ? 'border-blue-800 text-blue-400' :
                          'border-slate-700 text-slate-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetDetail;