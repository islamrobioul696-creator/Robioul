import { Quote, PrayerName } from './types';

export const THEME = {
  primary: '#0F5132', // Deep Emerald Green
  secondary: '#FAFAFA', // Cream
  accent: '#FFC107', // Gold
  danger: '#D32F2F', // Soft Red
  text: '#1F2937',
};

export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const RELAPSE_REASONS = [
  "Stress / Anxiety",
  "Boredom / Idleness",
  "Social Media Trigger",
  "Loneliness",
  "Anger / Frustration",
  "Accidental / Slip",
  "Other"
];

export const QUOTES: Quote[] = [
  { text: "Indeed, Allah loves those who are constantly repentant and loves those who purify themselves.", source: "Surah Al-Baqarah 2:222" },
  { text: "Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.", source: "Surah Az-Zumar 39:53" },
  { text: "And whoever fears Allah - He will make for him a way out.", source: "Surah At-Talaq 65:2" },
  { text: "Every son of Adam commits sin, and the best of those who commit sin are those who repent.", source: "Prophet Muhammad (ﷺ)" },
  { text: "Determine to remove the sin, regret what has passed, and resolve never to return to it.", source: "Imam Al-Nawawi" },
  { text: "Your past does not define you, your Tawbah does.", source: "Islamic Wisdom" },
];

export const INITIAL_SETTINGS = {
  language: 'EN' as const,
  notificationsEnabled: true,
  hourlyMotivation: true,
  isPrivacyLockEnabled: false,
  privacyPin: "",
  recoveryQuestion: "",
  recoveryAnswer: "",
  prayerTimes: {
    Fajr: "05:00",
    Dhuhr: "13:00",
    Asr: "16:30",
    Maghrib: "18:45",
    Isha: "20:30"
  }
};

export const CHAT_PERSONA = (language: 'EN' | 'BN') => {
  return `Act as a compassionate Islamic spiritual counselor for someone recovering from addiction. 
  Provide hope from Quran & Sunnah. Be non-judgmental. 
  Keep responses concise and empathetic. 
  Reply strictly in ${language === 'BN' ? 'Bengali' : 'English'}.`;
};

