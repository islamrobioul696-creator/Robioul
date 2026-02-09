import { PrayerHistory, AppSettings, ContentItem } from '../types';
import { INITIAL_SETTINGS, QUOTES } from '../constants';

const KEYS = {
  SOBRIETY_START: 'tc_sobriety_start',
  PRAYER_HISTORY: 'tc_prayer_history',
  SETTINGS: 'tc_settings',
  CONTENT_BUFFER: 'tc_content_buffer',
  DAILY_QUOTE_MAP: 'tc_daily_quote_map', // Maps date+lang to contentId
};

// --- General Persistence ---

export const getSobrietyStartDate = (): Date => {
  const saved = localStorage.getItem(KEYS.SOBRIETY_START);
  return saved ? new Date(saved) : new Date();
};

export const setSobrietyStartDate = (date: Date) => {
  localStorage.setItem(KEYS.SOBRIETY_START, date.toISOString());
};

export const getPrayerHistory = (): PrayerHistory => {
  const saved = localStorage.getItem(KEYS.PRAYER_HISTORY);
  return saved ? JSON.parse(saved) : {};
};

export const savePrayerHistory = (history: PrayerHistory) => {
  localStorage.setItem(KEYS.PRAYER_HISTORY, JSON.stringify(history));
};

export const getSettings = (): AppSettings => {
  const saved = localStorage.getItem(KEYS.SETTINGS);
  if (saved) {
    return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
  }
  return INITIAL_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

// --- Content Buffer (Local DB Logic) ---

const generateId = () => Math.random().toString(36).substr(2, 9);

export const getContentBuffer = (): ContentItem[] => {
  const saved = localStorage.getItem(KEYS.CONTENT_BUFFER);
  return saved ? JSON.parse(saved) : [];
};

export const saveContentBuffer = (buffer: ContentItem[]) => {
  localStorage.setItem(KEYS.CONTENT_BUFFER, JSON.stringify(buffer));
};

export const getUnseenCount = (language: 'EN' | 'BN'): number => {
  const buffer = getContentBuffer();
  return buffer.filter(item => !item.isShown && item.language === language).length;
};

export const addItemsToBuffer = (newItems: Omit<ContentItem, 'id' | 'isShown' | 'createdAt'>[]) => {
  const buffer = getContentBuffer();
  const timestamp = Date.now();
  
  const formattedItems: ContentItem[] = newItems.map(item => ({
    ...item,
    id: generateId(),
    isShown: false,
    createdAt: timestamp
  }));

  saveContentBuffer([...buffer, ...formattedItems]);
};

export const consumeNextUnseen = (language: 'EN' | 'BN'): ContentItem | null => {
  const buffer = getContentBuffer();
  const index = buffer.findIndex(item => !item.isShown && item.language === language);
  
  if (index === -1) return null;

  const item = buffer[index];
  buffer[index] = { ...item, isShown: true };
  saveContentBuffer(buffer);
  return item;
};

export const markAsShown = (id: string) => {
  const buffer = getContentBuffer();
  const updated = buffer.map(item => item.id === id ? { ...item, isShown: true } : item);
  saveContentBuffer(updated);
};

// --- Dashboard Logic (Daily Wisdom Box) ---

export const getOrSelectDailyWisdom = (language: 'EN' | 'BN'): ContentItem | null => {
  const todayStr = new Date().toISOString().split('T')[0];
  const mapKey = `${todayStr}_${language}`;
  const mapSaved = localStorage.getItem(KEYS.DAILY_QUOTE_MAP);
  const map = mapSaved ? JSON.parse(mapSaved) : {};

  if (map[mapKey]) {
    const buffer = getContentBuffer();
    return buffer.find(i => i.id === map[mapKey]) || null;
  }

  // Pick new
  const next = consumeNextUnseen(language);
  if (next) {
    map[mapKey] = next.id;
    localStorage.setItem(KEYS.DAILY_QUOTE_MAP, JSON.stringify(map));
    return next;
  }

  return null;
};

export const seedInitialBuffer = () => {
  const buffer = getContentBuffer();
  if (buffer.length === 0) {
    const seed: ContentItem[] = QUOTES.map(q => ({
      id: generateId(),
      text: q.text,
      source: q.source,
      category: 'Motivation',
      language: 'EN',
      isShown: false,
      createdAt: Date.now()
    }));
    saveContentBuffer(seed);
  }
};