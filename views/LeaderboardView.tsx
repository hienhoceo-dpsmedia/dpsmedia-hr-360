import React from 'react';
import { AggregatedMetrics } from '../types';
import { Medal, ExternalLink, Info, Activity, Zap, Star } from 'lucide-react';

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
    const sorted = [...data].sort((a, b) => (b[scoreKey] as number) - (a[scoreKey] as number));

    return (
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col hover:border-white/20 transition-all duration-300 h-full">
        <div
          className="p-5 border-b border-white/5 cursor-pointer group hover:bg-white/5 transition-colors"
          onClick={() => onCategoryClick(drillDownMetric)}
        >
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-bold uppercase tracking-wider ${color}`}>{title}</h3>
            <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <p className="text-xs text-slate-500 mt-1">Bấm để xem bảng xếp hạng chi tiết</p>
        </div>
        <div className="overflow-x-auto flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-slate-500 bg-white/5">
              <tr>
                <th className="px-6 py-3">Hạng</th>
                <th className="px-6 py-3">Nhân sự</th>
                <th className="px-6 py-3 text-right">Điểm</th>
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
                  <td className={`px-6 py-4 font-bold text-right text-xl ${color}`}>
                    {item[scoreKey] as number}
                    <span className="text-[10px] opacity-40 ml-1">/ 5.0</span>
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
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Wall of Fame</h2>
          <p className="text-slate-400 mt-2">Vinh danh các cá nhân xuất sắc nhất dựa trên hệ thống điểm tương quan so với trung bình công ty.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {renderTable("Availability (Cat A)", metrics, "cat_a_score", "text-emerald-400", "available_minutes")}
        {renderTable("Performance (Cat P)", metrics, "cat_p_score", "text-sky-400", "total_tasks_done")}
        {renderTable("Quality (Cat Q)", metrics, "cat_q_score", "text-purple-400", "learning_points")}
      </div>

      {/* Scoring Formulas Section */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 mt-12 bg-primary/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <Info size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Mô hình tính điểm tương quan (Relative Scoring)</h3>
            <p className="text-sm text-slate-400">Điểm số của bạn được tính dựa trên mức độ hiệu quả so với trung bình chung của toàn công ty.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Legend */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Thang điểm 5</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Xuất sắc</span>
                <span className="text-primary font-bold">5.0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Trung bình công ty</span>
                <span className="text-white font-bold">3.0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Cần cải thiện</span>
                <span className="text-slate-500 font-bold">&lt; 2.0</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              "Nếu tất cả cùng nỗ lực tăng năng suất, mức trung bình (3.0) sẽ tăng lên, tạo động lực cạnh tranh lành mạnh."
            </p>
          </div>

          {/* Formula A */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Activity size={18} />
              <span className="uppercase tracking-wider">CATEGORY A</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Online (vs Avg)</span>
                <span className="font-bold text-white">70%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[70%]"></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Họp Weekly (T3)</span>
                <span className="font-bold text-white">30%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[30%]"></div>
              </div>
            </div>
          </div>

          {/* Formula P */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Zap size={18} />
              <span className="uppercase tracking-wider">CATEGORY P</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Năng suất (Tasks)</span>
                <span className="font-bold text-white">50%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-[50%]"></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Giao tiếp (Messages)</span>
                <span className="font-bold text-white">30%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-[30%]"></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Gắn kết (Meetings)</span>
                <span className="font-bold text-white">20%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-[20%]"></div>
              </div>
            </div>
          </div>

          {/* Formula Q */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Star size={18} />
              <span className="uppercase tracking-wider">CATEGORY Q</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Cầu tiến (Learning)</span>
                <span className="font-bold text-white">40%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[40%]"></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Sáng tạo (Innovation)</span>
                <span className="font-bold text-white">40%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[40%]"></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Văn hóa (Kudos/Posts)</span>
                <span className="font-bold text-white">20%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[20%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;