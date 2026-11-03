import React from 'react';
import { AppTheme } from '../types/tag';
import { ShieldCheck } from 'lucide-react';

interface FoundationFootnoteProps {
  theme?: AppTheme;
  variant?: 'full' | 'compact' | 'studio';
  className?: string;
}

/**
 * Official Fab Foundation Poland (FFP) Logotype & Mission Footnote
 * Displays across all pages with unified branding and non-profit disclosure.
 * Accented with #4B00F2.
 */
export const FoundationFootnote: React.FC<FoundationFootnoteProps> = ({
  theme = 'dark',
  variant = 'full',
  className = '',
}) => {
  const isLight = theme === 'light';

  // Compact variant for Studio bottom bar or tight spaces
  if (variant === 'studio') {
    return (
      <footer
        className={`w-full py-1 sm:py-2 px-2.5 sm:px-4 text-[9px] sm:text-xs select-none border-t transition-colors shrink-0 ${
          isLight
            ? 'bg-white/95 border-zinc-200/80 text-zinc-700 backdrop-blur-md'
            : 'bg-zinc-950/95 border-zinc-800/80 text-zinc-300 backdrop-blur-md'
        } ${className}`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-3 text-center sm:text-left">
          {/* Logotype */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img
              src="/assets/aistudio/ffp-logo_f8a6ff35.jpg"
              alt="Fab Foundation Poland (FFP) Logo"
              className={`h-5 sm:h-7.5 w-auto object-contain transition-all ${
                isLight ? 'mix-blend-multiply' : 'invert brightness-125 contrast-125 mix-blend-screen'
              }`}
            />
            <div className="flex flex-col text-left">
              <span className={`font-black text-[9.5px] sm:text-[11px] tracking-tight leading-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                FAB FOUNDATION POLAND <span className="text-[#4B00F2] font-extrabold text-[8.5px] sm:text-[10px]">(FFP)</span>
              </span>
              <span className="hidden xs:block text-[7.5px] sm:text-[9px] text-zinc-500 dark:text-zinc-300 uppercase tracking-wider font-semibold leading-tight">
                Computational Design & Digital Fabrication
              </span>
            </div>
          </div>

          {/* Note */}
          <div className="text-[8.5px] sm:text-[11px] leading-tight sm:leading-relaxed max-w-3xl">
            <span className="font-bold text-[#4B00F2]">Making a difference: </span>
            <span className="hidden sm:inline">
              Entire profit made on your purchase goes to Fab Foundation Poland (FFP), a non-profit organization dedicated to making things smartly and aspiring to establish- a first research unit dedicated to computational design and digital fabrication in Poland.
            </span>
            <span className="sm:hidden text-zinc-500 dark:text-zinc-400">
              100% of profits support Fab Foundation Poland (FFP) non-profit research unit in computational design.
            </span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={`w-full mt-14 border-t select-none transition-colors ${
        isLight
          ? 'bg-zinc-50/80 border-zinc-200 text-zinc-700'
          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div
          className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isLight
              ? 'bg-white border-zinc-200 shadow-sm'
              : 'bg-zinc-900/70 border-zinc-800/90 shadow-md'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Official Logotype */}
            <div className="flex items-center gap-4 shrink-0">
              <div className={`p-2.5 rounded-2xl border transition-colors shrink-0 flex items-center justify-center ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/80 border-zinc-800'
              }`}>
                <img
                  src="/assets/aistudio/ffp-logo_f8a6ff35.jpg"
                  alt="Fab Foundation Poland Logo"
                  className={`h-10 sm:h-12 w-auto object-contain transition-all ${
                    isLight ? 'mix-blend-multiply' : 'invert brightness-125 contrast-125 mix-blend-screen'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`text-base font-black tracking-tight ${isLight ? 'text-zinc-950' : 'text-zinc-100'}`}>
                    FAB FOUNDATION POLAND
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#4B00F2]/10 text-[#4B00F2] border border-[#4B00F2]/20">
                    (FFP)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Fundacja FabLab Poland · Non-profit Digital Fabrication Research
                </p>
              </div>
            </div>

            {/* Center: Making a Difference Note */}
            <div className="flex-1 lg:px-4">
              <div className="text-xs leading-relaxed">
                <span className="font-extrabold text-sm block mb-1 text-[#4B00F2]">
                  Making a difference:
                </span>
                <p className={`text-xs ${isLight ? 'text-zinc-700' : 'text-zinc-300'} leading-relaxed`}>
                  Entire profit made on your purchase goes to Fab Foundation Poland (FFP), a non-profit organization dedicated to making things smartly and aspiring to establish- a first research unit dedicated to computational design and digital fabrication in Poland.
                </p>
              </div>
            </div>

            {/* Right: Badges / Trust Info */}
            <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 shrink-0">
              <span className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 ${
                isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-[#4B00F2]" />
                <span>Verified Non-Profit</span>
              </span>
              <span className={`px-3 py-1 rounded-xl text-[10px] font-medium ${
                isLight ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                100% Reinvested in Research
              </span>
            </div>
          </div>
        </div>

        {/* Legal Subfooter */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
          <span>&copy; {new Date().getFullYear()} Fab Foundation Poland (FFP) · All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>Computational Design</span>
            <span>&bull;</span>
            <span>Digital Fabrication</span>
            <span>&bull;</span>
            <span>Open Source CAD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
