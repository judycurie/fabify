import React from 'react';
import { AppTheme } from '../types/tag';
import { ExternalLink, Heart, Sparkles, ShieldCheck, Box, Download, Layers } from 'lucide-react';

interface FooterProps {
  theme: AppTheme;
  onNavigate?: (page: 'studio' | 'catalog' | 'configurators' | 'downloads') => void;
}

export const Footer: React.FC<FooterProps> = ({ theme, onNavigate }) => {
  const isLight = theme === 'light';

  return (
    <footer 
      className={`relative w-full border-t transition-colors duration-200 mt-auto overflow-hidden ${
        isLight 
          ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
          : 'bg-zinc-950 border-zinc-850 text-zinc-100'
      }`}
    >
      {/* Subtle FFP Wireframe Backdrop Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08] bg-center bg-cover"
        style={{ backgroundImage: `url('/assets/aistudio/ffp-background1_cdc406b4.jpg')` }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-10">
        {/* Prominent Impact Card: "Making a difference" */}
        <div 
          className={`p-6 sm:p-8 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
            isLight 
              ? 'bg-white border-[#B4BDFA]/70 shadow-[#B4BDFA]/20' 
              : 'bg-zinc-900/80 border-[#6F7AF7]/30 shadow-black'
          }`}
        >
          {/* Subtle gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4B00F2] via-[#6F7AF7] to-[#F26C65]" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F26C65]/10 text-[#F26C65] border border-[#F26C65]/20">
                <Heart className="w-3.5 h-3.5 fill-[#F26C65]" />
                <span>Making a difference</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                100% Non-Profit Computational Design & Open Digital Fabrication
              </h3>

              <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                <strong>Making a difference:</strong> Entire profit made on your purchase goes to{' '}
                <a 
                  href="https://fabfoundation.pl/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold underline text-[#4B00F2] hover:text-[#6F7AF7] dark:text-[#B4BDFA] dark:hover:text-white transition-colors"
                >
                  Fab Foundation Poland
                </a>
                , a non-profit organization dedicated to making things smartly and aspiring to establish- a first research unit dedicated to computational design and digital fabrication in Poland.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <a
                href="https://fabfoundation.pl/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-bold text-xs shadow-indigo-glow bg-[#4B00F2] hover:brightness-110 text-white flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Visit fabfoundation.pl</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
          {/* Brand Identity & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl p-1.5 border flex items-center justify-center shrink-0 ${
                isLight ? 'bg-white border-zinc-200 shadow-xs' : 'bg-zinc-900 border-zinc-850'
              }`}>
                <img
                  src={isLight ? '/assets/aistudio/FFP-logo-black_d022db98.png' : '/assets/aistudio/FFP-logo-white_b6285314.png'}
                  alt="Fab Foundation Poland Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-black text-sm tracking-tight uppercase block">
                  FABIFY <span className="font-normal text-xs text-zinc-500">— Parametric CAD</span>
                </span>
                <span className="text-[11px] text-[#4B00F2] dark:text-[#B4BDFA] font-medium">
                  powered by Fab Foundation Poland
                </span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed max-w-md ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              An open digital fabrication platform providing real-time in-browser parametric solid CAD engines, watertight 2-manifold STL exports, and open-source 3D printable designs for makers, architects, and designers worldwide.
            </p>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-[#4B00F2]" />
                <span>Free Community STLs</span>
              </div>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <div className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-[#F26C65]" />
                <span>Commercial CAD Licenses</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('studio')}
                  className="hover:text-[#4B00F2] dark:hover:text-[#B4BDFA] transition-colors"
                >
                  3D Studio (Tags & Organizers)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('catalog')}
                  className="hover:text-[#4B00F2] dark:hover:text-[#B4BDFA] transition-colors"
                >
                  CAD Catalog & Templates
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('configurators')}
                  className="hover:text-[#4B00F2] dark:hover:text-[#B4BDFA] transition-colors"
                >
                  Configurators Directory & Embed
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('downloads')}
                  className="hover:text-[#4B00F2] dark:hover:text-[#B4BDFA] transition-colors"
                >
                  My Downloads & Digital Library
                </button>
              </li>
            </ul>
          </div>

          {/* Foundation & Research Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Foundation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://fabfoundation.pl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#4B00F2] dark:hover:text-[#B4BDFA] transition-colors"
                >
                  <span>Fab Foundation Poland</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <span className="text-zinc-500">Computational Design Unit</span>
              </li>
              <li>
                <span className="text-zinc-500">Digital Fabrication Labs</span>
              </li>
              <li>
                <span className="text-zinc-500">Non-Profit Foundation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Hairline & Legal */}
        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] ${
          isLight ? 'border-zinc-200 text-zinc-500' : 'border-zinc-850 text-zinc-500'
        }`}>
          <div>
            © {new Date().getFullYear()} Fab Foundation Poland. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by Fab Foundation Poland</span>
            <span aria-hidden="true">·</span>
            <span>Watertight Slicer-Ready STLs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
