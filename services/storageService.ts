import { PrayerHistory, AppSettings, ContentItem, RelapseRecord, ChatMessage } from '../types';
import { INITIAL_SETTINGS, QUOTES } from '../constants';

const KEYS = {
  SOBRIETY_START: 'tc_sobriety_start',
  PRAYER_HISTORY: 'tc_prayer_history',
  SETTINGS: 'tc_settings',
  CONTENT_BUFFER: 'tc_content_buffer',
  DAILY_QUOTE_MAP: 'tc_daily_quote_map',
  RELAPSE_HISTORY: 'tc_relapse_history',
  CHAT_HISTORY: 'tc_chat_history',
};

// --- Sobriety & Prayer ---

export const getSobrietyStartDate = (): Date => {
  const saved = localStorage.getItem(KEYS.SOBRIETY_START);
  return saved ? new Date(saved) : new Date();
};

export const setSobrietyStartDate = (date: Date) => {
  localStorage.setItem(KEYS.SOBRIETY_START, date.toISOString());
};

export const getRelapseHistory = (): RelapseRecord[] => {
  const saved = localStorage.getItem(KEYS.RELAPSE_HISTORY);
  return saved ? JSON.parse(saved) : [];
};

export const addRelapseRecord = (reason: string) => {
  const history = getRelapseHistory();
  const record: RelapseRecord = {
    date: new Date().toISOString(),
    reason: reason
  };
  localStorage.setItem(KEYS.RELAPSE_HISTORY, JSON.stringify([...history, record]));
};

// --- Chat History ---

export const getChatHistory = (): ChatMessage[] => {
  const saved = localStorage.getItem(KEYS.CHAT_HISTORY);
  return saved ? JSON.parse(saved) : [];
};

export const saveChatMessage = (message: ChatMessage) => {
  const history = getChatHistory();
  // Keep last 50 messages for context efficiency
  const updatedHistory = [...history, message].slice(-50);
  localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(updatedHistory));
};

export const clearChatHistory = () => {
  localStorage.removeItem(KEYS.CHAT_HISTORY);
};

// --- Settings & Prayers ---

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

// --- Content Buffer ---

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

export const getOrSelectDailyWisdom = (language: 'EN' | 'BN'): ContentItem | null => {
  const todayStr = new Date().toISOString().split('T')[0];
  const mapKey = `${todayStr}_${language}`;
  const mapSaved = localStorage.getItem(KEYS.DAILY_QUOTE_MAP);
  const map = mapSaved ? JSON.parse(mapSaved) : {};

  if (map[mapKey]) {
    const buffer = getContentBuffer();
    return buffer.find(i => i.id === map[mapKey]) || null;
  }

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