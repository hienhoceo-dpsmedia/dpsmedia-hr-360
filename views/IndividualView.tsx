import React, { useState, useEffect } from 'react';
import { AggregatedMetrics, StaffInfo } from '../types';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { Download, Trophy, Star, Activity } from 'lucide-react';

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

  // Calculate Global Rank
  const sortedMetrics = [...metrics].sort((a, b) => b.total_rank_score - a.total_rank_score);
  const globalRank = sortedMetrics.findIndex(m => m.staffId === selectedStaffId) + 1;

  const handleExport = () => {
    alert("Exporting PDF Report for " + currentMetrics.staffName);
  };

  // Helper to get metric label
  const getLabel = (key: string) => {
    const map: Record<string, string> = {
      total_tasks_done: 'Tasks Completed',
      weekly_meeting_attendance: 'Meeting Attendance',
      weekly_meeting_count: 'Weekly Meetings',
      available_minutes: 'Available Minutes',
      team_chat: 'Team Chat',
      private_chat: 'Private Chat',
      reply_messages: 'Reply Messages',
      learning_points: 'Learning Points',
      creative_points: 'Creative Points',
      training_points: 'Training Points',
      hello_hub: 'Hello Hub',
      hall_of_fame: 'Hall of Fame',
      innovation_lab_ideas: 'Innovation Ideas'
    };
    return map[key] || key;
  };

  const getUnit = (key: string) => {
    if (key.includes('minutes')) return 'mins';
    if (key.includes('points')) return 'pts';
    if (key.includes('chat') || key.includes('messages')) return 'msgs';
    return '';
  }

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
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-slate-900 font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-slate-900 shadow-lg z-10">
              #{globalRank}
            </div>
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

        {/* Left Column: Total Score & Breakdown */}
        <div className="lg:col-span-8 space-y-6">

          {/* Total Score Card */}
          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Total Rank Score</h3>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {currentMetrics.total_rank_score.toFixed(4)}
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Global Rank</h3>
                <div className="text-4xl font-bold text-white flex items-center justify-end gap-2">
                  <Trophy size={32} className="text-yellow-500" />
                  #{globalRank}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics List */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-white">Performance Breakdown (13 Metrics)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-slate-500 bg-white/5">
                  <tr>
                    <th className="px-6 py-3">Metric</th>
                    <th className="px-6 py-3 text-right">Target / Value</th>
                    <th className="px-6 py-3 text-center">Rank</th>
                    <th className="px-6 py-3 text-right">Score Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMetrics.rank_score_breakdown ? (() => {
                    const mapping: Record<string, { label: string, valueKey: keyof AggregatedMetrics, unit: string }> = {
                      tasks: { label: 'Tasks Completed', valueKey: 'total_tasks_done', unit: 'tasks' },
                      meetings: { label: 'Meeting Attendance', valueKey: 'weekly_meeting_attendance', unit: 'mtgs' },
                      weeklyMeetings: { label: 'Weekly Meetings', valueKey: 'weekly_meeting_count', unit: 'cnt' },
                      minutes: { label: 'Available Minutes', valueKey: 'available_minutes', unit: 'mins' },
                      learning: { label: 'Learning Points', valueKey: 'learning_points', unit: 'pts' },
                      creative: { label: 'Creative Points', valueKey: 'creative_points', unit: 'pts' },
                      training: { label: 'Training Points', valueKey: 'training_points', unit: 'pts' },
                      helloHub: { label: 'Hello Hub', valueKey: 'hello_hub', unit: 'cnt' },
                      hallOfFame: { label: 'Hall of Fame', valueKey: 'hall_of_fame', unit: 'times' },
                      innovation: { label: 'Innovation Lab', valueKey: 'innovation_lab_ideas', unit: 'ideas' },
                      teamChat: { label: 'Team Chat', valueKey: 'team_chat', unit: 'msgs' },
                      privateChat: { label: 'Private Chat', valueKey: 'private_chat', unit: 'msgs' },
                      replies: { label: 'Reply Messages', valueKey: 'reply_messages', unit: 'msgs' },
                      mostFavorite: { label: 'Most Favorite', valueKey: 'mostFavorite', unit: 'votes' },
                      mostInfluential: { label: 'Most Influential', valueKey: 'mostInfluential', unit: 'votes' }
                    };

                    return (Object.entries(currentMetrics.rank_score_breakdown) as [keyof typeof mapping, number][])
                      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                      .map(([key, score]) => {
                        const config = mapping[key];
                        if (!config) return null;

                        // Calculate Rank on the fly
                        const metricValues = metrics.map(m => m[config.valueKey] as number).sort((a, b) => b - a);
                        const value = currentMetrics[config.valueKey] as number;
                        const rank = metricValues.indexOf(value) + 1; // Simplistic rank (first instance)

                        return (
                          <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-semibold text-white">
                              {config.label}
                            </td>
                            <td className="px-6 py-4 text-right text-slate-300">
                              {value.toLocaleString()} <span className="text-[10px] text-slate-500">{config.unit}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-block px-2 py-1 rounded font-bold text-xs ${rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                                rank <= 3 ? 'bg-slate-200/20 text-slate-200' : 'text-slate-500'}`}>
                                #{rank}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-emerald-400 font-bold">
                              +{score.toFixed(4)}
                            </td>
                          </tr>
                        );
                      });
                  })() : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No rank breakdown data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Heatmap & Insights */}
        <div className="lg:col-span-4 space-y-6">
          {/* 2D Activity Heatmap */}
          <div className="glass-panel p-6 rounded-2xl h-fit">
            <div className="flex items-center gap-2 mb-4 text-lg font-bold text-white">
              <Activity size={20} className="text-primary" />
              <span>Working Habits</span>
            </div>
            <ActivityHeatmap data={currentMetrics.activity_heatmap} />
            <p className="text-xs text-slate-400 mt-4 text-center italic">
              Based on available minutes distribution throughout the week.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-yellow-500 bg-yellow-500/5">
            <h4 className="flex items-center gap-2 font-bold text-yellow-500 mb-2">
              <Star size={16} /> Insight
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              To improve your Total Rank Score, focus on improving metrics where you rank lower (e.g. Rank #{Math.round(0.1 / (Object.values(currentMetrics.rank_score_breakdown || {}).sort((a, b) => a - b)[0] || 0.01))}).
              Moving from Rank 10 to Rank 5 doubles your score for that metric!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IndividualView;