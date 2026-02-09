import React, { useState, useEffect, useCallback } from 'react';
import { Home, Calendar, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import { 
  getSobrietyStartDate, 
  setSobrietyStartDate, 
  getPrayerHistory, 
  savePrayerHistory, 
  getSettings, 
  saveSettings,
  getOrSelectDailyWisdom,
  getUnseenCount,
  addItemsToBuffer,
  consumeNextUnseen,
  seedInitialBuffer
} from './services/storageService';
import { fetchAndRefillBuffer } from './services/geminiService';
import { ViewState, PrayerName, Quote } from './types';
import { THEME, QUOTES, TRANSLATIONS } from './constants';

import { Dashboard } from './components/Dashboard';
import { PrayerTracker } from './components/PrayerTracker';
import { Settings } from './components/Settings';
import { SOSModal } from './components/SOSModal';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>('dashboard');
  const [sobrietyDate, setSobrietyDate] = useState(getSobrietyStartDate());
  const [prayerHistory, setPrayerHistory] = useState(getPrayerHistory());
  const [settings, setSettingsState] = useState(getSettings());
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<Quote>(QUOTES[0]);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [isRefilling, setIsRefilling] = useState(false);

  // Localization helper
  const t = TRANSLATIONS[settings.language];
  const fontClass = settings.language === 'BN' ? 'font-bengali' : 'font-sans';

  // --- Core Methods ---

  const refillLogic = useCallback(async (lang: 'EN' | 'BN') => {
    if (!navigator.onLine || isRefilling) return;

    const count = getUnseenCount(lang);
    // Threshold check as per specification: count < 30
    if (count < 30) {
      setIsRefilling(true);
      try {
        const refillCount = 50; // Fetch 50 new items as requested
        const newItems = await fetchAndRefillBuffer(refillCount, lang);
        if (newItems.length > 0) {
          addItemsToBuffer(newItems);
          console.log(`Successfully refilled ${lang} buffer with ${newItems.length} items.`);
        }
      } catch (e) {
        console.error("Refill trigger failed", e);
      } finally {
        setIsRefilling(false);
      }
    }
  }, [isRefilling]);

  // --- Effects ---
  
  // 1. App Initialization
  useEffect(() => {
    seedInitialBuffer();
    refillLogic(settings.language);
  }, []);

  // 2. Daily Wisdom Sync (Updates on language switch or day change)
  useEffect(() => {
    const wisdom = getOrSelectDailyWisdom(settings.language);
    if (wisdom) {
      setDailyQuote({ text: wisdom.text, source: wisdom.source });
    } else {
      // Emergency fallback if buffer empty
      setDailyQuote(settings.language === 'BN' ? { text: "নিশ্চয়ই আল্লাহ ক্ষমাশীল।", source: "কুরআন" } : QUOTES[0]);
    }
  }, [settings.language]);

  // 3. Hourly Motivation (Consumption Mechanism)
  useEffect(() => {
    if (!settings.hourlyMotivation) return;

    const triggerNotification = () => {
      const now = new Date();
      const hour = now.getHours();
      // Logic: pick from local buffer where is_shown = false
      if (hour >= 8 && hour <= 22) {
        const next = consumeNextUnseen(settings.language);
        if (next) {
          showNotification(next.text);
          // Auto-trigger refill check if we just consumed
          refillLogic(settings.language);
        }
      }
    };

    const interval = setInterval(triggerNotification, 1000 * 60 * 60); // Hourly
    return () => clearInterval(interval);
  }, [settings.hourlyMotivation, settings.language, refillLogic]);

  // --- Handlers ---

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => setNotificationMessage(null), 8000);
  };

  const handleResetSobriety = () => {
    const now = new Date();
    setSobrietyStartDate(now);
    setSobrietyDate(now);
  };

  const handleTogglePrayer = (prayer: PrayerName) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentRecord = prayerHistory[todayStr] || { 
      Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false 
    };

    const newRecord = { ...currentRecord, [prayer]: !currentRecord[prayer] };
    const newHistory = { ...prayerHistory, [todayStr]: newRecord };

    setPrayerHistory(newHistory);
    savePrayerHistory(newHistory);
  };

  const handleUpdateSettings = (newSettings: typeof settings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
    // When language changes, immediately check buffer for that language
    refillLogic(newSettings.language);
  };

  // --- Render ---

  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-gray-800 relative max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col ${fontClass}`}>
      
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div>
           <h1 className="text-xl font-bold text-[#0F5132]">Tawbah Companion</h1>
           <div className="flex items-center gap-2">
             <p className="text-xs text-gray-400">One day at a time, Insha'Allah</p>
             {isRefilling && <span className="text-[10px] text-blue-500 animate-pulse">({t.updatingContent})</span>}
           </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#0F5132] flex items-center justify-center text-white font-bold text-xs">
          TC
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
        {view === 'dashboard' && (
          <Dashboard 
            sobrietyStartDate={sobrietyDate}
            onResetSobriety={handleResetSobriety}
            prayerHistory={prayerHistory}
            onTogglePrayer={handleTogglePrayer}
            dailyQuote={dailyQuote}
            language={settings.language}
          />
        )}
        {view === 'tracker' && <PrayerTracker history={prayerHistory} />}
        {view === 'settings' && (
          <Settings 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {notificationMessage && (
        <div className="absolute top-20 left-4 right-4 bg-white border-l-4 border-[#FFC107] p-4 shadow-xl rounded-r-lg z-40 animate-in slide-in-from-top-2">
          <p className="text-sm font-medium text-gray-800 italic">"{notificationMessage}"</p>
        </div>
      )}

      <button
        onClick={() => setIsSOSOpen(true)}
        className="absolute bottom-24 right-4 bg-[#D32F2F] text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition z-30 animate-bounce"
      >
        <ShieldAlert size={24} />
      </button>

      <nav className="bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center absolute bottom-0 left-0 right-0 z-20">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-[#0F5132]' : 'text-gray-400'}`}>
          <Home size={24} strokeWidth={view === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t.home}</span>
        </button>
        <button onClick={() => setView('tracker')} className={`flex flex-col items-center gap-1 ${view === 'tracker' ? 'text-[#0F5132]' : 'text-gray-400'}`}>
          <Calendar size={24} strokeWidth={view === 'tracker' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t.history}</span>
        </button>
        <button onClick={() => setView('settings')} className={`flex flex-col items-center gap-1 ${view === 'settings' ? 'text-[#0F5132]' : 'text-gray-400'}`}>
          <SettingsIcon size={24} strokeWidth={view === 'settings' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t.settings}</span>
        </button>
      </nav>

      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} language={settings.language} />
    </div>
  );
};

export default App;