export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerRecord {
  Fajr: boolean;
  Dhuhr: boolean;
  Asr: boolean;
  Maghrib: boolean;
  Isha: boolean;
}

// Map: DateString (YYYY-MM-DD) -> PrayerRecord
export interface PrayerHistory {
  [date: string]: PrayerRecord;
}

export interface RelapseRecord {
  date: string; // ISO String
  reason: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface AppSettings {
  language: 'EN' | 'BN';
  notificationsEnabled: boolean;
  hourlyMotivation: boolean;
  isPrivacyLockEnabled: boolean;
  privacyPin: string; // Simple 4 digit pin
  recoveryQuestion: string; // e.g. "What is your favorite color?"
  recoveryAnswer: string;
  prayerTimes: {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
}

export interface Quote {
  text: string;
  source: string;
  isArabic?: boolean;
}

export interface ContentItem {
  id: string;
  text: string;
  source: string;
  category: 'Motivation' | 'Warning' | 'Hope';
  language: 'EN' | 'BN';
  isShown: boolean;
  createdAt: number;
}

export type ViewState = 'dashboard' | 'tracker' | 'settings' | 'chat';