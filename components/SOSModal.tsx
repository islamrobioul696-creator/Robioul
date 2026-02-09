import React from 'react';
import { X, ShieldAlert, Droplets, Wind, Phone, BookOpen } from 'lucide-react';
import { TRANSLATIONS, THEME } from '../constants';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'EN' | 'BN';
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const fontClass = language === 'BN' ? 'font-bengali' : 'font-sans';
  const icons = [Droplets, Wind, Phone, BookOpen, ShieldAlert];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300 ${fontClass}`} style={{ backgroundColor: THEME.danger }}>
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
      >
        <X size={32} />
      </button>

      <div className="text-center text-white mb-10">
        <ShieldAlert size={80} className="mx-auto mb-6 opacity-90 animate-pulse" />
        <h2 className="text-4xl font-bold mb-4 font-arabic leading-relaxed text-yellow-300">
          أَلَمْ يَعْلَم بِأَنَّ ٱللَّهَ يَرَىٰ
        </h2>
        <h3 className="text-xl font-semibold mb-2">"{t.sosTitle}"</h3>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
        <h4 className="text-gray-800 font-bold text-lg mb-4 border-b pb-2">Immediate Actions</h4>
        <ul className="space-y-4">
          {t.sosActions.map((action, idx) => {
             const Icon = icons[idx % icons.length];
             return (
              <li key={idx} className="flex items-start gap-3 text-gray-700">
                <Icon className="shrink-0 text-red-600 mt-0.5" size={20} />
                <span>{action}</span>
              </li>
             );
          })}
        </ul>
        <button 
          onClick={onClose}
          className="w-full mt-6 py-4 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
        >
          {t.sos}
        </button>
      </div>
    </div>
  );
};