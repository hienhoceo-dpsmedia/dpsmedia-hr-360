import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { StaffInfo, AggregatedMetrics, DateRange, Kudos } from './types';
import { fetchStaffList, fetchAggregatedMetrics, fetchCurrentUser, fetchKudos } from './services/dataService';
import IndividualView from './views/IndividualView';
import ComparisonView from './views/ComparisonView';
import LeaderboardView from './views/LeaderboardView';
import GlobalRankingView from './views/GlobalRankingView';
import MyDashboardView from './views/MyDashboardView';
import IndividualApiView from './views/IndividualApiView';
import GlobalRankingApiView from './views/GlobalRankingApiView';
import ApiDocsView from './views/ApiDocsView';
import DateRangePicker from './components/DateRangePicker';
import { Filter, Sun, Moon, Menu, RefreshCw, HelpCircle, Info, CheckCircle2 } from 'lucide-react';
import { parseISO, isValid, format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<StaffInfo | null>(null);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [metrics, setMetrics] = useState<AggregatedMetrics[]>([]);
  const [myKudos, setMyKudos] = useState<Kudos[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Date Logic: Default to "Last Week" unless specified in URL
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (startParam && endParam) {
      const start = parseISO(startParam);
      const end = parseISO(endParam);
      if (isValid(start) && isValid(end)) {
        return { startDate: start, endDate: end };
      }
    }

    const now = new Date();
    const lastWeek = subWeeks(now, 1);
    const start = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(lastWeek, { weekStartsOn: 1 });     // Sunday
    return { startDate: start, endDate: end };
  });

  // Sync URL -> State (when URL changes externally or on mount)
  useEffect(() => {
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (startParam && endParam) {
      const start = parseISO(startParam);
      const end = parseISO(endParam);
      if (isValid(start) && isValid(end)) {
        const startStr = format(dateRange.startDate, 'yyyy-MM-dd');
        const endStr = format(dateRange.endDate, 'yyyy-MM-dd');

        // Only update state if URL is actually different from current state
        if (startParam !== startStr || endParam !== endStr) {
          setDateRange({ startDate: start, endDate: end });
        }
      }
    }
  }, [searchParams]);

  // Sync State -> URL (when user picks a date in the UI)
  useEffect(() => {
    const startStr = format(dateRange.startDate, 'yyyy-MM-dd');
    const endStr = format(dateRange.endDate, 'yyyy-MM-dd');

    // Only update URL if different from current state to avoid infinite loops
    if (searchParams.get('start') !== startStr || searchParams.get('end') !== endStr) {
      setSearchParams(prev => {
        prev.set('start', startStr);
        prev.set('end', endStr);
        return prev;
      }, { replace: true });
    }
  }, [dateRange, setSearchParams, searchParams]);

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
        // Parallel fetching for performance
        const [user, staff, aggMetrics] = await Promise.all([
          fetchCurrentUser(),
          fetchStaffList(),
          fetchAggregatedMetrics(dateRange)
        ]);

        setCurrentUser(user);
        setStaffList(staff);
        setMetrics(aggMetrics);

        // Fetch kudos separately as it's less critical and depends on user email
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
    if (path === '/my-dashboard') return 'Tổng quan của tôi';
    if (path.startsWith('/individual')) return 'Quản lý nhân sự';
    if (path === '/comparison') return 'So sánh chỉ số';
    if (path.startsWith('/global-ranking')) return 'Chi tiết chỉ số';
    return 'Bảng xếp hạng';
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
                    <RefreshCw size={10} className="animate-spin" /> Đang đồng bộ...
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Khoảng: {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                    </p>
                    <div className="group relative">
                      <HelpCircle size={12} className="text-slate-400 cursor-help" />
                      <div className="absolute top-full left-0 mt-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg shadow-xl border border-white/10 hidden group-hover:block z-50">
                        <span className="text-[10px] text-blue-300 font-medium">Lưu ý: Chỉ số Công việc hoàn thành & Thời gian Online cập nhật Real-time. Các chỉ số khác trễ 7 ngày.</span>
                      </div>
                    </div>
                  </div>
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
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
            )}

            {/* About Dashboard */}
            <button
              onClick={() => setShowAbout(true)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
              title="Tìm hiểu về dashboard"
            >
              <HelpCircle size={20} />
            </button>

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
              <span className="hidden sm:inline text-xs text-primary font-bold tracking-wider">TRỰC TIẾP</span>
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
              <p className="text-slate-500 dark:text-slate-400 animate-pulse">Đang đồng bộ các nút HR...</p>
            </div>
          ) : (
            <Routes>
              {/* Leaderboard */}
              <Route path="/" element={<LeaderboardView metrics={filteredMetrics} />} />

              {/* Global Ranking */}
              <Route path="/global-ranking" element={<GlobalRankingView metrics={filteredMetrics} />} />
              <Route path="/global-ranking/:metric" element={<GlobalRankingView metrics={filteredMetrics} />} />
              <Route path="/api-docs" element={<ApiDocsView />} />

              {/* Individual View */}
              <Route path="/individual" element={
                currentUser?.role === 'admin'
                  ? <IndividualView staffList={filteredStaff} metrics={filteredMetrics} loading={loading} isDarkMode={isDarkMode} />
                  : <div className="text-red-400 p-8 font-bold">Truy cập bị từ chối: Chỉ dành cho Quản trị viên</div>
              } />
              <Route path="/individual/:staffId" element={
                currentUser?.role === 'admin'
                  ? <IndividualView staffList={filteredStaff} metrics={filteredMetrics} loading={loading} isDarkMode={isDarkMode} />
                  : <div className="text-red-400 p-8 font-bold">Truy cập bị từ chối: Chỉ dành cho Quản trị viên</div>
              } />

              {/* API Endpoints (JSON) */}
              <Route path="/api/individual/:staffId" element={<IndividualApiView metrics={metrics} />} />
              <Route path="/api/global-ranking/:metric" element={<GlobalRankingApiView metrics={metrics} />} />

              {/* Comparison View */}
              <Route path="/comparison" element={
                currentUser?.role === 'admin'
                  ? <ComparisonView staffList={filteredStaff} metrics={filteredMetrics} isDarkMode={isDarkMode} />
                  : <div className="text-red-400 p-8 font-bold">Truy cập bị từ chối: Chỉ dành cho Quản trị viên</div>
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

        {/* About Dashboard Modal */}
        {showAbout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAbout(false)}></div>
            <div className="relative w-full max-w-xl bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Info className="text-primary" size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold dark:text-white">Về HR 360 Dashboard</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Hệ thống đánh giá năng lực toàn diện</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <section>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Mục tiêu</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      HR 360 Dashboard được thiết kế để cung cấp cái nhìn 360 độ về hiệu quả làm việc, sự hiện diện và tương tác văn hóa của mỗi nhân sự tại dps.media.
                    </p>
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-2 text-primary">
                        <CheckCircle2 size={16} />
                        <span className="font-bold text-xs uppercase">Dữ liệu thực tế</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Tổng hợp từ Teams, Lark, Hệ thống đào tạo và các kênh giao tiếp nội bộ.</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-2 text-primary">
                        <CheckCircle2 size={16} />
                        <span className="font-bold text-xs uppercase">Minh bạch</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Mọi chỉ số đều có công thức rõ ràng, giúp lộ trình thăng tiến được công bằng và khách quan.</p>
                    </div>
                  </section>

                  <p className="text-xs text-slate-400 text-center italic border-t border-slate-100 dark:border-white/5 pt-6">
                    Mọi thắc mắc vui lòng liên hệ bộ phận HR để được hỗ trợ tốt nhất.
                  </p>
                </div>

                <button
                  onClick={() => setShowAbout(false)}
                  className="mt-8 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-xl"
                >
                  Đã hiểu!
                </button>
              </div>
            </div>
          </div>
        )}
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