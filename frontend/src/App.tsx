import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DatasetDetail from './components/DatasetDetail';
import { dataService } from './core/MockDataService';

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        await dataService.init();
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    initDB();
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-slate-400 font-mono">Initializing Data Quality Guard...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dataset" element={<DatasetDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;