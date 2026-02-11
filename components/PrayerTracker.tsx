import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock, XCircle } from 'lucide-react';
import { PrayerHistory, PrayerName, AppSettings } from '../types';
import { THEME, PRAYER_NAMES, TRANSLATIONS } from '../constants';

interface PrayerTrackerProps {
  history: PrayerHistory;
  settings: AppSettings;
}

export const PrayerTracker: React.FC<PrayerTrackerProps> = ({ history, settings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const t = TRANSLATIONS[settings.language];

  // Force update to ensure "today" is accurate when mounting
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getDaysInMonth(year, month);
    const data = [];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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

      data.push({ 
        day: i, 
        status, 
        dateStr, 
        completedCount, 
        record: dayRecord, 
        isToday: dateStr === todayStr, 
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr
      });
    }
    return data;
  }, [currentDate, history]);

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const [selectedDay, setSelectedDay] = useState<typeof monthData[0] | null>(null);

  // Helper to determine status for a single prayer item
  const getPrayerItemStatus = (prayer: PrayerName, dateStr: string, isChecked: boolean) => {
    if (isChecked) return 'completed';

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Future dates
    if (dateStr > todayStr) return 'upcoming';
    // Past dates
    if (dateStr < todayStr) return 'missed';

    // Today - check time
    const [hours, minutes] = settings.prayerTimes[prayer].split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);

    return now < prayerTime ? 'upcoming' : 'missed';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ChevronLeft size={24} color={THEME.primary} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition">
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
            let ringColor = '';

            if (d.status === 'full') {
              bgColor = 'bg-[#0F5132]';
              textColor = 'text-white';
            } else if (d.status === 'partial') {
              bgColor = 'bg-[#FFC107]';
              textColor = 'text-white';
            } else if (d.status === 'none' && d.isPast) {
              bgColor = 'bg-[#D32F2F]';
              textColor = 'text-white';
            }

            if (d.isToday) {
               ringColor = 'ring-2 ring-offset-2 ring-[#0F5132]';
               if (d.status === 'empty' || d.status === 'none') {
                 textColor = 'text-[#0F5132] font-bold';
               }
            }

            return (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d)}
                className={`aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all active:scale-95 ${bgColor} ${textColor} ${ringColor}`}
              >
                {d.day}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">
              {selectedDay.isToday ? t.todaysPrayers : `Details: ${selectedDay.dateStr}`}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 p-1">
              <span className="text-sm font-medium">Close</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {PRAYER_NAMES.map((prayer) => {
               const isDone = selectedDay.record ? selectedDay.record[prayer] : false;
               const status = getPrayerItemStatus(prayer, selectedDay.dateStr, isDone);
               
               return (
                 <div key={prayer} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="flex flex-col">
                     <span className="font-bold text-gray-700">{prayer}</span>
                     <span className="text-[10px] text-gray-400 font-medium">{settings.prayerTimes[prayer]}</span>
                   </div>

                   {status === 'completed' && (
                     <div className="flex items-center text-[#0F5132] bg-green-50 px-3 py-1 rounded-full border border-green-100">
                       <Check size={14} className="mr-1.5" />
                       <span className="font-bold text-xs">{t.completed}</span>
                     </div>
                   )}

                   {status === 'upcoming' && (
                     <div className="flex items-center text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                       <Clock size={14} className="mr-1.5" />
                       <span className="font-bold text-xs">{t.upcoming}</span>
                     </div>
                   )}

                   {status === 'missed' && (
                     <div className="flex items-center text-[#D32F2F] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                       <XCircle size={14} className="mr-1.5" />
                       <span className="font-bold text-xs">{t.missed}</span>
                     </div>
                   )}
                 </div>
               );
            })}
          </div>
          {!selectedDay.isFuture && (
            <p className="text-[10px] text-gray-400 mt-5 text-center px-4 leading-relaxed">
              Past records cannot be altered to maintain strict spiritual accountability.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 text-center text-[10px] font-medium text-gray-400">
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#0F5132] mb-1.5 shadow-sm"></div>
          <span>Perfect (5/5)</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#FFC107] mb-1.5 shadow-sm"></div>
          <span>Partial (1-4/5)</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#D32F2F] mb-1.5 shadow-sm"></div>
          <span>Relapsed (0/5)</span>
        </div>
      </div>
    </div>
  );
};