export const TRANSLATIONS = {
  EN: {
    dailyWisdom: "Daily Wisdom",
    cleanTime: "Clean Time",
    days: "DAYS",
    hours: "HRS",
    mins: "MINS",
    resetStreak: "Reset Streak",
    resetConfirm: "Why did this happen?",
    selectReason: "Select a trigger to help you learn:",
    confirmReset: "Confirm Reset",
    cancel: "Cancel",
    reset: "Reset",
    todaysPrayers: "Today's Prayers",
    settings: "Settings",
    notifications: "Notifications",
    prayerAlarms: "Prayer Alarms",
    hourlyMotivation: "Hourly Motivation",
    privacyLock: "App Lock (PIN)",
    setPin: "Set PIN",
    enterPin: "Enter PIN to Unlock",
    pinError: "Incorrect PIN",
    forgotPin: "Forgot PIN?",
    recoveryTitle: "Reset PIN",
    recoveryQuestion: "Security Question",
    recoveryAnswer: "Your Answer",
    recoveryHint: "Enter the recovery answer you set in settings",
    setRecovery: "Set Recovery Info",
    setRecoveryDesc: "Backup info to reset your PIN if forgotten",
    questionPlaceholder: "e.g. Favorite Teacher / Birthplace",
    answerPlaceholder: "Your secret answer",
    newPin: "New 4-digit PIN",
    save: "Save",
    wrongAnswer: "Incorrect Answer",
    prayerTimes: "Prayer Times",
    privacyData: "Privacy & Data",
    language: "App Language",
    changeLanguage: "English / বাংলা",
    home: "Home",
    history: "History",
    chat: "Counselor",
    chatHeader: "Islamic AI Counselor",
    chatPlaceholder: "Ask for advice or motivation...",
    clearChat: "Clear History",
    typing: "AI is thinking...",
    sos: "I am in control now, Alhamdulillah",
    sosTitle: "Does he not know that Allah sees?",
    sosActions: [
      "Perform Wudu immediately (Cold water recommended).",
      "Change your environment. Go outside.",
      "Call a friend or sit with family.",
      "Recite 'Audhu billahi minash shaytanir rajeem'.",
      "Remember: The pleasure is fleeting, the regret is long."
    ],
    updatingContent: "Updating Content...",
    notificationsDesc: "Receive alerts for prayer times",
    motivationDesc: "Spiritual reminders throughout the day",
    privacyDesc: "All data is stored locally on your device. No information is sent to any server. Tawbah Companion respects your privacy completely.",
    online: "Online",
    offline: "Offline",
    completed: "Completed",
    upcoming: "Upcoming",
    missed: "Missed",
  },
  BN: {
    dailyWisdom: "দৈনিক প্রজ্ঞা",
    cleanTime: "পবিত্র থাকার সময়",
    days: "দিন",
    hours: "ঘণ্টা",
    mins: "মিনিট",
    resetStreak: "রিসেট করুন",
    resetConfirm: "কেন এমন হলো?",
    selectReason: "ভবিষ্যতে সতর্ক থাকার জন্য কারণ নির্বাচন করুন:",
    confirmReset: "রিসেট নিশ্চিত করুন",
    cancel: "বাতিল",
    reset: "রিসেট",
    todaysPrayers: "আজকের নামাজ",
    settings: "সেটিংস",
    notifications: "নোটিফিকেশন",
    prayerAlarms: "নামাজের অ্যালার্ম",
    hourlyMotivation: "ঘণ্টায় অনুপ্রেরণা",
    privacyLock: "অ্যাপ লক (PIN)",
    setPin: "পিন সেট করুন",
    enterPin: "আনলক করতে পিন দিন",
    pinError: "ভুল পিন",
    forgotPin: "পিন ভুলে গেছেন?",
    recoveryTitle: "পিন রিসেট করুন",
    recoveryQuestion: "সিকিউরিটি প্রশ্ন",
    recoveryAnswer: "আপনার উত্তর",
    recoveryHint: "সেটিংস-এ সেট করা উত্তরটি দিন",
    setRecovery: "রিকভারি তথ্য সেট করুন",
    setRecoveryDesc: "পিন ভুলে গেলে রিসেট করার ব্যাকআপ তথ্য",
    questionPlaceholder: "যেমন: প্রিয় শিক্ষক / জন্মস্থান",
    answerPlaceholder: "আপনার গোপন উত্তর",
    newPin: "নতুন ৪ ডিজিটের পিন",
    save: "সেভ করুন",
    wrongAnswer: "উত্তর সঠিক নয়",
    prayerTimes: "নামাজের সময়সূচী",
    privacyData: "গোপনীয়তা এবং ডেটা",
    language: "অ্যাপের ভাষা",
    changeLanguage: "English / বাংলা",
    home: "হোম",
    history: "ইতিহাস",
    chat: "পরামর্শদাতা",
    chatHeader: "ইসলামিক এআই পরামর্শদাতা",
    chatPlaceholder: "পরামর্শ বা অনুপ্রেরণা খুঁজুন...",
    clearChat: "ইতিহাস মুছুন",
    typing: "এআই চিন্তা করছে...",
    sos: "আলহামদুলিল্লাহ, আমি এখন নিয়ন্ত্রণে আছি",
    sosTitle: "সে কি জানে না যে আল্লাহ দেখছেন?",
    sosActions: [
      "অবিলম্বে ওযু করুন (ঠান্ডা পানি ব্যবহার করুন)।",
      "আপনার পরিবেশ পরিবর্তন করুন। বাইরে যান।",
      "বন্ধুকে কল করুন বা পরিবারের সাথে বসুন।",
      "পাঠ করুন 'আউযু বিল্লাহি মিনাশ শাইতানির রাজিম' ।",
      "মনে রাখবেন: এই সুখ ক্ষণস্থায়ী, কিন্তু অনুশোচনা দীর্ঘ।"
    ],
    updatingContent: "নতুন তথ্য লোড হচ্ছে...",
    notificationsDesc: "নামাজের সময়ের জন্য অ্যালার্ট পান",
    motivationDesc: "সারা দিন আধ্যাত্মিক রিমাইন্ডার",
    privacyDesc: "সমস্ত ডেটা আপনার ডিভাইসে লোকালি সংরক্ষিত। কোনো সার্ভারে তথ্য পাঠানো হয় না। তওবা কম্প্যানিয়ন আপনার গোপনীয়তাকে সম্পূর্ণ সম্মান করে।",
    online: "অনলাইন",
    offline: "অফলাইন",
    completed: "সম্পন্ন",
    upcoming: "আসন্ন",
    missed: "ছুটে গেছে",
  }
};