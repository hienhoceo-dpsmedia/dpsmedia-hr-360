import React, { useState, useEffect } from 'react';
import { AggregatedMetrics, StaffInfo } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { Download, Trophy, Star, Activity, AlertCircle } from 'lucide-react';

interface IndividualViewProps {
  staffList: StaffInfo[];
  metrics: AggregatedMetrics[];
  loading: boolean;
  isDarkMode: boolean;
}

const IndividualView: React.FC<IndividualViewProps> = ({ staffList, metrics, loading, isDarkMode }) => {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffId || '');

  useEffect(() => {
    if (staffId) {
      setSelectedStaffId(staffId);
    } else if (staffList.length > 0 && !selectedStaffId) {
      // If no staffId in URL, default to first staff and update URL
      const firstStaffId = staffList[0].id;
      setSelectedStaffId(firstStaffId);
      navigate(`/individual/${firstStaffId}`, { replace: true });
    }
  }, [staffId, staffList, navigate, selectedStaffId]);

  if (loading) return <div className="text-slate-900 dark:text-white font-medium">Đang tải dữ liệu...</div>;

  const currentMetrics = metrics.find(m => m.staffId === selectedStaffId);
  if (!currentMetrics) return <div className="text-slate-400">Vui lòng chọn một nhân sự để xem chi tiết.</div>;

  // Calculate Global Rank
  const sortedMetrics = [...metrics].sort((a, b) => b.total_rank_score - a.total_rank_score);
  const globalRank = sortedMetrics.findIndex(m => m.staffId === selectedStaffId) + 1;


  // Helper to get metric label
  const getLabel = (key: string) => {
    const map: Record<string, string> = {
      total_tasks_done: 'Công việc hoàn thành',
      weekly_meeting_attendance: 'Họp định kỳ',
      weekly_meeting_count: 'Số buổi họp',
      available_minutes: 'Thời gian online',
      team_chat: 'Chat nhóm công khai',
      private_chat: 'Chat riêng tư',
      reply_messages: 'Phản hồi tin nhắn',
      learning_points: 'Điểm học tập',
      creative_points: 'Điểm sáng tạo',
      training_points: 'Điểm rèn luyện',
      hello_hub: 'Điểm danh Hello Hub',
      hall_of_fame: 'Vinh danh (Fame)',
      innovation_lab_ideas: 'Ý tưởng cải tiến'
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
            onChange={(e) => navigate(`/individual/${e.target.value}`)}
          >
            {staffList.map(staff => (
              <option key={staff.id} value={staff.id}>{staff.name}</option>
            ))}
          </select>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Total Score Card */}
        <div className="lg:col-span-12">
          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Tổng điểm xếp hạng</h3>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {currentMetrics.total_rank_score.toFixed(4)}
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Hạng chung</h3>
                <div className="text-4xl font-bold text-white flex items-center justify-end gap-2">
                  <Trophy size={32} className="text-yellow-500" />
                  #{globalRank}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Working Habits full-width */}
        <div className="lg:col-span-12 space-y-6">
          <div className="glass-panel p-6 rounded-2xl h-fit">
            <div className="flex items-center gap-2 mb-4 text-lg font-bold text-white">
              <Activity size={20} className="text-primary" />
              <span>Thói quen làm việc</span>
            </div>
            <ActivityHeatmap data={currentMetrics.activity_heatmap} />
            <p className="text-xs text-slate-400 mt-4 text-center italic">
              Dựa trên phân bổ thời gian online trong tuần.
            </p>
          </div>
        </div>

        {/* Metrics List full-width */}
        <div className="lg:col-span-12">
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <h3 className="text-lg font-bold text-white">Chi tiết hiệu suất (15 chỉ số)</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
                <AlertCircle size={12} className="text-blue-400" />
                <span className="text-[10px] text-blue-300 font-medium">Lưu ý: Chỉ số Công việc hoàn thành & Thời gian Online cập nhật Real-time. Các chỉ số khác trễ 7 ngày.</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-slate-500 bg-white/5">
                  <tr>
                    <th className="px-6 py-3">Chỉ số</th>
                    <th className="px-6 py-3 text-right">Giá trị</th>
                    <th className="px-6 py-3 text-center">Hạng</th>
                    <th className="px-6 py-3 text-right">Điểm đóng góp</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const breakdown = currentMetrics.rank_score_breakdown;
                    if (!breakdown) return (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          Chưa có dữ liệu xếp hạng chi tiết.
                        </td>
                      </tr>
                    );

                    const mapping: Record<string, { label: string, valueKey: keyof AggregatedMetrics, unit: string }> = {
                      tasks: { label: 'Công việc hoàn thành', valueKey: 'total_tasks_done', unit: 'tasks' },
                      meetings: { label: 'Họp định kỳ', valueKey: 'weekly_meeting_attendance', unit: 'mtgs' },
                      weeklyMeetings: { label: 'Số buổi họp', valueKey: 'weekly_meeting_count', unit: 'cnt' },
                      minutes: { label: 'Thời gian online', valueKey: 'available_minutes', unit: 'mins' },
                      learning: { label: 'Điểm học tập', valueKey: 'learning_points', unit: 'pts' },
                      creative: { label: 'Điểm sáng tạo', valueKey: 'creative_points', unit: 'pts' },
                      training: { label: 'Điểm rèn luyện', valueKey: 'training_points', unit: 'pts' },
                      helloHub: { label: 'Điểm danh Hello Hub', valueKey: 'hello_hub', unit: 'cnt' },
                      hallOfFame: { label: 'Vinh danh (Fame)', valueKey: 'hall_of_fame', unit: 'times' },
                      innovation: { label: 'Ý tưởng cải tiến', valueKey: 'innovation_lab_ideas', unit: 'ideas' },
                      teamChat: { label: 'Chat nhóm công khai', valueKey: 'team_chat', unit: 'msgs' },
                      privateChat: { label: 'Chat riêng tư', valueKey: 'private_chat', unit: 'msgs' },
                      replies: { label: 'Phản hồi tin nhắn', valueKey: 'reply_messages', unit: 'msgs' },
                      mostFavorite: { label: 'Được yêu thích nhất', valueKey: 'mostFavorite', unit: 'votes' },
                      mostInfluential: { label: 'Có sức ảnh hưởng nhất', valueKey: 'mostInfluential', unit: 'votes' }
                    };

                    // Pre-calculate all metric ranks to avoid O(N^2) in render
                    const metricRanks: Record<string, number> = {};
                    Object.values(mapping).forEach(config => {
                      const values = metrics.map(m => m[config.valueKey] as number).sort((a, b) => b - a);
                      const myValue = currentMetrics[config.valueKey] as number;
                      metricRanks[config.valueKey] = values.indexOf(myValue) + 1;
                    });

                    return (Object.entries(breakdown) as [keyof typeof mapping, number][])
                      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                      .map(([key, score]) => {
                        const config = mapping[key];
                        if (!config) return null;

                        const value = currentMetrics[config.valueKey] as number;
                        const rank = metricRanks[config.valueKey];

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
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualView;