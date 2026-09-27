import React from 'react';
import { Clock } from 'lucide-react';

interface Time12PickerProps {
  label: string;
  hour: string; // "01" to "12"
  minute: string; // "00" to "59"
  period: 'AM' | 'PM';
  onChangeHour: (h: string) => void;
  onChangeMinute: (m: string) => void;
  onChangePeriod: (p: 'AM' | 'PM') => void;
  required?: boolean;
}

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

// All 60 minutes with 2-digit padding
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export const Time12Picker: React.FC<Time12PickerProps> = ({
  label,
  hour,
  minute,
  period,
  onChangeHour,
  onChangeMinute,
  onChangePeriod,
}) => {
  // Normalize hour and minute safely
  const parsedHour = parseInt(hour || '9', 10);
  const normalizedHour = String(isNaN(parsedHour) || parsedHour < 1 || parsedHour > 12 ? 9 : parsedHour).padStart(2, '0');
  
  const parsedMinute = parseInt(minute || '0', 10);
  const normalizedMinute = String(isNaN(parsedMinute) || parsedMinute < 0 || parsedMinute > 59 ? 0 : parsedMinute).padStart(2, '0');

  const displayHour = parseInt(normalizedHour, 10);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-2.5">
      {/* Header with Title and Live Formatted Pill */}
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-800 uppercase tracking-wider text-xs">
          {label}
        </label>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg tabular-nums flex items-center gap-1.5 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            {displayHour}:{normalizedMinute} {period}
          </span>
        </span>
      </div>

      {/* Inputs: Hour, Minute, and AM/PM Buttons */}
      <div className="flex items-end gap-2.5">
        {/* Hour Select */}
        <div className="flex-1 min-w-[75px]">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Hour
          </label>
          <div className="relative">
            <select
              value={normalizedHour}
              onChange={(e) => onChangeHour(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm outline-hidden cursor-pointer tabular-nums focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              title="Select Hour"
            >
              {HOURS.map((h) => (
                <option key={h} value={h} className="text-slate-900 font-medium py-1">
                  {parseInt(h, 10)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="font-bold text-slate-400 text-lg pb-2 select-none">:</span>

        {/* Minute Select */}
        <div className="flex-1 min-w-[75px]">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Minute
          </label>
          <div className="relative">
            <select
              value={normalizedMinute}
              onChange={(e) => onChangeMinute(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm outline-hidden cursor-pointer tabular-nums focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              title="Select Minute"
            >
              {MINUTES.map((m) => (
                <option key={m} value={m} className="text-slate-900 font-medium py-1">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AM / PM Segmented Toggle */}
        <div className="shrink-0">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">
            AM / PM
          </label>
          <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 h-[38px]">
            <button
              type="button"
              onClick={() => onChangePeriod('AM')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                period === 'AM'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => onChangePeriod('PM')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                period === 'PM'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              PM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
