import React, { useState } from 'react';
import { AggregatedMetrics, StaffInfo } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Check, X, Users } from 'lucide-react';

interface ComparisonViewProps {
  staffList: StaffInfo[];
  metrics: AggregatedMetrics[];
  isDarkMode: boolean;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ staffList, metrics, isDarkMode }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleStaff = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      if (selectedIds.length < 3) { // Limit to 3 for clear radar chart
        setSelectedIds([...selectedIds, id]);
      } else {
        alert("Chọn tối đa 3 nhân sự để so sánh rõ ràng nhất.");
      }
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSelection = () => setSelectedIds([]);

  const selectedMetrics = metrics.filter(m => selectedIds.includes(m.staffId));

  // Defined 15 Metrics
  const metricKeys: { key: keyof AggregatedMetrics; label: string; max?: number }[] = [
    { key: 'total_tasks_done', label: 'Công việc' },
    { key: 'weekly_meeting_attendance', label: 'Họp định kỳ' },
    { key: 'weekly_meeting_count', label: 'Số buổi họp' },
    { key: 'available_minutes', label: 'Thời gian online' },
    { key: 'learning_points', label: 'Học tập' },
    { key: 'creative_points', label: 'Sáng tạo' },
    { key: 'training_points', label: 'Rèn luyện' },
    { key: 'hello_hub', label: 'Hello Hub' },
    { key: 'hall_of_fame', label: 'Vinh danh' },
    { key: 'innovation_lab_ideas', label: 'Cải tiến' },
    { key: 'team_chat', label: 'Chat nhóm' },
    { key: 'private_chat', label: 'Chat riêng' },
    { key: 'reply_messages', label: 'Phản hồi' },
    { key: 'mostFavorite', label: 'Yêu thích' },
    { key: 'mostInfluential', label: 'Ảnh hưởng' },
  ];

  // RADAR DATA PREPARATION
  // Normalize data (0-100) relative to the max value in the selection (or global max if available/preferred)
  // Here we normalize relative to the max value within the selected group to highlight relative differences.
  const radarData = metricKeys.map(m => {
    const point: any = { subject: m.label, fullMark: 100 };

    // Find max value in selection for this metric
    const maxVal = Math.max(...selectedMetrics.map(sm => (sm[m.key] as number) || 0), 1);

    selectedMetrics.forEach(staff => {
      const val = (staff[m.key] as number) || 0;
      point[staff.staffId] = (val / maxVal) * 100; // Normalize
    });
    return point;
  });

  const colors = ["#00d26a", "#3b82f6", "#f59e0b"]; // Brand colors

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header & Selection */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">So sánh nhân sự</h2>
            <p className="text-slate-500 dark:text-slate-400">Chọn tối đa 3 nhân sự để so sánh trên 15 chỉ số.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Tìm kiếm nhân sự..."
              className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {selectedIds.length > 0 && (
              <button onClick={clearSelection} className="text-xs font-bold text-red-500 hover:text-red-600 uppercase">Xóa chọn</button>
            )}
          </div>
        </div>

        <div className="max-h-[120px] overflow-y-auto custom-scrollbar flex flex-wrap gap-2">
          {filteredStaff.map(staff => (
            <button
              key={staff.id}
              onClick={() => toggleStaff(staff.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${selectedIds.includes(staff.id)
                ? 'bg-primary text-black border-primary'
                : 'bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10'
                }`}
            >
              <img src={staff.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}`} className="w-4 h-4 rounded-full" alt="" />
              {staff.name}
              {selectedIds.includes(staff.id) && <Check size={12} />}
            </button>
          ))}
        </div>
      </div>

      {selectedIds.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* RADAR CHART */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl h-[500px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center">Hình thái hiệu suất</h3>
            <p className="text-xs text-center text-slate-500 mb-6">So sánh chuẩn hóa (Sức mạnh tương đối)</p>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? "#94a3b8" : "#64748b", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  {selectedMetrics.map((staff, index) => (
                    <Radar
                      key={staff.staffId}
                      name={staff.staffName}
                      dataKey={staff.staffId}
                      stroke={colors[index]}
                      fill={colors[index]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '8px' }}
                    itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DETAILED TABLE */}
          <div className="lg:col-span-8 glass-panel p-0 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chi tiết chỉ số</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-white/5 uppercase text-xs font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4 text-left">Chỉ số</th>
                    {selectedMetrics.map((m, idx) => (
                      <th key={m.staffId} className="px-6 py-4 text-right" style={{ color: colors[idx] }}>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-400 font-normal">{m.department}</span>
                          {m.staffName.split(' ').slice(-2).join(' ')}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {/* Total Score Row */}
                  <tr className="bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-emerald-500">🏆 Tổng điểm xếp hạng</td>
                    {selectedMetrics.map(m => (
                      <td key={m.staffId} className="px-6 py-4 text-right font-bold text-lg text-emerald-500">
                        {m.total_rank_score.toFixed(4)}
                      </td>
                    ))}
                  </tr>

                  {metricKeys.map(metric => (
                    <tr key={metric.key} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {metric.label}
                      </td>
                      {selectedMetrics.map(m => {
                        const val = m[metric.key] as number;
                        // Check if winner in row
                        const rowValues = selectedMetrics.map(sm => sm[metric.key] as number);
                        const isMax = val === Math.max(...rowValues) && val > 0;

                        return (
                          <td key={m.staffId} className={`px-6 py-3 text-right font-mono ${isMax ? 'text-white font-bold bg-white/5 rounded-lg' : 'text-slate-400'}`}>
                            {val.toLocaleString()}
                            {isMax && <span className="ml-2 text-yellow-500">★</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl opacity-50">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Users size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">So sánh hiệu suất nhân sự</h3>
          <p className="text-slate-500 text-center max-w-md">Chọn nhân sự từ danh sách trên để so sánh hiệu suất trên tất cả 15 chỉ số quan trọng.</p>
        </div>
      )}
    </div>
  );
};



export default ComparisonView;