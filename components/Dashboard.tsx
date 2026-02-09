import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import { PrayerHistory, PrayerName, Quote } from '../types';
import { THEME, PRAYER_NAMES, TRANSLATIONS } from '../constants';

interface DashboardProps {
  sobrietyStartDate: Date;
  onResetSobriety: () => void;
  prayerHistory: PrayerHistory;
  onTogglePrayer: (prayer: PrayerName) => void;
  dailyQuote: Quote;
  language: 'EN' | 'BN';
}

export const Dashboard: React.FC<DashboardProps> = ({
  sobrietyStartDate,
  onResetSobriety,
  prayerHistory,
  onTogglePrayer,
  dailyQuote,
  language
}) => {
  const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const t = TRANSLATIONS[language];
  const fontClass = language === 'BN' ? 'font-bengali' : 'font-sans';

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = now.getTime() - sobrietyStartDate.getTime();
      
      if (diff < 0) {
          setTimeElapsed({ days: 0, hours: 0, minutes: 0 });
          return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeElapsed({ days, hours, minutes });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [sobrietyStartDate]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = prayerHistory[todayStr] || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };

  return (
    <div className={`space-y-6 ${fontClass}`}>
      {/* Daily Wisdom */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4" style={{ borderColor: THEME.accent }}>
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">{t.dailyWisdom}</h3>
        <p className="text-lg font-medium text-gray-800 leading-relaxed mb-2 italic">"{dailyQuote.text}"</p>
        <p className="text-sm text-[#0F5132] font-semibold text-right">- {dailyQuote.source}</p>
      </div>

      {/* Sobriety Counter */}
      <div className="bg-[#0F5132] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 text-center">
          <h2 className="text-sm font-medium opacity-80 uppercase tracking-widest mb-4">{t.cleanTime}</h2>
          <div className="flex justify-center items-end gap-2 mb-6">
             <div className="flex flex-col items-center">
                <span className="text-5xl font-bold">{timeElapsed.days}</span>
                <span className="text-xs opacity-70 mt-1">{t.days}</span>
             </div>
             <span className="text-3xl font-light opacity-50 mb-4">:</span>
             <div className="flex flex-col items-center">
                <span className="text-5xl font-bold">{timeElapsed.hours}</span>
                <span className="text-xs opacity-70 mt-1">{t.hours}</span>
             </div>
             <span className="text-3xl font-light opacity-50 mb-4">:</span>
             <div className="flex flex-col items-center">
                <span className="text-5xl font-bold">{timeElapsed.minutes}</span>
                <span className="text-xs opacity-70 mt-1">{t.mins}</span>
             </div>
          </div>

          {!showResetConfirm ? (
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2 mx-auto transition"
            >
              <RefreshCw size={14} /> {t.resetStreak}
            </button>
          ) : (
            <div className="bg-white/10 p-4 rounded-xl animate-in zoom-in duration-200">
              <p className="text-sm mb-3">{t.resetConfirm}</p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => { onResetSobriety(); setShowResetConfirm(false); }}
                  className="px-4 py-2 bg-[#D32F2F] rounded-lg text-sm hover:bg-red-700"
                >
                  {t.reset}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Background Decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FFC107] opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Today's Prayers */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          {t.todaysPrayers}
          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{todayStr}</span>
        </h3>
        
        <div className="flex justify-between items-center">
          {PRAYER_NAMES.map((prayer) => {
            const isChecked = todayRecord[prayer];
            return (
              <button
                key={prayer}
                onClick={() => onTogglePrayer(prayer)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                  ${isChecked ? 'bg-[#0F5132] text-white shadow-md scale-105' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}
                `}>
                  {isChecked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                <span className={`text-xs font-medium ${isChecked ? 'text-[#0F5132]' : 'text-gray-400'}`}>
                  {prayer}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};