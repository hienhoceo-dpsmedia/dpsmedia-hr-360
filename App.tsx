import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { StaffInfo, AggregatedMetrics, DateRange, Kudos } from './types';
import { fetchStaffList, fetchAggregatedMetrics, fetchCurrentUser, fetchKudos } from './services/dataService';
import IndividualView from './views/IndividualView';
import ComparisonView from './views/ComparisonView';
import LeaderboardView from './views/LeaderboardView';
import GlobalRankingView from './views/GlobalRankingView';
import MyDashboardView from './views/MyDashboardView';
import DateRangePicker from './components/DateRangePicker';
import { Filter, Sun, Moon, Menu, RefreshCw } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<StaffInfo | null>(null);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [metrics, setMetrics] = useState<AggregatedMetrics[]>([]);
  const [myKudos, setMyKudos] = useState<Kudos[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Date Logic: Default to "This Month" (1st to Today)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { startDate: start, endDate: end };
  });

  // Toggle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Real-time Sync Simulation
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000); // Sync for 2 seconds every 30s
    }, 30000);
    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);

        const staff = await fetchStaffList();
        setStaffList(staff);

        const aggMetrics = await fetchAggregatedMetrics(dateRange);
        setMetrics(aggMetrics);

        const kudos = await fetchKudos(user.lark_email);
        setMyKudos(kudos);

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [dateRange]); // Refetch when dateRange changes

  const handleLogout = () => {
    alert("Logged out (Simulation)");
    window.location.reload();
  };

  // Filtering Logic
  const filteredMetrics = selectedDept === 'All'
    ? metrics
    : metrics.filter(m => m.department === selectedDept);

  const filteredStaff = selectedDept === 'All'
    ? staffList
    : staffList.filter(s => s.department === selectedDept);

  const departments = ['All', 'Product', 'Engineering', 'Marketing', 'Sales', 'HR'];

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/my-dashboard') return 'My Overview';
    if (path.startsWith('/individual')) return 'Staff Management';
    if (path === '/comparison') return 'Metric Comparison';
    if (path.startsWith('/global-ranking')) return 'Metric Deep Dive';
    return 'Ranking Board';
  };

  return (
    <div className="font-sans antialiased text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-[#0a0e17] transition-colors duration-500">
      <Sidebar
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="lg:pl-72 min-h-screen relative">
        {/* Background Orbs (Dark Mode Only) */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-700">
          <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[0%] left-[20%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]"></div>
        </div>

        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0a0e17]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-4 lg:px-8 py-4 flex justify-between items-center transition-colors duration-500">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500">
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {getHeaderTitle()}
              </h2>
              <div className="flex items-center gap-2">
                {isSyncing ? (
                  <span className="flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                    <RefreshCw size={10} className="animate-spin" /> Syncing DB...
                  </span>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Range: {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Department Filter (Desktop Only) */}
            {location.pathname !== '/my-dashboard' && (
              <div className="hidden md:flex items-center glass px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                <Filter size={14} className="text-slate-400 mr-2" />
                <select
                  className="bg-transparent text-sm text-slate-700 dark:text-white focus:outline-none cursor-pointer"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  {departments.map(dept => <option key={dept} value={dept} className="bg-white dark:bg-slate-900">{dept}</option>)}
                </select>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Date Picker */}
            <div className="hidden sm:block">
              <DateRangePicker range={dateRange} onChange={setDateRange} />
            </div>

            <div className="flex items-center space-x-2 pl-4 border-l border-slate-200 dark:border-white/10">
              <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-primary'} shadow-[0_0_8px_rgba(0,210,106,0.8)]`}></div>
              <span className="hidden sm:inline text-xs text-primary font-bold tracking-wider">LIVE</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-slate-200 dark:border-white/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 animate-pulse">Synchronizing HR Nodes...</p>
            </div>
          ) : (
            <Routes>
              {/* Leaderboard */}
              <Route path="/" element={<LeaderboardView metrics={filteredMetrics} />} />

              {/* Global Ranking */}
              <Route path="/global-ranking" element={<GlobalRankingView metrics={filteredMetrics} />} />
              <Route path="/global-ranking/:metric" element={<GlobalRankingView metrics={filteredMetrics} />} />

              {/* Individual View */}
              <Route path="/individual" element={
                currentUser?.role === 'admin'
                  ? <IndividualView staffList={filteredStaff} metrics={filteredMetrics} loading={loading} isDarkMode={isDarkMode} />
                  : <div className="text-red-400 p-8">Access Denied: Admins Only</div>
              } />
              <Route path="/individual/:staffId" element={
                currentUser?.role === 'admin'
                  ? <IndividualView staffList={filteredStaff} metrics={filteredMetrics} loading={loading} isDarkMode={isDarkMode} />
                  : <div className="text-red-400 p-8">Access Denied: Admins Only</div>
              } />

              {/* Comparison View */}
              <Route path="/comparison" element={
                currentUser?.role === 'admin'
                  ? <ComparisonView staffList={filteredStaff} metrics={filteredMetrics} isDarkMode={isDarkMode} />
                  : <div className="text-red-400 p-8">Access Denied: Admins Only</div>
              } />

              {/* My Dashboard */}
              <Route path="/my-dashboard" element={
                (() => {
                  const myMetrics = metrics.find(m => m.staffId === currentUser?.id);
                  if (!myMetrics) return <div>Data not found for current user.</div>;
                  return <MyDashboardView metrics={myMetrics} kudos={myKudos} />;
                })()
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;