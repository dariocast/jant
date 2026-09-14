import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

interface PwaBannerProps {
  onOpenModal: () => void;
  isStandalone: boolean;
}

export const PwaBanner: React.FC<PwaBannerProps> = ({ onOpenModal, isStandalone }) => {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (isStandalone) return;
    const dismissedUntil = localStorage.getItem('jant_pwa_banner_dismissed');
    if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
      setIsDismissed(false);
    }
  }, [isStandalone]);

  const handleDismiss = () => {
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('jant_pwa_banner_dismissed', String(nextWeek));
    setIsDismissed(true);
  };

  if (isDismissed || isStandalone) return null;

  return (
    <div className="bg-gradient-to-r from-amber-200/90 via-sky-200/90 to-purple-200/90 border-b border-amber-300/60 px-4 py-2 text-slate-800 text-xs shadow-xs animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white/80 text-amber-900 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-900">
            Installa J.A.N.T. come app nativa offline:
          </span>
          <span className="hidden sm:inline text-slate-700">
            Zero latenza, nessun app store e notifiche push integrate.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModal}
            className="px-3 py-1 font-bold text-[11px] bg-slate-900 text-white hover:bg-slate-800 active:scale-95 rounded-lg shadow-xs transition-all flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>Scopri &amp; Installa</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-600 hover:text-slate-950 hover:bg-black/5 rounded-lg transition-all"
            title="Non mostrare per 7 giorni"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
