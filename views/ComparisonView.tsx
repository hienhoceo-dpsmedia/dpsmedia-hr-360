import React, { useState } from 'react';
import { AggregatedMetrics, StaffInfo } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ComparisonViewProps {
  staffList: StaffInfo[];
  metrics: AggregatedMetrics[];
  isDarkMode: boolean;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ staffList, metrics, isDarkMode }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAverage, setShowAverage] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleStaff = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      if (selectedIds.length < 5) { // Limit to 5 for better chart visibility
        setSelectedIds([...selectedIds, id]);
      } else {
        alert("Select maximum 5 staff members for best comparison clarity.");
      }
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSelection = () => setSelectedIds([]);

  // Chart Theme Colors
  const chartTheme = {
    grid: isDarkMode ? '#334155' : '#e2e8f0',
    axisText: isDarkMode ? '#94a3b8' : '#64748b',
    tooltipBg: isDarkMode ? '#0f172a' : '#ffffff',
    tooltipBorder: isDarkMode ? '#334155' : '#e2e8f0',
    tooltipText: isDarkMode ? '#f8fafc' : '#0f172a',
  };

  const selectedMetrics = metrics.filter(m => selectedIds.includes(m.staffId));

  // Calculate Average
  const averageMetrics = {
    staffName: 'Team Avg',
    cat_a_score: metrics.length ? Math.round(metrics.reduce((acc, curr) => acc + curr.cat_a_score, 0) / metrics.length) : 0,
    cat_p_score: metrics.length ? Math.round(metrics.reduce((acc, curr) => acc + curr.cat_p_score, 0) / metrics.length) : 0,
    cat_q_score: metrics.length ? Math.round(metrics.reduce((acc, curr) => acc + curr.cat_q_score, 0) / metrics.length) : 0,
  };

  // Transform for Bar Chart
  const barData = selectedMetrics.map(m => ({
    name: m.staffName.split(' ').slice(-2).join(' '), // Show last two names
    'Availability': m.cat_a_score,
    'Performance': m.cat_p_score,
    'Quality': m.cat_q_score,
  }));

  if (showAverage) {
    barData.push({
      name: 'Team Avg',
      'Availability': averageMetrics.cat_a_score,
      'Performance': averageMetrics.cat_p_score,
      'Quality': averageMetrics.cat_q_score,
    });
  }

  // Transform for Line Chart (History)
  const months = ['Nov', 'Dec', 'Jan', 'Feb'];
  const lineData = months.map(month => {
    const point: any = { month };
    selectedMetrics.forEach((m, idx) => {
      const historyPoint = m.history.find(h => h.month === month);
      const avgScore = historyPoint ? Math.round((historyPoint.cat_a + historyPoint.cat_p + historyPoint.cat_q) / 3) : 0;
      point[m.staffName] = avgScore;
    });

    // Fake historical average for demo
    if (showAverage) {
      point['Team Avg'] = 75 + Math.random() * 5;
    }
    return point;
  });

  const colors = ["#00d26a", "#3b82f6", "#a855f7", "#ec4899", "#f59e0b"];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Staff Comparison</h2>
            <p className="text-slate-500 dark:text-slate-400">Analyze performance gaps and historical trends (Max 5).</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search staff..."
              className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Team Average Toggle */}
            <div className="flex items-center gap-3 glass px-3 py-1.5 rounded-lg">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Team Avg</span>
              <button
                onClick={() => setShowAverage(!showAverage)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${showAverage ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${showAverage ? 'translate-x-5' : ''}`}></div>
              </button>
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[150px] overflow-y-auto custom-scrollbar flex flex-wrap gap-2 p-1">
          {filteredStaff.map(staff => (
            <button
              key={staff.id}
              onClick={() => toggleStaff(staff.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedIds.includes(staff.id)
                  ? 'bg-primary text-black border-primary'
                  : 'bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 shadow-sm'
                }`}
            >
              {staff.name}
            </button>
          ))}
          {filteredStaff.length === 0 && (
            <div className="text-slate-500 text-sm py-2">No staff found matching "{searchQuery}"</div>
          )}
        </div>
      </div>

      {selectedIds.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Period Comparison (Bar) */}
          <div className="glass-panel p-6 rounded-2xl h-[400px]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Category Score Comparison</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barData} barGap={10}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" stroke={chartTheme.axisText} axisLine={false} tickLine={false} />
                <YAxis stroke={chartTheme.axisText} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: chartTheme.grid, opacity: 0.2 }}
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    color: chartTheme.tooltipText,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ color: chartTheme.axisText }} />
                <Bar dataKey="Availability" fill="#00d26a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Performance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Quality" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Trend (Line) */}
          <div className="glass-panel p-6 rounded-2xl h-[400px]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Growth Trend (Overall Score)</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" stroke={chartTheme.axisText} axisLine={false} tickLine={false} />
                <YAxis stroke={chartTheme.axisText} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    color: chartTheme.tooltipText,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ color: chartTheme.axisText }} />
                {selectedMetrics.map((m, index) => (
                  <Line
                    key={m.staffId}
                    type="monotone"
                    dataKey={m.staffName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={3}
                    dot={{ r: 4, fill: colors[index % colors.length] }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
                {showAverage && (
                  <Line
                    type="monotone"
                    dataKey="Team Avg"
                    stroke={chartTheme.axisText}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl opacity-50">
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">⚖️</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Select staff above to compare</p>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;