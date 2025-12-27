import { useEffect, useState } from 'react';
import AlertTable from './components/AlertTable';
import Dashboard from './pages/Dashboard';

function App() {
  const [tab, setTab] = useState('dashboard');
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">SentinalX</h1>
          <nav className="space-x-2">
            <button className={`px-3 py-1 rounded ${tab==='dashboard'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={() => setTab('dashboard')}>Dashboard</button>
            <button className={`px-3 py-1 rounded ${tab==='alerts'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={() => setTab('alerts')}>Alerts</button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'dashboard' ? <Dashboard /> : <AlertTable />}
      </main>
    </div>
  );
}

export default App;

