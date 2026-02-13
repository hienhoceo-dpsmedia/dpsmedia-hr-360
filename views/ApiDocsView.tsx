import React from 'react';
import { Code, Terminal, Globe, Calendar, Info, CheckCircle2, Copy, ExternalLink } from 'lucide-react';

const ApiDocsView: React.FC = () => {
    const currentDomain = window.location.origin;

    const endpoints = [
        {
            title: 'Dữ liệu nhân sự chi tiết',
            method: 'GET',
            path: '/api/individual/:staffId',
            description: 'Trả về toàn bộ chỉ số và bảng điểm của một nhân sự cụ thể trong khoảng thời gian đã chọn.',
            params: [
                { name: 'staffId', type: 'Path', description: 'Email hoặc ID định danh của nhân sự (vd: hienho.ceo@dps.media)' },
                { name: 'start', type: 'Query', description: 'Ngày bắt đầu (YYYY-MM-DD)' },
                { name: 'end', type: 'Query', description: 'Ngày kết thúc (YYYY-MM-DD)' },
            ],
            example: `${currentDomain}/api/individual/hienho.ceo@dps.media?start=2026-02-02&end=2026-02-08`
        },
        {
            title: 'Bảng xếp hạng tổng thể',
            method: 'GET',
            path: '/api/global-ranking/:metric',
            description: 'Trả về danh sách tất cả nhân sự được sắp xếp theo một chỉ số cụ thể.',
            params: [
                { name: 'metric', type: 'Path', description: 'Tên chỉ số (vd: total_tasks_done, learning_points, available_minutes)' },
                { name: 'start', type: 'Query', description: 'Ngày bắt đầu (YYYY-MM-DD)' },
                { name: 'end', type: 'Query', description: 'Ngày kết thúc (YYYY-MM-DD)' },
            ],
            example: `${currentDomain}/api/global-ranking/total_tasks_done?start=2026-02-02&end=2026-02-08`
        }
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép link ví dụ!");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Terminal className="text-primary" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold dark:text-white">API Documentation</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Tích hợp dữ liệu HR 360 vào các hệ thống bên ngoài của bạn.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                    <Globe size={16} className="text-slate-400" />
                    <span className="text-xs font-mono text-slate-300 truncate max-w-[200px]">{currentDomain}</span>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 glass-panel rounded-3xl">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 mb-4">
                        <Info size={20} />
                    </div>
                    <h3 className="font-bold dark:text-white mb-2 text-sm uppercase tracking-wider">Định dạng dữ liệu</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Tất cả các endpoint đều trả về dữ liệu chuẩn JSON với headers <code className="text-blue-400">Content-Type: application/json</code>.
                    </p>
                </div>
                <div className="p-6 glass-panel rounded-3xl">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 mb-4">
                        <Calendar size={20} />
                    </div>
                    <h3 className="font-bold dark:text-white mb-2 text-sm uppercase tracking-wider">Lọc thời gian</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Sử dụng tham số <code className="text-emerald-400">?start=</code> và <code className="text-emerald-400">&end=</code> để lấy dữ liệu chính xác theo ý muốn.
                    </p>
                </div>
                <div className="p-6 glass-panel rounded-3xl">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 mb-4">
                        <Code size={20} />
                    </div>
                    <h3 className="font-bold dark:text-white mb-2 text-sm uppercase tracking-wider">Dynamic Domain</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        API được tích hợp trực tiếp, tự động thay đổi theo domain bạn đang sử dụng mà không cần cấu hình thêm.
                    </p>
                </div>
            </div>

            {/* Endpoint Details */}
            <div className="space-y-12">
                {endpoints.map((ep, i) => (
                    <div key={i} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-1 bg-primary rounded-full"></div>
                            <h2 className="text-xl font-bold dark:text-white">{ep.title}</h2>
                        </div>

                        <div className="glass-panel rounded-3xl overflow-hidden">
                            {/* Path Header */}
                            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
                                <span className="px-2 py-1 bg-emerald-500 text-slate-900 text-[10px] font-bold rounded">GET</span>
                                <code className="text-sm font-mono text-primary">{ep.path}</code>
                            </div>

                            <div className="p-6 space-y-6">
                                <p className="text-sm text-slate-600 dark:text-slate-300">{ep.description}</p>

                                {/* Parameters Table */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Tham số</h4>
                                    <div className="overflow-x-auto rounded-xl border border-white/5">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-white/5 text-slate-400">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">Tên</th>
                                                    <th className="px-4 py-2 font-medium">Vị trí</th>
                                                    <th className="px-4 py-2 font-medium">Mô tả</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-slate-300">
                                                {ep.params.map((p, j) => (
                                                    <tr key={j}>
                                                        <td className="px-4 py-3 font-mono text-blue-400 font-bold">{p.name}</td>
                                                        <td className="px-4 py-3 text-slate-500">{p.type}</td>
                                                        <td className="px-4 py-3">{p.description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Example Request */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Ví dụ truy vấn</h4>
                                        <button
                                            onClick={() => copyToClipboard(ep.example)}
                                            className="text-[10px] flex items-center gap-1 text-primary hover:underline hover:opacity-80 transition-all font-bold"
                                        >
                                            <Copy size={12} />
                                            SAO CHÉP
                                        </button>
                                    </div>
                                    <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-between group overflow-hidden">
                                        <code className="text-xs font-mono text-emerald-400 truncate pr-4">
                                            {ep.example}
                                        </code>
                                        <a
                                            href={ep.example}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-slate-500 hover:text-white transition-colors"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Info */}
            <div className="p-8 rounded-[40px] bg-gradient-to-br from-primary/10 via-blue-500/5 to-transparent border border-white/10 text-center">
                <CheckCircle2 className="mx-auto text-primary mb-4" size={32} />
                <h3 className="text-xl font-bold dark:text-white mb-2">Sẵn sàng tích hợp</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Tất cả dữ liệu được bảo mật và chỉ truy cập được khi bạn có quyền admin trong phiên làm việc hiện tại hoặc có cấu hình CORS phù hợp.
                </p>
            </div>
        </div>
    );
};

export default ApiDocsView;
