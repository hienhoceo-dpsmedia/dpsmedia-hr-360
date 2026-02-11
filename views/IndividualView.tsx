import React, { useState, useEffect } from 'react';
import { AggregatedMetrics, StaffInfo } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import KPICard from '../components/KPICard';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { Download, HelpCircle, Clock } from 'lucide-react';

interface IndividualViewProps {
  staffList: StaffInfo[];
  metrics: AggregatedMetrics[];
  loading: boolean;
  isDarkMode: boolean;
  initialStaffId?: string;
}

const IndividualView: React.FC<IndividualViewProps> = ({ staffList, metrics, loading, isDarkMode, initialStaffId }) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(initialStaffId || '');

  useEffect(() => {
    if (initialStaffId) {
      setSelectedStaffId(initialStaffId);
    } else if (staffList.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffList[0].id);
    }
  }, [staffList, selectedStaffId, initialStaffId]);

  if (loading) return <div className="text-slate-900 dark:text-white">Loading data...</div>;

  const currentMetrics = metrics.find(m => m.staffId === selectedStaffId);
  if (!currentMetrics) return <div className="text-slate-400">Select a staff member to view details.</div>;

  // Chart Styling based on Theme
  const chartColors = {
    text: isDarkMode ? '#e2e8f0' : '#0f172a',
    grid: isDarkMode ? '#334155' : '#cbd5e1',
    radarStroke: isDarkMode ? '#00d26a' : '#059669',
    radarFill: isDarkMode ? '#00d26a' : '#10b981',
    tooltipBg: isDarkMode ? '#1e293b' : '#ffffff',
    tooltipBorder: isDarkMode ? '#334155' : '#e2e8f0',
  };

  const radarData = [
    { subject: 'Availability', A: currentMetrics.cat_a_score, fullMark: 5 },
    { subject: 'Performance', A: currentMetrics.cat_p_score, fullMark: 5 },
    { subject: 'Quality', A: currentMetrics.cat_q_score, fullMark: 5 },
  ];

  const handleExport = () => {
    alert("Exporting PDF Report for " + currentMetrics.staffName);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">

      {/* Header Profile Section */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar with Ring */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-full blur opacity-75"></div>
            <img
              src={currentMetrics.avatarUrl}
              alt={currentMetrics.staffName}
              className="relative w-20 h-20 rounded-full border-2 border-white dark:border-slate-900 shadow-xl"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentMetrics.staffName}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary border border-primary/20">
                {currentMetrics.department}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">ID: {currentMetrics.staffId}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Staff Selector */}
          <select
            className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 w-full sm:min-w-[200px]"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {staffList.map(staff => (
              <option key={staff.id} value={staff.id}>{staff.name}</option>
            ))}
          </select>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors w-full sm:w-auto"
          >
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Section (Left) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 self-start flex items-center gap-2">
            360° Assessment
            <span title="Score is normalized against company benchmarks (Avg = 3.0)" className="flex items-center cursor-help">
              <HelpCircle size={14} className="text-slate-500" />
            </span>
          </h3>
          <div className="w-full h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke={chartColors.grid} strokeOpacity={0.5} strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: chartColors.text, fontSize: 12, fontWeight: 600, opacity: 0.8 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                  name={currentMetrics.staffName}
                  dataKey="A"
                  stroke={chartColors.radarStroke}
                  strokeWidth={3}
                  fill={chartColors.radarFill}
                  fillOpacity={0.3}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} / 5.0`, 'Score']}
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    color: chartColors.text,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: chartColors.radarStroke }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Total Score Summary */}
          <div className="flex justify-between w-full px-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase">Overall Rating</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {((currentMetrics.cat_a_score + currentMetrics.cat_p_score + currentMetrics.cat_q_score) / 3).toFixed(1)}
                <span className="text-xs opacity-40 ml-1">/ 5.0</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase">Performance</p>
              <div className="flex items-center gap-1 justify-center">
                <p className="text-xl font-bold text-primary">Good</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics (Right) */}
        <div className="lg:col-span-8 grid grid-cols-1 gap-6">

          {/* Category A: Availability & Heatmap */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Availability & Activity Habits</h4>
            </div>

            {/* 2D Activity Heatmap */}
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
                <Clock size={14} />
                <span>Working Habits (Hour vs Weekday)</span>
              </div>
              <ActivityHeatmap data={currentMetrics.activity_heatmap} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KPICard
                title="Total Online"
                value={currentMetrics.available_minutes}
                isTime={true}
                subValue="mins"
                growth={currentMetrics.mom_growth_a}
                colorClass="text-green-500"
              />
              <KPICard title="Meeting Attendance" value={currentMetrics.weekly_meeting_attendance} />
              <KPICard title="Weekly Meeting" value={currentMetrics.weekly_meeting_count} />
              <KPICard title="Category Score" value={currentMetrics.cat_a_score.toFixed(1)} subValue="/ 5.0" />
            </div>
          </div>

          {/* Category P */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Performance</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard title="Tasks Completed" value={currentMetrics.total_tasks_done} growth={currentMetrics.mom_growth_p} />
              <KPICard title="Messages Sent" value={currentMetrics.total_messages} />
              <KPICard title="Category Score" value={currentMetrics.cat_p_score.toFixed(1)} subValue="/ 5.0" />
            </div>
          </div>

          {/* Category Q */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Quality & Innovation</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard title="Growth Points" value={currentMetrics.learning_points + currentMetrics.training_points} colorClass="text-purple-400" />
              <KPICard title="Innovation Ideas" value={currentMetrics.innovation_lab_ideas} colorClass="text-purple-400" />
              <KPICard title="Category Score" value={currentMetrics.cat_q_score.toFixed(1)} subValue="/ 5.0" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IndividualView;