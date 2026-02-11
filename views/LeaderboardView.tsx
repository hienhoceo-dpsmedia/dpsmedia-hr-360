import React from 'react';
import { AggregatedMetrics } from '../types';
import { Medal, ExternalLink } from 'lucide-react';

interface LeaderboardViewProps {
  metrics: AggregatedMetrics[];
  onCategoryClick: (metric: keyof AggregatedMetrics) => void;
  onStaffClick: (staffId: string) => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ metrics, onCategoryClick, onStaffClick }) => {

  const renderRankIcon = (index: number) => {
    if (index === 0) return <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)]"><Medal size={16} /></div>;
    if (index === 1) return <div className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-300 flex items-center justify-center border border-slate-300/50 shadow-[0_0_10px_rgba(203,213,225,0.3)]"><Medal size={16} /></div>;
    if (index === 2) return <div className="w-8 h-8 rounded-full bg-orange-700/20 text-orange-400 flex items-center justify-center border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]"><Medal size={16} /></div>;
    return <span className="text-slate-500 font-bold w-8 text-center">{index + 1}</span>;
  };

  const renderTable = (title: string, data: AggregatedMetrics[], scoreKey: keyof AggregatedMetrics, color: string, drillDownMetric: keyof AggregatedMetrics) => {
    // Sort descending
    const sorted = [...data].sort((a, b) => (b[scoreKey] as number) - (a[scoreKey] as number)).slice(0, 5);

    return (
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col hover:border-white/20 transition-all duration-300">
        <div
          className="p-5 border-b border-white/5 cursor-pointer group hover:bg-white/5 transition-colors"
          onClick={() => onCategoryClick(drillDownMetric)}
        >
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-bold uppercase tracking-wider ${color}`}>{title}</h3>
            <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <p className="text-xs text-slate-500 mt-1">Click to view global ranking</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-slate-500 bg-white/5">
              <tr>
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Staff</th>
                <th className="px-6 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, index) => (
                <tr
                  key={item.staffId}
                  className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => onStaffClick(item.staffId)}
                >
                  <td className="px-6 py-4">
                    {renderRankIcon(index)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={item.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-slate-800" />
                      <div>
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{item.staffName}</div>
                        <div className="text-xs text-slate-500">{item.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-bold text-right text-lg ${color}`}>
                    {item[scoreKey] as number}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Wall of Fame</h2>
        <p className="text-slate-400 mt-2">Recognizing excellence across Availability, Performance, and Quality.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {renderTable("Availability (Cat A)", metrics, "cat_a_score", "text-green-500", "available_minutes")}
        {renderTable("Performance (Cat P)", metrics, "cat_p_score", "text-blue-500", "total_tasks_done")}
        {renderTable("Quality (Cat Q)", metrics, "cat_q_score", "text-purple-500", "learning_points")}
      </div>
    </div>
  );
};

export default LeaderboardView;