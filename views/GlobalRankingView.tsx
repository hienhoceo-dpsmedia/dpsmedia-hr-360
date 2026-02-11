import React from 'react';
import { AggregatedMetrics } from '../types';
import { BarChart2, Filter, Copy, Check } from 'lucide-react';

interface GlobalRankingViewProps {
  metrics: AggregatedMetrics[];
  initialMetric?: keyof AggregatedMetrics;
  onStaffClick: (staffId: string) => void;
}

const GlobalRankingView: React.FC<GlobalRankingViewProps> = ({ metrics, initialMetric = 'total_tasks_done', onStaffClick }) => {
  const [selectedMetric, setSelectedMetric] = React.useState<keyof AggregatedMetrics>(initialMetric);
  const [copied, setCopied] = React.useState(false);

  // Available metrics definition with detailed explanations
  const rankingOptions: {
    key: keyof AggregatedMetrics;
    label: string;
    unit: string;
    category: string;
    description: string;
    rationale: string;
    externalUrl?: string;
  }[] = [
      {
        key: 'total_rank_score',
        label: 'Total Rank Score',
        unit: 'pts',
        category: 'Overall',
        description: 'Tổng điểm xếp hạng dựa trên 15 chỉ số. Công thức: Score = Sum(0.1 / Rank).',
        rationale: 'Đánh giá tổng quan vị thế của nhân sự trên mọi mặt trận. Càng đứng đầu nhiều chỉ số, điểm càng cao.',
        externalUrl: ''
      },
      // Rank Metrics
      {
        key: 'total_tasks_done',
        label: 'Total Tasks Done',
        unit: 'tasks',
        category: 'Metric',
        description: 'Tổng số công việc đã hoàn thành trong tháng',
        rationale: 'Đo mức độ hiệu quả và kết quả công việc hàng tháng.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/5d0b4520-0bb3-4887-a654-4d49f55ffe57'
      },
      {
        key: 'weekly_meeting_attendance',
        label: 'Weekly Meeting Attendance',
        unit: 'mtgs',
        category: 'Metric',
        description: 'Số lượng cuộc họp bạn tham gia trong tháng (từ Teams)',
        rationale: 'Cho biết mức độ bạn tham gia vào quá trình ra quyết định và thảo luận.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'weekly_meeting_count',
        label: 'Weekly Meeting Count',
        unit: 'cnt',
        category: 'Metric',
        description: 'Số lần tham gia họp Weekly tối thứ 3',
        rationale: 'Sự cam kết với hoạt động chung quan trọng nhất của công ty.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/1ec9923c-fcbd-488c-96c8-964d4fa045c7'
      },
      {
        key: 'available_minutes',
        label: 'Available Minutes',
        unit: 'mins',
        category: 'Metric',
        description: 'Tổng thời gian online trong giờ hành chín',
        rationale: 'Đo lường sự hiện diện và sẵn sàng của nhân sự.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/8f76d289-af5a-4f65-bea5-f540c90da203'
      },
      {
        key: 'learning_points',
        label: 'Learning Points',
        unit: 'pts',
        category: 'Metric',
        description: 'Điểm học tập trên hệ thống Lifelong Learning',
        rationale: 'Tinh thần tự học và phát triển bản thân.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/51aedbf2-83d5-4a0d-83aa-6dce3e58f5d8'
      },
      {
        key: 'creative_points',
        label: 'Creative Points',
        unit: 'pts',
        category: 'Metric',
        description: 'Điểm sáng tạo (bài viết, chia sẻ) trên hệ thống',
        rationale: 'Khả năng đóng góp tri thức cho tổ chức.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/51aedbf2-83d5-4a0d-83aa-6dce3e58f5d8'
      },
      {
        key: 'training_points',
        label: 'Training Points',
        unit: 'pts',
        category: 'Metric',
        description: 'Điểm rèn luyện (tương tác) trên hệ thống',
        rationale: 'Sự tích cực tham gia vào cộng đồng học tập.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/51aedbf2-83d5-4a0d-83aa-6dce3e58f5d8'
      },
      {
        key: 'hello_hub',
        label: 'Hello Hub',
        unit: 'cnt',
        category: 'Metric',
        description: 'Số lần điểm danh Hello Hub',
        rationale: 'Kỷ luật và thói quen tích cực đầu ngày.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'hall_of_fame',
        label: 'Hall of Fame',
        unit: 'times',
        category: 'Metric',
        description: 'Số lần được vinh danh hoặc chia sẻ thành tựu',
        rationale: 'Lan tỏa niềm tự hào và động lực.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'innovation_lab_ideas',
        label: 'Innovation Lab',
        unit: 'ideas',
        category: 'Metric',
        description: 'Số ý tưởng đóng góp cho Innovation Lab',
        rationale: 'Tư duy đổi mới và cải tiến quy trình.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'team_chat',
        label: 'Team Chat',
        unit: 'msgs',
        category: 'Metric',
        description: 'Tin nhắn trong nhóm chat công khai',
        rationale: 'Sự sôi nổi và minh bạch trong giao tiếp.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'private_chat',
        label: 'Private Chat',
        unit: 'msgs',
        category: 'Metric',
        description: 'Tin nhắn riêng tư với đồng nghiệp',
        rationale: 'Sự kết nối cá nhân và hỗ trợ trực tiếp.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'reply_messages',
        label: 'Reply Messages',
        unit: 'msgs',
        category: 'Metric',
        description: 'Số lần trả lời tin nhắn',
        rationale: 'Sự phản hồi và quan tâm đến người khác.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'mostFavorite',
        label: 'Most Favorite Staff',
        unit: 'votes',
        category: 'Assessment',
        description: 'Hạng mục nhân sự được yêu thích nhất (Bình chọn cuối năm)',
        rationale: 'Sự tín nhiệm và yêu mến từ đồng nghiệp.',
        externalUrl: ''
      },
      {
        key: 'mostInfluential',
        label: 'Most Influential Staff',
        unit: 'votes',
        category: 'Assessment',
        description: 'Hạng mục nhân sự có sức ảnh hưởng nhất (Bình chọn cuối năm)',
        rationale: 'Tầm ảnh hưởng và khả năng dẫn dắt, truyền cảm hứng.',
        externalUrl: ''
      }
    ];

  const currentOption = rankingOptions.find(o => o.key === selectedMetric) || rankingOptions[0];

  // Sort data descending
  const sortedData = [...metrics].sort((a, b) => {
    const valA = a[selectedMetric] as number;
    const valB = b[selectedMetric] as number;
    return valB - valA;
  });

  const handleCopyData = () => {
    const header = `Rank\tName\tDepartment\t${currentOption.label}\tUnit`;
    const rows = sortedData.map((item, index) =>
      `${index + 1}\t${item.staffName}\t${item.department}\t${item[selectedMetric]}\t${currentOption.unit}`
    );
    const content = [header, ...rows].join('\n');

    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const maxValue = Math.max(...sortedData.map(m => m[selectedMetric] as number)) || 1;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="text-primary" />
            Global Ranking
          </h2>
          <p className="text-slate-400 text-sm mt-1">Comparision based on 13 Rank Metrics</p>
        </div>

        <div className="flex items-center glass px-4 py-2 rounded-lg border border-white/10">
          <Filter size={16} className="text-slate-400 mr-3" />
          <select
            className="bg-transparent text-white text-sm focus:outline-none min-w-[200px] cursor-pointer"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as keyof AggregatedMetrics)}
          >
            <option value="total_rank_score" className="bg-slate-900 text-emerald-400 font-bold">★ Total Rank Score</option>
            <optgroup label="Productivity Metrics">
              <option value="total_tasks_done" className="bg-slate-900 text-white">Tasks Done</option>
              <option value="available_minutes" className="bg-slate-900 text-white">Available Minutes</option>
              <option value="weekly_meeting_attendance" className="bg-slate-900 text-white">Meeting Attendance</option>
              <option value="weekly_meeting_count" className="bg-slate-900 text-white">Weekly Meetings</option>
            </optgroup>
            <optgroup label="Communication Metrics">
              <option value="team_chat" className="bg-slate-900 text-white">Team Chat</option>
              <option value="private_chat" className="bg-slate-900 text-white">Private Chat</option>
              <option value="reply_messages" className="bg-slate-900 text-white">Replies</option>
            </optgroup>
            <optgroup label="Growth & Culture">
              <option value="learning_points" className="bg-slate-900 text-white">Learning Points</option>
              <option value="creative_points" className="bg-slate-900 text-white">Creative Points</option>
              <option value="training_points" className="bg-slate-900 text-white">Training Points</option>
              <option value="hello_hub" className="bg-slate-900 text-white">Hello Hub</option>
              <option value="hall_of_fame" className="bg-slate-900 text-white">Hall of Fame</option>
              <option value="innovation_lab_ideas" className="bg-slate-900 text-white">Innovation Lab</option>
            </optgroup>
            <optgroup label="Year-End Assessment">
              <option value="mostFavorite" className="bg-slate-900 text-white">Most Favorite</option>
              <option value="mostInfluential" className="bg-slate-900 text-white">Most Influential</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Metric Explanation Panel */}
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary bg-primary/5 animate-slide-up relative overflow-hidden group">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h4 className="text-primary font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                {currentOption.category}
              </span>
              Giải thích
            </h4>
            <p className="text-white text-sm leading-relaxed">{currentOption.description}</p>
          </div>
          <div className="flex-1">
            <h4 className="text-primary font-bold text-sm uppercase tracking-wider mb-2">Ý nghĩa</h4>
            <p className="text-slate-400 text-sm leading-relaxed italic">"{currentOption.rationale}"</p>
          </div>

          <div className="flex flex-col gap-2 justify-center px-4 border-l border-white/10">
            {currentOption.externalUrl && (
              <a
                href={currentOption.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all group min-w-[160px]"
              >
                <BarChart2 className="text-primary group-hover:scale-110 transition-transform" size={18} />
                <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-white transition-colors">
                  Đối chiếu
                </span>
              </a>
            )}

            <button
              onClick={handleCopyData}
              className="flex items-center gap-3 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 border-emerald-500/50 transition-all group min-w-[160px]"
            >
              {copied ? (
                <Check className="text-emerald-500 group-hover:scale-110 transition-transform" size={18} />
              ) : (
                <Copy className="text-primary group-hover:scale-110 transition-transform" size={18} />
              )}
              <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-white transition-colors">
                {copied ? 'Đã sao chép!' : 'Copy dữ liệu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="space-y-4">
          {sortedData.map((item, index) => {
            const value = item[selectedMetric] as number;

            // Handle percentage for Scale vs raw metrics
            // For Total Rank Score, we use the scaling relative to max value
            const percentage = (value / maxValue) * 100;
            const isScore = selectedMetric === 'total_rank_score';

            const option = rankingOptions.find(o => o.key === selectedMetric);

            return (
              <div
                key={item.staffId}
                className="group flex items-center gap-4 py-2 border-b border-white/5 last:border-0 hover:bg-white/10 px-2 rounded-lg transition-colors cursor-pointer"
                onClick={() => onStaffClick(item.staffId)}
              >
                {/* Rank */}
                <div className={`w-8 font-bold text-center ${index < 3 ? 'text-primary' : 'text-slate-500'}`}>
                  #{index + 1}
                </div>

                {/* Avatar & Name */}
                <div className="w-48 flex items-center gap-3">
                  <img src={item.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                  <div className="truncate">
                    <div className="text-sm font-semibold text-white truncate">{item.staffName}</div>
                    <div className="text-xs text-slate-500">{item.department}</div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="flex-1 h-8 bg-slate-800/50 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full bg-gradient-to-r ${isScore ? 'from-emerald-500 to-primary' : 'from-blue-600 to-primary'} rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                    style={{ width: `${percentage || 1}%` }} // Minimal width for visibility
                  >
                  </div>
                  {/* Value */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-md">
                    {isScore ? value.toFixed(4) : value.toLocaleString()}
                    <span className="text-[10px] font-normal opacity-80 ml-1">
                      {option?.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GlobalRankingView;