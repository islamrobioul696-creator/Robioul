import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { PrayerHistory, PrayerName } from '../types';
import { THEME, PRAYER_NAMES } from '../constants';

interface PrayerTrackerProps {
  history: PrayerHistory;
}

export const PrayerTracker: React.FC<PrayerTrackerProps> = ({ history }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getDaysInMonth(year, month);
    const data = [];

    for (let i = 1; i <= days; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayRecord = history[dateStr];
      
      let status: 'none' | 'partial' | 'full' | 'empty' = 'empty';
      let completedCount = 0;

      if (dayRecord) {
        completedCount = Object.values(dayRecord).filter(Boolean).length;
        if (completedCount === 5) status = 'full';
        else if (completedCount > 0) status = 'partial';
        else status = 'none';
      }

      data.push({ day: i, status, dateStr, completedCount, record: dayRecord });
    }
    return data;
  }, [currentDate, history]);

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const [selectedDay, setSelectedDay] = useState<typeof monthData[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} color={THEME.primary} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight size={24} color={THEME.primary} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthData.map((d) => {
            let bgColor = 'bg-gray-100';
            let textColor = 'text-gray-400';

            if (d.status === 'full') {
              bgColor = 'bg-[#0F5132]';
              textColor = 'text-white';
            } else if (d.status === 'partial') {
              bgColor = 'bg-[#FFC107]';
              textColor = 'text-white';
            } else if (d.status === 'none' && new Date(d.dateStr) < new Date()) {
              bgColor = 'bg-[#D32F2F]';
              textColor = 'text-white';
            }

            return (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d)}
                className={`aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-transform active:scale-95 ${bgColor} ${textColor}`}
              >
                {d.day}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">
              Details: {selectedDay.dateStr}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600">
              <span className="text-sm">Close</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {PRAYER_NAMES.map((prayer) => {
               const isDone = selectedDay.record ? selectedDay.record[prayer] : false;
               return (
                 <div key={prayer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                   <span className="font-medium text-gray-700">{prayer}</span>
                   {isDone ? (
                     <span className="flex items-center text-[#0F5132] font-semibold text-sm">
                       <Check size={16} className="mr-1" /> Completed
                     </span>
                   ) : (
                     <span className="text-gray-400 text-sm">Missed / Not Recorded</span>
                   )}
                 </div>
               );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Past records cannot be altered to maintain strict accountability.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-[#0F5132] mb-1"></div>
          <span>Perfect (5/5)</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-[#FFC107] mb-1"></div>
          <span>Trying (1-4/5)</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-[#D32F2F] mb-1"></div>
          <span>Relapsed (0/5)</span>
        </div>
      </div>
    </div>
  );
};