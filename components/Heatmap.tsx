import React from 'react';
import { DailyPresence } from '../types';

interface HeatmapProps {
  data: DailyPresence[];
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const getColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500/30';
      case 2: return 'bg-green-500/50';
      case 3: return 'bg-green-500/70';
      case 4: return 'bg-green-500';
      default: return 'bg-slate-800'; // Level 0
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {data.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center group relative"
          >
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
              <div className="bg-slate-900 text-xs text-white px-2 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap z-10">
                {day.date}: {Math.floor(day.minutes / 60)}h {day.minutes % 60}m
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 border-b border-r border-slate-700 -mt-1 z-0"></div>
            </div>

            {/* Cell */}
            <div
              className={`w-4 h-16 rounded-sm ${getColor(day.level)} hover:border hover:border-white/50 transition-colors cursor-pointer`}
            ></div>

            {/* Day Label (Optional, showing every 5th day for brevity) */}
            {new Date(day.date).getDate() % 5 === 1 && (
              <span className="text-[9px] text-slate-500 mt-1">{new Date(day.date).getDate()}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 justify-end">
        <span>Ít</span>
        <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-500/30 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-500/50 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-500/70 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
        <span>Nhiều</span>
      </div>
    </div>
  );
};

export default Heatmap;