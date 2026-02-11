import React, { useState } from 'react';
import { Bell, Clock, ShieldCheck, Info, Globe, Lock, Key, RefreshCw } from 'lucide-react';
import { AppSettings } from '../types';
import { PRAYER_NAMES, THEME, TRANSLATIONS } from '../constants';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const t = TRANSLATIONS[settings.language];
  const fontClass = settings.language === 'BN' ? 'font-bengali' : 'font-sans';
  
  const [pinInput, setPinInput] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  
  const [recoveryData, setRecoveryData] = useState({
    question: settings.recoveryQuestion || '',
    answer: settings.recoveryAnswer || ''
  });
  const [showRecoveryInput, setShowRecoveryInput] = useState(false);

  const toggleLanguage = () => {
    const newLang = settings.language === 'EN' ? 'BN' : 'EN';
    onUpdateSettings({ ...settings, language: newLang });
  };

  const handlePrivacyToggle = () => {
    if (!settings.isPrivacyLockEnabled) {
      setShowPinInput(true);
    } else {
      onUpdateSettings({ ...settings, isPrivacyLockEnabled: false, privacyPin: '' });
      setPinInput('');
    }
  };

  const savePin = () => {
    if (pinInput.length === 4) {
      onUpdateSettings({ ...settings, isPrivacyLockEnabled: true, privacyPin: pinInput });
      setShowPinInput(false);
      setPinInput('');
    }
  };

  const saveRecovery = () => {
    onUpdateSettings({
      ...settings,
      recoveryQuestion: recoveryData.question,
      recoveryAnswer: recoveryData.answer
    });
    setShowRecoveryInput(false);
  };

  const updateTime = (prayer: keyof typeof settings.prayerTimes, time: string) => {
    onUpdateSettings({
      ...settings,
      prayerTimes: {
        ...settings.prayerTimes,
        [prayer]: time
      }
    });
  };

  return (
    <div className={`space-y-6 pb-24 ${fontClass}`}>
      {/* Language */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Globe size={20} color={THEME.primary} />
          {t.language}
        </h2>
        
         <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{t.changeLanguage}</p>
              <p className="text-xs text-gray-400">{settings.language === 'EN' ? 'Current: English' : 'বর্তমান: বাংলা'}</p>
            </div>
            <button
              onClick={toggleLanguage}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${settings.language === 'BN' ? 'bg-[#0F5132] text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {settings.language === 'EN' ? 'Switch to BN' : 'Switch to EN'}
            </button>
          </div>
      </div>

      {/* Privacy Lock */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Lock size={20} color={THEME.primary} />
          {t.privacyLock}
        </h2>

        <div className="flex items-center justify-between mb-4">
           <div>
              <p className="font-medium text-gray-800">{settings.isPrivacyLockEnabled ? 'Update App PIN' : 'Enable App PIN'}</p>
              <p className="text-xs text-gray-400">Lock app on startup</p>
            </div>
            <div className="flex gap-2">
               {settings.isPrivacyLockEnabled && (
                 <button 
                  onClick={() => setShowPinInput(!showPinInput)}
                  className="p-2 text-[#0F5132] hover:bg-gray-50 rounded-lg transition"
                 >
                   <RefreshCw size={18} />
                 </button>
               )}
               <button
                  onClick={handlePrivacyToggle}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.isPrivacyLockEnabled ? 'bg-[#0F5132]' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.isPrivacyLockEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>

        {showPinInput && (
          <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-2 mb-4">
            <input 
              type="password" 
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4 digits"
              className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-[#0F5132]"
            />
            <button 
              onClick={savePin}
              disabled={pinInput.length !== 4}
              className="bg-[#0F5132] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {t.save}
            </button>
          </div>
        )}

        {/* Recovery Question Setup */}
        {settings.isPrivacyLockEnabled && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-[#FFC107]" />
                <span className="font-medium text-sm text-gray-700">{t.setRecovery}</span>
              </div>
              <button 
                onClick={() => setShowRecoveryInput(!showRecoveryInput)}
                className="text-[10px] font-bold text-[#0F5132] uppercase underline"
              >
                {showRecoveryInput ? t.cancel : 'Setup'}
              </button>
            </div>
            
            {!showRecoveryInput && settings.recoveryQuestion && (
              <p className="text-[10px] text-gray-400 italic">Recovery info is set up.</p>
            )}

            {showRecoveryInput && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] text-gray-500">{t.setRecoveryDesc}</p>
                <input 
                  type="text"
                  value={recoveryData.question}
                  onChange={(e) => setRecoveryData({...recoveryData, question: e.target.value})}
                  placeholder={t.questionPlaceholder}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F5132]"
                />
                <input 
                  type="text"
                  value={recoveryData.answer}
                  onChange={(e) => setRecoveryData({...recoveryData, answer: e.target.value})}
                  placeholder={t.answerPlaceholder}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F5132]"
                />
                <button 
                  onClick={saveRecovery}
                  disabled={!recoveryData.question || !recoveryData.answer}
                  className="w-full bg-[#0F5132] text-white py-2 rounded-lg text-xs font-bold disabled:opacity-50 shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Bell size={20} color={THEME.primary} />
          {t.notifications}
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{t.prayerAlarms}</p>
              <p className="text-xs text-gray-400">{t.notificationsDesc}</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notificationsEnabled ? 'bg-[#0F5132]' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{t.hourlyMotivation}</p>
              <p className="text-xs text-gray-400">{t.motivationDesc}</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, hourlyMotivation: !settings.hourlyMotivation })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.hourlyMotivation ? 'bg-[#0F5132]' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.hourlyMotivation ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Prayer Times */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Clock size={20} color={THEME.primary} />
          {t.prayerTimes}
        </h2>
        
        <div className="space-y-4">
          {PRAYER_NAMES.map((prayer) => (
            <div key={prayer} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="font-medium text-gray-700">{prayer}</span>
              <input
                type="time"
                value={settings.prayerTimes[prayer]}
                onChange={(e) => updateTime(prayer, e.target.value)}
                className="bg-gray-100 border-none rounded-lg px-3 py-1 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-[#0F5132] outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Info */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
         <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShieldCheck size={20} color={THEME.primary} />
          {t.privacyData}
        </h2>
        <div className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl">
            <Info size={20} className="text-gray-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              {t.privacyDesc}
            </p>
        </div>
      </div>
    </div>
  );
};
