import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  isTime?: boolean; // New prop to format minutes to HH:mm
  growth?: number; // MoM Growth
  icon?: React.ReactNode;
  colorClass?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subValue, isTime, growth, icon, colorClass = "text-primary" }) => {

  // Format Minutes to HHh MMm
  const displayValue = isTime && typeof value === 'number'
    ? `${Math.floor(value / 60)}h ${value % 60}m`
    : value;

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
      {/* Background glow effect */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:bg-primary/10 transition-all`}></div>

      <div className="flex justify-between items-start mb-3 relative z-10">
        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
        {icon && <div className={`p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 ${colorClass}`}>{icon}</div>}
      </div>

      <div className="flex items-baseline space-x-2 relative z-10">
        <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{displayValue}</span>
        {subValue && <span className="text-xs text-slate-500 font-medium">{subValue}</span>}
      </div>

      {growth !== undefined && (
        <div className="mt-3 flex items-center space-x-2 relative z-10">
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-md border ${growth > 0
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
              : growth < 0
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
            }`}>
            {growth > 0 ? <ArrowUpRight size={12} className="mr-1" /> : growth < 0 ? <ArrowDownRight size={12} className="mr-1" /> : <Minus size={12} className="mr-1" />}
            {Math.abs(growth)}%
          </div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Tăng trưởng tháng</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;