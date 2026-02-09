import React from 'react';
import { Bell, Clock, ShieldCheck, Info, Globe } from 'lucide-react';
import { AppSettings } from '../types';
import { PRAYER_NAMES, THEME, TRANSLATIONS } from '../constants';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const t = TRANSLATIONS[settings.language];
  const fontClass = settings.language === 'BN' ? 'font-bengali' : 'font-sans';

  const toggleNotification = () => {
    onUpdateSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
  };

  const toggleMotivation = () => {
    onUpdateSettings({ ...settings, hourlyMotivation: !settings.hourlyMotivation });
  };

  const toggleLanguage = () => {
    const newLang = settings.language === 'EN' ? 'BN' : 'EN';
    onUpdateSettings({ ...settings, language: newLang });
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
    <div className={`space-y-6 pb-20 ${fontClass}`}>
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
              onClick={toggleNotification}
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
              onClick={toggleMotivation}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.hourlyMotivation ? 'bg-[#0F5132]' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.hourlyMotivation ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

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