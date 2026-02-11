import React, { useState, useEffect, useRef } from 'react';
import { DateRange } from '../types';
import { Calendar, ChevronDown, Check } from 'lucide-react';

import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, startOfYear, endOfYear, subYears, format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DateRangePickerProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ range, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localRange, setLocalRange] = useState<DateRange>(range);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync localRange when opening
  useEffect(() => {
    if (isOpen) setLocalRange(range);
  }, [isOpen, range]);

  const formatDate = (d: Date) => format(d, 'yyyy-MM-dd');
  const displayDate = (d: Date) => format(d, 'd MMM, yyyy', { locale: vi });

  const presets = [
    { label: 'Hôm nay', getRange: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }) },
    { label: 'Hôm qua', getRange: () => ({ startDate: startOfDay(subDays(new Date(), 1)), endDate: endOfDay(subDays(new Date(), 1)) }) },
    { label: 'Tuần này', getRange: () => ({ startDate: startOfWeek(new Date(), { weekStartsOn: 0 }), endDate: endOfDay(new Date()) }) },
    { label: 'Tuần trước', getRange: () => ({ startDate: startOfWeek(subDays(new Date(), 7), { weekStartsOn: 0 }), endDate: endOfWeek(subDays(new Date(), 7), { weekStartsOn: 0 }) }) },
    { label: '7 ngày qua', getRange: () => ({ startDate: startOfDay(subDays(new Date(), 6)), endDate: endOfDay(new Date()) }) },
    { label: '28 ngày qua', getRange: () => ({ startDate: startOfDay(subDays(new Date(), 27)), endDate: endOfDay(new Date()) }) },
    { label: '30 ngày qua', getRange: () => ({ startDate: startOfDay(subDays(new Date(), 29)), endDate: endOfDay(new Date()) }) },
    { label: '90 ngày qua', getRange: () => ({ startDate: startOfDay(subDays(new Date(), 89)), endDate: endOfDay(new Date()) }) },
    { label: 'Tháng này', getRange: () => ({ startDate: startOfMonth(new Date()), endDate: endOfDay(new Date()) }) },
    { label: 'Tháng trước', getRange: () => ({ startDate: startOfMonth(subDays(startOfMonth(new Date()), 1)), endDate: endOfMonth(subDays(startOfMonth(new Date()), 1)) }) },
    { label: 'Quý này', getRange: () => ({ startDate: startOfQuarter(new Date()), endDate: endOfDay(new Date()) }) },
    { label: 'Năm nay', getRange: () => ({ startDate: startOfYear(new Date()), endDate: endOfDay(new Date()) }) },
    { label: 'Năm trước', getRange: () => ({ startDate: startOfYear(subYears(new Date(), 1)), endDate: endOfYear(subYears(new Date(), 1)) }) },
  ];

  const handleApply = () => {
    onChange(localRange);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all shadow-sm group"
      >
        <Calendar size={18} className="text-primary" />
        <span className="text-sm font-semibold dark:text-slate-200">
          {displayDate(range.startDate)} - {displayDate(range.endDate)}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-[560px] bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">

          <div className="flex h-[400px]">
            {/* Sidebar Presets */}
            <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Presets</p>
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setLocalRange(p.getRange())}
                  className="w-full text-left text-sm px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex justify-between items-center group"
                >
                  {p.label}
                  {formatDate(localRange.startDate) === formatDate(p.getRange().startDate) && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </div>

            {/* Right Panel: Custom Inputs & Calendar View (Simplified) */}
            <div className="flex-1 p-6 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/20">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Ngày bắt đầu</label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full bg-white dark:bg-slate-930 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
                        value={formatDate(localRange.startDate)}
                        onChange={(e) => setLocalRange({ ...localRange, startDate: new Date(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Ngày kết thúc</label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full bg-white dark:bg-slate-930 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
                        value={formatDate(localRange.endDate)}
                        onChange={(e) => setLocalRange({ ...localRange, endDate: new Date(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Selected Range</p>
                    <p className="text-sm font-bold dark:text-white mt-1">
                      {displayDate(localRange.startDate)} — {displayDate(localRange.endDate)}
                    </p>
                  </div>
                  <Calendar size={24} className="text-primary/20" />
                </div>
              </div>

              {/* Tips or help text */}
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                Dữ liệu sẽ được đồng bộ hoá ngay sau khi bạn nhấn nút Áp dụng.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all"
            >
              Huỷ
            </button>
            <button
              onClick={handleApply}
              className="bg-primary hover:bg-green-400 text-black px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_4px_10px_rgba(0,210,106,0.2)] active:scale-95"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;