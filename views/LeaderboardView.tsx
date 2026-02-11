import React, { useState } from 'react';
import { AggregatedMetrics } from '../types';
import { Medal, Trophy, Info, Star, Copy, Check } from 'lucide-react';

interface LeaderboardViewProps {
  metrics: AggregatedMetrics[];
  onCategoryClick: (metric: keyof AggregatedMetrics) => void;
  onStaffClick: (staffId: string) => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ metrics, onStaffClick }) => {
  const [copied, setCopied] = useState(false);

  // Sort by Total Rank Score descending
  const sortedMetrics = [...metrics].sort((a, b) => b.total_rank_score - a.total_rank_score);
  const top3 = sortedMetrics.slice(0, 3);
  const rest = sortedMetrics.slice(3);

  const handleCopyData = () => {
    const headers = ['Rank', 'Name', 'Department', 'Total Rank Score'];
    const rows = sortedMetrics.map((item, index) => [
      index + 1,
      item.staffName,
      item.department,
      item.total_rank_score.toFixed(4)
    ]);

    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');

    navigator.clipboard.writeText(tsvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Trophy className="text-yellow-500" size={32} />
            HR Excellence Leaderboard
          </h2>
          <p className="text-slate-400 mt-2">Vinh danh những cá nhân xuất sắc nhất dựa trên tổng điểm xếp hạng 15 chỉ số toàn diện.</p>
        </div>

        <button
          onClick={handleCopyData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
        >
          {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
          <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy Data'}</span>
        </button>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
        {/* Rank 2 */}
        {top3[1] && (
          <div
            className="glass-panel p-6 rounded-2xl border-t-4 border-t-slate-300 flex flex-col items-center transform hover:-translate-y-2 transition-transform cursor-pointer"
            onClick={() => onStaffClick(top3[1].staffId)}
          >
            <div className="relative mb-4">
              <img src={top3[1].avatarUrl} alt="" className="w-20 h-20 rounded-full border-4 border-slate-300 shadow-lg" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-bold px-3 py-1 rounded-full text-xs shadow-md">
                #2
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mt-2">{top3[1].staffName}</h3>
            <p className="text-sm text-slate-400 mb-4">{top3[1].department}</p>
            <div className="text-3xl font-bold text-slate-300">{top3[1].total_rank_score.toFixed(4)}</div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Score</p>
          </div>
        )}

        {/* Rank 1 */}
        {top3[0] && (
          <div
            className="glass-panel p-8 rounded-2xl border-t-4 border-t-yellow-500 flex flex-col items-center transform hover:-translate-y-2 transition-transform cursor-pointer relative z-10 scale-110 shadow-xl bg-gradient-to-b from-yellow-500/10 to-transparent"
            onClick={() => onStaffClick(top3[0].staffId)}
          >
            <div className="absolute -top-6 text-yellow-500 animate-bounce">
              <Medal size={40} />
            </div>
            <div className="relative mb-4 mt-4">
              <img src={top3[0].avatarUrl} alt="" className="w-24 h-24 rounded-full border-4 border-yellow-500 shadow-yellow-500/20 shadow-xl" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 font-bold px-4 py-1 rounded-full text-sm shadow-md">
                #1 CHAMPION
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mt-2 text-center">{top3[0].staffName}</h3>
            <p className="text-sm text-yellow-200/70 mb-4">{top3[0].department}</p>
            <div className="text-4xl font-bold text-yellow-400">{top3[0].total_rank_score.toFixed(4)}</div>
            <p className="text-xs text-yellow-500/50 uppercase tracking-wider mt-1">Total Score</p>
          </div>
        )}

        {/* Rank 3 */}
        {top3[2] && (
          <div
            className="glass-panel p-6 rounded-2xl border-t-4 border-t-orange-500 flex flex-col items-center transform hover:-translate-y-2 transition-transform cursor-pointer"
            onClick={() => onStaffClick(top3[2].staffId)}
          >
            <div className="relative mb-4">
              <img src={top3[2].avatarUrl} alt="" className="w-20 h-20 rounded-full border-4 border-orange-500 shadow-lg" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-bold px-3 py-1 rounded-full text-xs shadow-md">
                #3
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mt-2">{top3[2].staffName}</h3>
            <p className="text-sm text-slate-400 mb-4">{top3[2].department}</p>
            <div className="text-3xl font-bold text-orange-500">{top3[2].total_rank_score.toFixed(4)}</div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Score</p>
          </div>
        )}
      </div>

      {/* Existing List for the Rest */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Full Rankings</h3>
        </div>
        <div className="bg-slate-900/30">
          {rest.map((item, index) => (
            <div
              key={item.staffId}
              className="flex items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => onStaffClick(item.staffId)}
            >
              <div className="w-12 text-center font-bold text-slate-500">#{index + 4}</div>
              <div className="flex-1 flex items-center gap-4">
                <img src={item.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-slate-800" />
                <div>
                  <div className="text-white font-semibold">{item.staffName}</div>
                  <div className="text-xs text-slate-500">{item.department}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-400">{item.total_rank_score.toFixed(4)}</div>
                <div className="text-[10px] text-slate-600 uppercase">Points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Formulas Section */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 mt-12 bg-primary/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <Info size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Cơ chế tính điểm xếp hạng (Rank-based Scoring)</h3>
            <p className="text-sm text-slate-400">Hệ thống đánh giá sự xuất sắc dựa trên thứ hạng của bạn trong từng chỉ số cụ thể.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logic Explanation */}
          <div className="space-y-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Star size={16} className="text-yellow-500" />
              Công thức cốt lõi
            </h4>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
              <code className="block text-emerald-400 font-mono text-sm bg-black/40 p-2 rounded">
                Điểm = (Giá trị của bạn / Giá trị Top 1) * Trọng số
              </code>
              <ul className="text-sm text-slate-400 list-disc ml-5 space-y-1">
                <li><span className="text-white font-bold">Tasks Done:</span> Trọng số <span className="text-yellow-400 font-bold">0.2</span></li>
                <li><span className="text-white font-bold">Chỉ số khác:</span> Trọng số <span className="text-emerald-400 font-bold">0.1</span></li>
              </ul>
            </div>
          </div>

          {/* Rationale */}
          <div className="space-y-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Info size={16} className="text-sky-500" />
              Tại sao lại tính như vậy?
            </h4>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
              <p className="text-sm text-slate-300">
                <strong className="text-white">Công bằng tuyệt đối:</strong> Điểm số phản ánh đúng hiệu suất thực tế. Nếu bạn làm bằng 90% người dẫn đầu, bạn sẽ nhận được 90% số điểm tối đa.
              </p>
              <p className="text-sm text-slate-300">
                <strong className="text-white">Toàn diện:</strong> Để đạt điểm tổng cao nhất, bạn không chỉ cần giỏi một thứ, mà cần có thứ hạng cao (Top 10) ở nhiều chỉ số khác nhau.
              </p>
              <p className="text-sm text-slate-300">
                <strong className="text-white">Ai cũng có điểm:</strong> Dù ở thứ hạng nào, bạn cũng tích lũy được điểm số đóng góp vào thành tích chung.
              </p>
            </div>
          </div>
        </div >
      </div >
    </div >
  );
};

export default LeaderboardView;