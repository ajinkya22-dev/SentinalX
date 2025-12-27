import React, { useState } from 'react';
import Dashboard from './pages/Dashboard.tsx';
import EnhancedAlertTable from './components/EnhancedAlertTable.tsx';
import IncidentsPage from './pages/IncidentsPage.tsx';
import ThreatIntelPage from './pages/ThreatIntelPage.tsx';
import LogsPage from './pages/LogsPage.tsx';
import NetworkPage from './pages/NetworkPage.tsx';
import FIMPage from './pages/FIMPage.tsx';
import AssetsPage from './pages/AssetsPage.tsx';
import ReportsPage from './pages/ReportsPage.tsx';
import AdminSettingsPage from './pages/AdminSettingsPage.tsx';

type PageType = 'dashboard' | 'alerts' | 'incidents' | 'threat-intel' | 'logs' | 'network' | 'fim' | 'assets' | 'reports' | 'settings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🟥' },
    { id: 'alerts', label: 'Alerts', icon: '🟧' },
    { id: 'incidents', label: 'Incidents', icon: '🟩' },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: '🟨' },
    { id: 'logs', label: 'Logs', icon: '🟪' },
    { id: 'network', label: 'Network', icon: '🟫' },
    { id: 'fim', label: 'File Integrity', icon: '🟦' },
    { id: 'assets', label: 'Assets', icon: '🟩' },
    { id: 'reports', label: 'Reports', icon: '🟫' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    setMenuOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'alerts': return <EnhancedAlertTable />;
      case 'incidents': return <IncidentsPage />;
      case 'threat-intel': return <ThreatIntelPage />;
      case 'logs': return <LogsPage />;
      case 'network': return <NetworkPage />;
      case 'fim': return <FIMPage />;
      case 'assets': return <AssetsPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <AdminSettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white border-r shadow-lg z-50 transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">SentinalX</h2>
              <p className="text-xs text-gray-500">SOC Dashboard</p>
            </div>
            <button 
              onClick={() => setMenuOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Scrollable Menu Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id as PageType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  currentPage === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}>
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-100 rounded transition"
                aria-label="Toggle menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold tracking-wide">SentinalX</h1>
              <span className="text-xs text-gray-500">SOC Dashboard</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1500px] mx-auto px-6 py-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
