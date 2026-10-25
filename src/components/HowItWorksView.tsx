import React from 'react';
import { AppTheme } from '../types/tag';
import { 
  Box, 
  Cpu, 
  Layers, 
  Printer, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  CheckCircle2,
  FileCode,
  Sparkles
} from 'lucide-react';

interface HowItWorksViewProps {
  theme: AppTheme;
  onGoToStudio: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({
  theme,
  onGoToStudio,
}) => {
  const isLight = theme === 'light';

  const steps = [
    {
      step: '01',
      title: 'Parametric 3D CAD Configuration',
      subtitle: 'Real-time millimeter precision',
      desc: 'Type your custom identification text, adjust Helvetica typography sizing (3mm to 100mm), customize corner fillets, edge bevels, mounting holes, and multi-color extrusion relief in our live real-time 3D viewport.',
      icon: Box,
    },
    {
      step: '02',
      title: 'Watertight Slicing & Toolpath Generation',
      subtitle: '100% Solid 2-Manifold Mesh',
      desc: 'Our CSG boolean solid geometry engine calculates exact millimeter volumes, guarantees hole clearances, and outputs a watertight, zero-defect mesh ready for industrial dual-extrusion toolpath generation.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Industrial Dual-Color 3D Printing',
      subtitle: 'Continuous fiber & engineering resins',
      desc: 'Produced using high-speed industrial FDM machines in Carbon Fiber PETG, Matte PLA, or UV-Resistant ASA. The text and base are molecularly bonded together layer-by-layer for zero peeling or separation.',
      icon: Printer,
    },
    {
      step: '04',
      title: 'Caliper QC, Hardware Assembly & Dispatch',
      subtitle: 'Tracked dispatch in 24–48 hours',
      desc: 'Every fabricated unit is hand-inspected with digital vernier calipers (±0.15mm tolerance check), deburred, equipped with your chosen stainless steel wire loop or split ring, and shipped with live GPS tracking.',
      icon: Truck,
    },
  ];

  return (
    <div className="flex-1 w-full overflow-y-auto">
      {/* Hero Header */}
      <section className={`py-12 px-4 sm:px-6 border-b text-center ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
      }`}>
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
            <span>The Fabrication Process</span>
            <span aria-hidden="true">·</span>
            <span>From Browser to Bed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How Fabify 3D Works
          </h1>
          <p className={`text-sm sm:text-base max-w-xl mx-auto ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Bridging procedural browser-based CAD engineering directly with industrial additive fabrication. No minimum orders, zero tooling fees.
          </p>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div 
                key={st.step}
                className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
                  isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-zinc-400/80">
                      {st.step}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-100'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-bold text-lg tracking-tight">{st.title}</h3>
                  <div className="text-xs text-zinc-500 font-medium mt-0.5">{st.subtitle}</div>

                  <p className={`text-xs mt-3 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {st.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Guaranteed industrial quality standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free DIY Maker Download vs Physical Orders Banner */}
        <div className={`p-8 rounded-3xl border text-center space-y-4 ${
          isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
        }`}>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold tracking-tight">Need Only The 3D Model?</h3>
            <p className="text-xs text-zinc-500">
              Own a 3D printer at home or in your workshop? Instant watertight STL export is 100% free and open for makers and hobbyists. Physical print orders include premium materials, hardware, and doorstep tracked shipping.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToStudio}
            className={`py-3 px-6 rounded-2xl font-bold text-xs shadow-md inline-flex items-center gap-2 transition-all active:scale-[0.98] ${
              isLight ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-100 text-zinc-950'
            }`}
          >
            <span>Open 3D Configurator Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
