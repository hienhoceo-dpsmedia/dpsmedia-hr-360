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
    externalUrl?: string; // NEW
  }[] = [
      // Category A
      {
        key: 'available_minutes',
        label: 'Available Minutes',
        unit: 'mins',
        category: 'A',
        description: 'Tổng thời gian bạn có mặt và sẵn sàng làm việc trong giờ hành chính, tính theo phút.',
        rationale: 'Thời gian online là dấu hiệu cơ bản cho thấy bạn có mặt và sẵn sàng làm việc. Khi làm việc từ xa hoặc làm việc linh hoạt, việc đo lường thời gian khả dụng giúp cấp quản lý hiểu rõ mức độ hiện diện của từng thành viên, phân bổ công việc hợp lý và hỗ trợ kịp thời nếu cần. Không đo để giám sát, mà để hỗ trợ và tối ưu hóa hiệu quả làm việc của cả nhóm.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/8f76d289-af5a-4f65-bea5-f540c90da203'
      },
      {
        key: 'weekly_meeting_count',
        label: 'Weekly Meeting',
        unit: 'cnt',
        category: 'A',
        description: 'Buổi họp vào 21h thứ Ba hàng tuần để cả team cùng cập nhật mục tiêu, chia sẻ khó khăn – chiến thắng, và cùng tiếp thêm năng lượng cho tuần mới. Dù làm việc từ xa hay tại văn phòng, đây là khoảnh khắc cả đội “về chung một nhịp”.',
        rationale: 'Tối thứ Ba là “nhịp tim” của dps.media — khoảnh khắc cả đội, dù ở khắp mọi nơi, cùng hòa chung một nhịp: cập nhật mục tiêu, chia sẻ chiến thắng, tháo gỡ vướng mắc và tiếp thêm năng lượng cho tuần mới. Làm việc 100% từ xa dễ khiến mỗi người thành “ốc đảo”, nhưng Weekly Meeting kéo chúng ta lại thành một “lục địa” vững vàng.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/1ec9923c-fcbd-488c-96c8-964d4fa045c7'
      },
      // Category P
      {
        key: 'total_tasks_done',
        label: 'Total Tasks Done',
        unit: 'tasks',
        category: 'P',
        description: 'Tổng số công việc đã hoàn thành trong tháng',
        rationale: 'Đo mức độ hiệu quả và kết quả công việc hàng tháng. Giúp đánh giá sự chủ động, năng suất và khả năng hoàn thành nhiệm vụ.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/5d0b4520-0bb3-4887-a654-4d49f55ffe57'
      },
      {
        key: 'team_chat',
        label: 'Team Chat (Public)',
        unit: 'msgs',
        category: 'P',
        description: 'Tổng số tin nhắn bạn gửi trong các kênh team (group chat công khai)',
        rationale: 'Phản ánh mức độ phối hợp, chia sẻ thông tin và tinh thần làm việc nhóm. Giao tiếp cởi mở giúp team gắn kết và minh bạch.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'private_chat',
        label: 'Team Chat (Private)',
        unit: 'msgs',
        category: 'P',
        description: 'Tổng số tin nhắn riêng bạn gửi cho đồng đội',
        rationale: 'Cho thấy sự chủ động kết nối và hỗ trợ lẫn nhau trong công việc. Giao tiếp 1:1 hiệu quả giúp giải quyết vấn đề nhanh chóng.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'reply_messages',
        label: 'Reply Messages',
        unit: 'msgs',
        category: 'P',
        description: 'Tổng số lần bạn phản hồi tin nhắn của người khác',
        rationale: 'Thể hiện sự quan tâm, tương tác and phản hồi trong teamwork. Trả lời nhanh - hỗ trợ tốt - xây dựng niềm tin.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'weekly_meeting_attendance',
        label: 'Meeting Count',
        unit: 'mtgs',
        category: 'P',
        description: 'Số lượng cuộc họp bạn tham gia trong tháng',
        rationale: 'Cho biết mức độ bạn tham gia vào quá trình ra quyết định, cập nhật tiến độ and đóng góp ý kiến trong công việc chung.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      // Category Q (including diem_hoc_tap)
      {
        key: 'learning_points',
        label: 'Learning Points',
        unit: 'pts',
        category: 'Q',
        description: 'Số bài học bạn đã hoàn thành trên hệ thống học chung Lifelong Learning',
        rationale: 'Ghi nhận tinh thần tự học, phát triển bản thân and tiếp thu kiến thức mới. Nhân sự chủ động học là nhân sự phát triển bền vững.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/51aedbf2-83d5-4a0d-83aa-6dce3e58f5d8'
      },
      {
        key: 'training_points',
        label: 'Training Points',
        unit: 'pts',
        category: 'Q',
        description: 'Số lần bạn tương tác (thảo luận, phản hồi...) trên hệ thống học chung',
        rationale: 'Đo mức độ chủ động chia sẻ and học hỏi từ cộng đồng. Học không chỉ là tiếp thu, mà còn là cùng nhau phát triển.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/51aedbf2-83d5-4a0d-83aa-6dce3e58f5d8'
      },
      {
        key: 'creative_points',
        label: 'Creative Points',
        unit: 'pts',
        category: 'Q',
        description: 'Số bài viết hoặc khóa học bạn đóng góp lên hệ thống học chung',
        rationale: 'Phản ánh tinh thần chia sẻ tri thức and sáng tạo nội dung hữu ích cho cộng đồng nội bộ. Càng chia sẻ – càng lan tỏa giá trị.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/51aedbf2-83d5-4a0d-83aa-6dce3e58f5d8'
      },
      {
        key: 'hello_hub',
        label: 'Hello Hub',
        unit: 'cnt',
        category: 'Q',
        description: 'Số lần bạn điểm danh hàng ngày trong tháng',
        rationale: 'Đo mức độ hiện diện và cam kết với công việc mỗi ngày. Điểm danh không chỉ để điểm danh – mà là sự bắt đầu cho một ngày làm việc hiệu quả.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'innovation_lab_ideas',
        label: 'Innovation Lab',
        unit: 'ideas',
        category: 'Q',
        description: 'Số ý tưởng bạn đóng góp để cải tiến công việc',
        rationale: 'Cho thấy tinh thần cải tiến không ngừng, tìm cách làm mới – làm tốt hơn mỗi ngày. Mỗi góp ý là một bước tiến cho cả team.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
      {
        key: 'hall_of_fame',
        label: 'Hall of Fame',
        unit: 'times',
        category: 'Q',
        description: 'Số lần bạn chia sẻ thành tựu cá nhân trong tháng',
        rationale: 'Ghi nhận sự tự hào, lan tỏa tinh thần tích cực và khích lệ người khác cùng cố gắng. Thành tựu nên được vinh danh – để cùng nhau chạm mốc cao hơn.',
        externalUrl: 'https://meta.dpsmedia.vn/public/question/420c4771-4916-4947-badf-6b81b202d3b6'
      },
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
          <p className="text-slate-400 text-sm mt-1">Deep dive into specific metrics across the entire organization.</p>
        </div>

        <div className="flex items-center glass px-4 py-2 rounded-lg border border-white/10">
          <Filter size={16} className="text-slate-400 mr-3" />
          <select
            className="bg-transparent text-white text-sm focus:outline-none min-w-[200px] cursor-pointer"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as keyof AggregatedMetrics)}
          >
            <optgroup label="Category A (Availability)" className="bg-slate-900 text-slate-400 font-semibold py-1">
              <option value="available_minutes" className="bg-slate-900 text-white">Available Minutes</option>
              <option value="weekly_meeting_count" className="bg-slate-900 text-white">Weekly Meeting</option>
            </optgroup>
            <optgroup label="Category P (Performance)" className="bg-slate-900 text-slate-400 font-semibold py-1">
              <option value="total_tasks_done" className="bg-slate-900 text-white">Total Tasks Done</option>
              <option value="team_chat" className="bg-slate-900 text-white">Team Chat (Public)</option>
              <option value="private_chat" className="bg-slate-900 text-white">Team Chat (Private)</option>
              <option value="reply_messages" className="bg-slate-900 text-white">Reply Messages</option>
              <option value="weekly_meeting_attendance" className="bg-slate-900 text-white">Meeting Count</option>
            </optgroup>
            <optgroup label="Tư duy & Kỹ năng (Category Q)" className="bg-slate-900 text-slate-400 font-semibold py-1">
              <option value="cat_q_score" className="bg-slate-900 text-purple-400 font-bold">★ Điểm Tổng CAT Q</option>
              <option value="learning_points" className="bg-slate-900 text-white">Learning Points</option>
              <option value="training_points" className="bg-slate-900 text-white">Training Points</option>
              <option value="creative_points" className="bg-slate-900 text-white">Creative Points</option>
              <option value="hello_hub" className="bg-slate-900 text-white">Hello Hub</option>
              <option value="innovation_lab_ideas" className="bg-slate-900 text-white">Innovation Lab</option>
              <option value="hall_of_fame" className="bg-slate-900 text-white">Hall of Fame</option>
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
              Giải thích dễ hiểu
            </h4>
            <p className="text-white text-sm leading-relaxed">{currentOption.description}</p>
          </div>
          <div className="flex-1">
            <h4 className="text-primary font-bold text-sm uppercase tracking-wider mb-2">Vì sao cần đo lường?</h4>
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
                  Đối chiếu dữ liệu
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
                {copied ? 'Đã sao chép!' : 'Copy dữ liệu bảng'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="space-y-4">
          {sortedData.map((item, index) => {
            const value = item[selectedMetric] as number;

            // Handle percentage for 1-5 scale vs raw metrics
            let percentage = 0;
            const isScore = selectedMetric.includes('score');
            if (isScore) {
              percentage = (value / 5) * 100;
            } else {
              percentage = (value / maxValue) * 100;
            }

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
                    className={`h-full bg-gradient-to-r ${isScore ? 'from-primary to-emerald-400' : 'from-blue-600 to-primary'} rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                  >
                  </div>
                  {/* Value inside bar or outside depending on width - simplifying to absolute right for aesthetics */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-md">
                    {isScore ? value.toFixed(1) : value.toLocaleString()}
                    <span className="text-[10px] font-normal opacity-80 ml-1">
                      {isScore ? '/ 5.0' : option?.unit}
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