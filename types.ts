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

export interface AppSettings {
  language: 'EN' | 'BN';
  notificationsEnabled: boolean;
  hourlyMotivation: boolean;
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

export type ViewState = 'dashboard' | 'tracker' | 'settings';