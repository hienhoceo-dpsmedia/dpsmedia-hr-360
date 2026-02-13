import React, { useRef } from 'react';
import { AggregatedMetrics, Kudos } from '../types';
import KPICard from '../components/KPICard';
import Heatmap from '../components/Heatmap';
import KudosWall from '../components/KudosWall';
import { Target, TrendingUp, HelpCircle, FileText, Share2, AlertCircle, MessageCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

interface MyDashboardViewProps {
  metrics: AggregatedMetrics; // Single user metrics
  kudos: Kudos[];
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative inline-block ml-1">
    <HelpCircle size={14} className="text-slate-400 hover:text-primary cursor-help transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-xs text-white rounded-lg shadow-xl border border-white/10 hidden group-hover:block z-50 pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
    </div>
  </div>
);

const MyDashboardView: React.FC<MyDashboardViewProps> = ({ metrics, kudos }) => {
  const exportRef = useRef<HTMLDivElement>(null);

  const scoreColor = metrics.percentile_rank >= 80 ? 'text-green-500' : metrics.percentile_rank >= 50 ? 'text-blue-500' : 'text-orange-500';
  const percentileMsg = metrics.percentile_rank >= 90 ? "Top 10% - Xuất sắc!" : metrics.percentile_rank >= 50 ? "Trên trung bình - Cố gắng lên!" : "Đang phát triển - Bạn làm được mà!";

  const handleShare = async () => {
    if (exportRef.current) {
      try {
        const canvas = await html2canvas(exportRef.current, {
          backgroundColor: '#0a0e17', // Force dark background for the image
          scale: 2, // High resolution
        });
        const link = document.createElement('a');
        link.download = `dps-achievement-${metrics.staffName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (err) {
        console.error("Export failed", err);
        alert("Không thể tạo hình ảnh. Vui lòng thử lại.");
      }
    }
  };

  const handleRequestReview = () => {
    // In a real app, this would trigger a workflow/email
    alert(`Yêu cầu đã được gửi! Quản lý trực tiếp của bạn đã được thông báo để sắp xếp buổi review 1:1 về hiệu suất của bạn.`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* Welcome Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:block">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Chào {metrics.staffName.split(' ').pop()}! 👋</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl text-sm md:text-base">
            Chào mừng bạn đến với bảng điều khiển tăng trưởng cá nhân. Theo dõi tác động của bạn, ăn mừng các chiến thắng và xem những gì tiếp theo cho sự nghiệp của bạn tại dps.media.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(0,210,106,0.3)]">
              <TrendingUp size={16} /> Xem lộ trình phát triển
            </button>
            <button className="flex items-center gap-2 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-bold text-sm border border-slate-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
              <FileText size={16} /> Phiếu lương của tôi
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full animate-pulse-subtle">
              <AlertCircle size={14} className="text-blue-400" />
              <span className="text-[10px] text-blue-300 font-medium">Lưu ý: Chỉ số Công việc hoàn thành & Thời gian Online cập nhật Real-time. Các chỉ số khác trễ 7 ngày.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Key Stats & Growth */}
        <div className="lg:col-span-2 space-y-6">

          {/* Motivation Card (Exportable) */}
          <div ref={exportRef} className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between border-l-4 border-l-primary gap-4 relative">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Vị thế hiện tại</p>
                <button onClick={handleShare} title="Share Achievement" className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-primary transition-colors">
                  <Share2 size={14} />
                </button>
              </div>
              <h3 className={`text-2xl font-bold mt-1 ${scoreColor}`}>{percentileMsg}</h3>
              <p className="text-sm text-slate-500 mt-1">Bạn đã làm tốt hơn {metrics.percentile_rank}% nhân sự khác trong tháng này.</p>

              {/* Empower Button - Show if rank is low */}
              {metrics.percentile_rank < 50 && (
                <button
                  onClick={handleRequestReview}
                  className="mt-3 flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20"
                >
                  <AlertCircle size={12} /> Cần hỗ trợ? Yêu cầu Review 1:1
                </button>
              )}
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-slate-200 dark:text-white/10">{metrics.percentile_rank}<span className="text-2xl">%</span></div>
            </div>

            {/* Badge Decoration for Export */}
            <div className="absolute top-2 right-2 opacity-10 rotate-12 pointer-events-none">
              <Target size={80} />
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard
              title="Sự hiện diện"
              value={metrics.cat_a_score}
              subValue="/100"
              icon={<InfoTooltip text="Tính dựa trên thời gian online thực tế (Real-time) so với tiêu chuẩn giờ làm việc." />}
            />
            <KPICard
              title="Hiệu suất"
              value={metrics.cat_p_score}
              subValue="/100"
              icon={<InfoTooltip text="Điểm trọng số giữa Hoàn thành công việc (Real-time) và Khối lượng giao tiếp (Trễ 7 ngày)." />}
            />
            <KPICard
              title="Chất lượng"
              value={metrics.cat_q_score}
              subValue="/100"
              icon={<InfoTooltip text="Điểm từ các khóa học và các ý tưởng cải tiến (Trễ 7 ngày)." />}
            />
          </div>

          {/* Growth Path */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-primary" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lộ trình phát triển</h3>
            </div>

            <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-white/5">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Mục tiêu tiếp theo: {metrics.next_level_target.metric}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{metrics.next_level_target.message}</p>
                </div>
                <span className="text-primary font-bold">{metrics.next_level_target.current} / {metrics.next_level_target.target}</span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${Math.min(100, (metrics.next_level_target.current / metrics.next_level_target.target) * 100)}%` }}
                >
                  <div className="absolute right-0 -top-1 w-2 h-4 bg-white opacity-50 blur-[2px]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Hoạt động đóng góp</h3>
            <Heatmap data={metrics.daily_presence} />
          </div>

        </div>

        {/* Right Column: Social & Kudos */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl h-full">
            <KudosWall kudos={kudos} />
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 text-center">
              <button className="text-xs text-slate-500 hover:text-primary flex items-center justify-center gap-1 w-full py-2">
                <MessageCircle size={14} /> Xem tất cả tin nhắn
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyDashboardView;