import React, { useState, useEffect, useCallback } from 'react';
import { Home, Calendar, Settings as SettingsIcon, ShieldAlert, Wifi, WifiOff, Lock, MessageCircle, HelpCircle, ArrowLeft, Key } from 'lucide-react';
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
  seedInitialBuffer,
  addRelapseRecord
} from './services/storageService';
import { fetchAndRefillBuffer } from './services/geminiService';
import { ViewState, PrayerName, Quote } from './types';
import { THEME, QUOTES, TRANSLATIONS } from './constants';

import { Dashboard } from './components/Dashboard';
import { PrayerTracker } from './components/PrayerTracker';
import { Settings } from './components/Settings';
import { SOSModal } from './components/SOSModal';
import { ChatView } from './components/ChatView';

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Privacy Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  
  // Recovery Flow State
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryAnswerInput, setRecoveryAnswerInput] = useState('');
  const [recoveryNewPin, setRecoveryNewPin] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Localization helper
  const t = TRANSLATIONS[settings.language];
  const fontClass = settings.language === 'BN' ? 'font-bengali' : 'font-sans';

  // --- Core Methods ---

  const refillLogic = useCallback(async (lang: 'EN' | 'BN') => {
    if (!navigator.onLine || isRefilling) return;

    const count = getUnseenCount(lang);
    if (count < 30) {
      setIsRefilling(true);
      try {
        const refillCount = 50; 
        const newItems = await fetchAndRefillBuffer(refillCount, lang);
        if (newItems.length > 0) {
          addItemsToBuffer(newItems);
        }
      } catch (e) {
        console.error("Refill trigger failed", e);
      } finally {
        setIsRefilling(false);
      }
    }
  }, [isRefilling]);

  // --- Effects ---
  
  useEffect(() => {
    if (settings.isPrivacyLockEnabled && settings.privacyPin) {
      setIsLocked(true);
    }

    seedInitialBuffer();
    refillLogic(settings.language);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && settings.isPrivacyLockEnabled && settings.privacyPin) {
        setIsLocked(true);
        setUnlockPin('');
        setUnlockError(false);
        setShowRecovery(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.isPrivacyLockEnabled, settings.privacyPin, refillLogic, settings.language]);

  useEffect(() => {
    const wisdom = getOrSelectDailyWisdom(settings.language);
    if (wisdom) {
      setDailyQuote({ text: wisdom.text, source: wisdom.source });
    } else {
      setDailyQuote(settings.language === 'BN' ? { text: "নিশ্চয়ই আল্লাহ ক্ষমাশীল।", source: "কুরআন" } : QUOTES[0]);
    }
  }, [settings.language]);

  useEffect(() => {
    if (!settings.hourlyMotivation) return;

    const triggerNotification = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 8 && hour <= 22) {
        const next = consumeNextUnseen(settings.language);
        if (next) {
          showNotification(next.text);
          refillLogic(settings.language);
        }
      }
    };

    const interval = setInterval(triggerNotification, 1000 * 60 * 60); 
    return () => clearInterval(interval);
  }, [settings.hourlyMotivation, settings.language, refillLogic]);

  // --- Handlers ---

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => setNotificationMessage(null), 8000);
  };

  const handleResetSobriety = (reason: string) => {
    const now = new Date();
    setSobrietyStartDate(now);
    setSobrietyDate(now);
    addRelapseRecord(reason); 
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
    refillLogic(newSettings.language);
  };

  const handleUnlock = () => {
    if (unlockPin === settings.privacyPin) {
      setIsLocked(false);
      setUnlockError(false);
      setUnlockPin('');
    } else {
      setUnlockError(true);
      setUnlockPin('');
    }
  };

  const handleRecoveryReset = () => {
    if (
      recoveryAnswerInput.toLowerCase().trim() === settings.recoveryAnswer.toLowerCase().trim() && 
      recoveryNewPin.length === 4
    ) {
      const newSettings = { ...settings, privacyPin: recoveryNewPin };
      handleUpdateSettings(newSettings);
      setIsLocked(false);
      setShowRecovery(false);
      setRecoveryAnswerInput('');
      setRecoveryNewPin('');
      setRecoveryError('');
    } else {
      setRecoveryError(t.wrongAnswer);
    }
  };

  // --- Render ---

  // Privacy Lock Screen
  if (isLocked) {
    if (showRecovery) {
      return (
        <div className={`min-h-screen bg-[#0F5132] flex flex-col items-center justify-center p-8 text-white ${fontClass}`}>
          <button onClick={() => setShowRecovery(false)} className="absolute top-8 left-8 p-2 bg-white/10 rounded-full">
            <ArrowLeft size={20} />
          </button>
          
          <Key size={48} className="mb-6 text-[#FFC107]" />
          <h2 className="text-2xl font-bold mb-2">{t.recoveryTitle}</h2>
          <p className="text-xs opacity-60 text-center mb-8 max-w-xs">{t.recoveryHint}</p>
          
          <div className="w-full max-w-xs space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2 block">{t.recoveryQuestion}</label>
              <div className="bg-white/10 rounded-xl p-4 text-sm font-medium border border-white/5 italic">
                {settings.recoveryQuestion || "No question set"}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2 block">{t.recoveryAnswer}</label>
              <input 
                type="text"
                value={recoveryAnswerInput}
                onChange={(e) => setRecoveryAnswerInput(e.target.value)}
                className="w-full bg-white/20 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[#FFC107]/50"
                placeholder={t.answerPlaceholder}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2 block">{t.newPin}</label>
              <input 
                type="password"
                maxLength={4}
                value={recoveryNewPin}
                onChange={(e) => setRecoveryNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white/20 border-none rounded-xl py-3 px-4 text-center text-xl tracking-widest outline-none focus:ring-2 focus:ring-[#FFC107]/50"
                placeholder="••••"
              />
            </div>

            {recoveryError && <p className="text-red-400 text-center text-xs font-semibold">{recoveryError}</p>}

            <button 
              onClick={handleRecoveryReset}
              disabled={!recoveryAnswerInput || recoveryNewPin.length !== 4}
              className="w-full bg-[#FFC107] text-[#0F5132] font-bold py-4 rounded-xl hover:bg-yellow-500 transition shadow-lg disabled:opacity-50"
            >
              {t.recoveryTitle}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`min-h-screen bg-[#0F5132] flex flex-col items-center justify-center p-6 text-white ${fontClass}`}>
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
           <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Tawbah Companion</h2>
        <p className="text-white/70 mb-8">{t.enterPin}</p>
        
        <div className="w-full max-w-xs space-y-4">
           <input 
             type="password" 
             maxLength={4}
             value={unlockPin}
             onChange={(e) => { 
               const val = e.target.value.replace(/\D/g, '');
               setUnlockPin(val); 
               setUnlockError(false); 
             }}
             onKeyUp={(e) => e.key === 'Enter' && handleUnlock()}
             className="w-full bg-white/20 border-none rounded-xl py-4 text-center text-3xl tracking-widest text-white placeholder-white/30 focus:ring-2 focus:ring-white/50 outline-none transition-all"
             placeholder="••••"
             autoFocus
           />
           {unlockError && <p className="text-[#FFC107] text-center text-sm font-semibold">{t.pinError}</p>}
           
           <button 
             onClick={handleUnlock}
             className="w-full bg-white text-[#0F5132] font-bold py-4 rounded-xl hover:bg-gray-100 transition active:scale-95 shadow-lg"
           >
             Unlock
           </button>

           {settings.recoveryQuestion && (
             <button 
                onClick={() => setShowRecovery(true)}
                className="w-full text-center text-white/50 hover:text-white transition py-2 flex items-center justify-center gap-2 text-xs"
             >
                <HelpCircle size={14} /> {t.forgotPin}
             </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-gray-800 relative max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col ${fontClass}`}>
      
      {view !== 'chat' && (
        <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
          <div>
            <h1 className="text-xl font-bold text-[#0F5132]">Tawbah Companion</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">One day at a time, Insha'Allah</p>
              {isRefilling && <span className="text-[10px] text-blue-500 animate-pulse">({t.updatingContent})</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400" title={isOnline ? t.online : t.offline}>
              {isOnline ? <Wifi size={16} className="text-green-600" /> : <WifiOff size={16} />}
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0F5132] flex items-center justify-center text-white font-bold text-xs">
              TC
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className={view !== 'chat' ? 'p-4 pb-24' : 'h-full'}>
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
          {view === 'tracker' && <PrayerTracker history={prayerHistory} settings={settings} />}
          {view === 'settings' && (
            <Settings 
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
          {view === 'chat' && (
            <ChatView language={settings.language} />
          )}
        </div>
      </main>

      {notificationMessage && (
        <div className="absolute top-20 left-4 right-4 bg-white border-l-4 border-[#FFC107] p-4 shadow-xl rounded-r-lg z-40 animate-in slide-in-from-top-2 duration-500">
          <p className="text-sm font-medium text-gray-800 italic">"{notificationMessage}"</p>
        </div>
      )}

      <button
        onClick={() => setIsSOSOpen(true)}
        className="absolute bottom-24 right-4 bg-[#D32F2F] text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition z-30 animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <ShieldAlert size={24} />
      </button>

      <nav className="bg-white border-t border-gray-100 px-2 py-4 flex justify-around items-center absolute bottom-0 left-0 right-0 z-20">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 flex-1 transition ${view === 'dashboard' ? 'text-[#0F5132]' : 'text-gray-400'}`}>
          <Home size={22} strokeWidth={view === 'dashboard' ? 2.5 : 2} />
          <span className="text-[9px] font-medium">{t.home}</span>
        </button>
        <button onClick={() => setView('chat')} className={`flex flex-col items-center gap-1 flex-1 transition ${view === 'chat' ? 'text-[#0F5132]' : 'text-gray-400'}`}>
          <MessageCircle size={22} strokeWidth={view === 'chat' ? 2.5 : 2} />
          <span className="text-[9px] font-medium">{t.chat}</span>
        </button>
        <button onClick={() => setView('tracker')} className={`flex flex-col items-center gap-1 flex-1 transition ${view === 'tracker' ? 'text-[#0F5132]' : 'text-gray-400'}`}>
          <Calendar size={22} strokeWidth={view === 'tracker' ? 2.5 : 2} />
          <span className="text-[9px] font-medium">{t.history}</span>
        </button>
        <button onClick={() => setView('settings')} className={`flex flex-col items-center gap-1 flex-1 transition ${view === 'settings' ? 'text-[#0F5132]' : 'text-gray-400'}`}>
          <SettingsIcon size={22} strokeWidth={view === 'settings' ? 2.5 : 2} />
          <span className="text-[9px] font-medium">{t.settings}</span>
        </button>
      </nav>

      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} language={settings.language} />
    </div>
  );
};

export default App;