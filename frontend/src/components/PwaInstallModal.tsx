import React, { useState, useEffect } from 'react';
import { useDialog } from '../hooks/useDialog';
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Share,
  Check,
  ShieldCheck,
  Zap,
  WifiOff,
  Maximize2,
  HardDrive,
  Sparkles,
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  isStandalone: boolean;
  onInstalled: () => void;
}

const CAROUSEL_SLIDES = [
  {
    title: 'Esperienza Keep + Tasks Unificata',
    tagline: 'Note, liste e scadenze in un\'unica interfaccia pastello minimale',
    image: '/screenshots/screenshot-narrow-1.png',
    highlight: 'Entità Unica',
    badge: 'Produttività',
  },
  {
    title: 'Atomic Time Tracking',
    tagline: 'Avvia e ferma il cronometro su ogni card con log temporale persistente',
    image: '/screenshots/screenshot-narrow-2.png',
    highlight: 'Zero Distrazioni',
    badge: 'Focus & Log',
  },
  {
    title: 'Ricerca Semantica AI Locale',
    tagline: 'Trova le tue note per significato grazie ai modelli Transformers.js integrati',
    image: '/screenshots/screenshot-narrow-3.png',
    highlight: '100% Locale',
    badge: 'AI Edge',
  },
];

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  isStandalone,
  onInstalled,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
  }, []);

  const containerRef = useDialog(isOpen);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstalled();
        onClose();
      }
    }
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Installa J.U.N.T. come applicazione"
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-modal overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header - Supercell Store Style */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-white to-sky-50/80">
          <div className="flex items-center gap-3">
            <img
              src="/logo-light.png"
              alt="J.U.N.T. Store"
              className="w-12 h-12 rounded-2xl object-cover shadow-soft border border-white flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-tight">
                  J.U.N.T. Store
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                  FOSS PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Installazione Diretta • Nessun App Store • Zero MegaByte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Status Message if already installed */}
          {isStandalone && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>App già installata ed eseguita in modalità Standalone Nativa!</span>
            </div>
          )}

          {/* Interactive Mockup Carousel (Supercell Pattern) */}
          <div className="relative rounded-2xl bg-slate-900 overflow-hidden shadow-card border border-slate-800 text-white min-h-[260px] flex flex-col justify-between p-5">
            {/* Slide Header */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-sm">
                {CAROUSEL_SLIDES[activeSlide].badge}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                {activeSlide + 1} / {CAROUSEL_SLIDES.length}
              </span>
            </div>

            {/* Slide Content */}
            <div className="my-3 z-10 max-w-md">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-300">
                {CAROUSEL_SLIDES[activeSlide].highlight}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white leading-tight">
                {CAROUSEL_SLIDES[activeSlide].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                {CAROUSEL_SLIDES[activeSlide].tagline}
              </p>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 z-10">
              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {CAROUSEL_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeSlide ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={prevSlide}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/30 pointer-events-none" />
          </div>

          {/* Key PWA Value Propositions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50 flex flex-col gap-1">
              <WifiOff className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-950">100% Offline</span>
              <span className="text-[10px] text-amber-800/80">Funziona senza connessione</span>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/50 flex flex-col gap-1">
              <Zap className="w-4 h-4 text-sky-700" />
              <span className="text-xs font-bold text-sky-950">Zero Latenza</span>
              <span className="text-[10px] text-sky-800/80">Database SQLite locale</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/50 flex flex-col gap-1">
              <Maximize2 className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-bold text-purple-950">Schermo Intero</span>
              <span className="text-[10px] text-purple-800/80">Senza barre browser</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/50 flex flex-col gap-1">
              <HardDrive className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-950">0 MB Store</span>
              <span className="text-[10px] text-emerald-800/80">Nessun download pesante</span>
            </div>
          </div>

          {/* OS Specific Installation Instructions */}
          {isIOS ? (
            /* iOS Safari Step-by-Step Guide */
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Share className="w-4 h-4 text-blue-600" />
                <span>Come installare su iPhone &amp; iPad (Safari)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    1
                  </span>
                  <span>Tocca l'icona <strong>Condividi</strong> 📤 in Safari</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    2
                  </span>
                  <span>Scorri e tocca <strong>Aggiungi a Home</strong> ➕</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    3
                  </span>
                  <span>Tocca <strong>Aggiungi</strong> in alto a destra ✅</span>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Desktop / Chrome Rich Prompt Guide */
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-200 text-amber-900">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    Installa l'App Standalone
                  </h4>
                  <p className="text-xs text-amber-800/80">
                    Accesso istantaneo dal desktop o dal cassetto app del tuo dispositivo.
                  </p>
                </div>
              </div>

              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-md shadow-amber-200 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Installa Ora (1-Click)</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-medium">
                  {isStandalone
                    ? 'App attiva in modalità standalone'
                    : 'Usa il menu del browser (⋮) ➔ "Installa app"'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-[#FBFBFA] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>J.U.N.T. Progressive Web App</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
