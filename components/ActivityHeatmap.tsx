import React from 'react';
import { ActivityHeatmapPoint } from '../types';

interface ActivityHeatmapProps {
  data: ActivityHeatmapPoint[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const maxValue = Math.max(...data.map(d => d.value), 1);

  const getOpacity = (value: number) => {
    if (value === 0) return 0.05; // Base visibility for empty cells
    return Math.max(0.2, Math.min(1, value / maxValue));
  };

  const getValue = (dayIdx: number, hour: number) => {
    return data.find(d => d.dayIndex === dayIdx && d.hour === hour)?.value || 0;
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[600px] select-none">
        
        {/* X-Axis: Hours */}
        <div className="flex mb-2 ml-12">
           {hours.map((h) => (
             <div key={h} className="flex-1 text-[9px] text-slate-400 text-center">
               {h % 3 === 0 ? `${h}h` : ''} 
             </div>
           ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-1">
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1">
              {/* Y-Axis: Days */}
              <div className="w-10 text-[10px] text-slate-500 font-medium text-right mr-2">{day}</div>
              
              {/* Cells */}
              <div className="flex-1 flex gap-1">
                 {hours.map((hour) => {
                   const value = getValue(dayIndex, hour);
                   return (
                     <div 
                        key={`${dayIndex}-${hour}`} 
                        className="flex-1 h-6 rounded-sm bg-primary transition-all duration-300 relative group"
                        style={{ opacity: getOpacity(value) }}
                     >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                          <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap border border-slate-700">
                             <span className="font-bold">{day}</span> @ {hour}:00 - {hour+1}:00 <br/>
                             <span className="text-primary">{value} activities</span>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 border-b border-r border-slate-700 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                        </div>
                     </div>
                   );
                 })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center gap-2 mt-3 text-[10px] text-slate-400">
           <span>Quiet</span>
           <div className="w-3 h-3 bg-primary opacity-20 rounded-sm"></div>
           <div className="w-3 h-3 bg-primary opacity-50 rounded-sm"></div>
           <div className="w-3 h-3 bg-primary opacity-100 rounded-sm"></div>
           <span>Busy</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;