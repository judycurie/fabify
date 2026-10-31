import React from 'react';
import { MODEL_TIERS, ModelTierId } from '../types/tiers';
import { AppTheme } from '../types/tag';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  FileCode, 
  Sliders, 
  CheckCircle2, 
  Crown, 
  Download,
  Zap
} from 'lucide-react';

interface ModelTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  selectedTier?: ModelTierId;
  onSelectTier?: (tierId: ModelTierId) => void;
}

export const ModelTiersModal: React.FC<ModelTiersModalProps> = ({
  isOpen,
  onClose,
  theme,
  selectedTier = 'tier1_static',
  onSelectTier,
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  const tiersList = [
    MODEL_TIERS.free,
    MODEL_TIERS.tier1_static,
    MODEL_TIERS.tier2_subscription,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4B00F2] to-[#F26C65] text-white flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg tracking-tight">CAD Licensing & Model Tiers</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] border border-[#4B00F2]/20">
                  Fab Foundation Poland
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Transparent access scopes, commercial rights, and monetization guidelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-2 rounded-xl transition-colors ${
              isLight ? 'hover:bg-zinc-200 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Responsive Comparison Matrix */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Detailed Cards for Mobile / Small Screens & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TIER 1 CARD */}
            <div
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                selectedTier === 'tier1_static'
                  ? 'border-[#F26C65] ring-2 ring-[#F26C65]/30'
                  : isLight
                  ? 'border-zinc-200 bg-zinc-50/50'
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#F26C65]/10 text-[#F26C65] border border-[#F26C65]/30">
                      Tier 1 · Commercial
                    </span>
                    <h3 className="font-bold text-base mt-1.5">Static Asset Commercial License</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-[#F26C65]">$15.00</span>
                    <span className="block text-[10px] text-zinc-400 uppercase font-mono">one-off export</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <strong className="text-[11px] uppercase tracking-wider text-zinc-500 block">Access Scope</strong>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                      Single exported file (STL/STEP/OBJ/DXF) generated during that session.
                    </p>
                  </div>

                  <div>
                    <strong className="text-[11px] uppercase tracking-wider text-zinc-500 block">Best For</strong>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Makers/sellers who want to manufacture and sell physical units of one specific design variation.
                    </p>
                  </div>

                  <div>
                    <strong className="text-[11px] uppercase tracking-wider text-zinc-500 block">Typical Monetization</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                      One-off fee per design / file export (e.g., $15 per design variant).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTier?.('tier1_static');
                    onClose();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    selectedTier === 'tier1_static'
                      ? 'bg-[#F26C65] hover:bg-[#e05a53] text-white'
                      : isLight
                      ? 'bg-zinc-900 hover:bg-black text-white'
                      : 'bg-white hover:bg-zinc-100 text-zinc-950'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>Choose Tier 1 ($15 One-Off)</span>
                </button>
              </div>
            </div>

            {/* TIER 2 CARD */}
            <div
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                selectedTier === 'tier2_subscription'
                  ? 'border-[#4B00F2] ring-2 ring-[#4B00F2]/30'
                  : isLight
                  ? 'border-zinc-200 bg-zinc-50/50'
                  : 'border-zinc-900 bg-zinc-900/40'
              }`}
            >
              <div className="absolute top-0 right-0 px-3 py-0.5 bg-gradient-to-l from-[#4B00F2] to-[#855BFF] text-white text-[9px] font-bold uppercase rounded-bl-xl tracking-wider">
                Recommended for Shops
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] border border-[#4B00F2]/30">
                      Tier 2 · Subscription
                    </span>
                    <h3 className="font-bold text-base mt-1.5">Commercial Subscription / Tool Access</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-[#4B00F2] dark:text-[#855BFF]">$25.00</span>
                    <span className="block text-[10px] text-zinc-400 uppercase font-mono">per month</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <strong className="text-[11px] uppercase tracking-wider text-zinc-500 block">Access Scope</strong>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                      Continuous access to the live configurator, batch exporting, and seed tweaking.
                    </p>
                  </div>

                  <div>
                    <strong className="text-[11px] uppercase tracking-wider text-zinc-500 block">Best For</strong>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Active commercial shops, Print-on-Demand (POD) businesses, and custom-order fabricators.
                    </p>
                  </div>

                  <div>
                    <strong className="text-[11px] uppercase tracking-wider text-zinc-500 block">Typical Monetization</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                      Recurring monthly/annual subscription (e.g., Maker tier at $25/month).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTier?.('tier2_subscription');
                    onClose();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md text-white bg-[#4B00F2] hover:bg-[#3d00c7]`}
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Activate Maker Access ($25/mo)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Master Table View */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`${isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-300'} font-bold`}>
                  <th className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 w-1/5">Model Tier</th>
                  <th className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 w-1/4">Access Scope</th>
                  <th className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 w-1/4">Best For</th>
                  <th className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 w-1/4">Typical Monetization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-normal">
                {/* Free Tier */}
                <tr className={isLight ? 'hover:bg-zinc-50' : 'hover:bg-zinc-900/50'}>
                  <td className="p-3.5 align-top">
                    <span className="font-bold block text-zinc-900 dark:text-zinc-100">Free Community</span>
                    <span className="text-[10px] font-mono font-bold text-[#4B00F2]">$0.00</span>
                  </td>
                  <td className="p-3.5 align-top text-zinc-600 dark:text-zinc-400">
                    Single watertight binary STL generated for personal 3D printing.
                  </td>
                  <td className="p-3.5 align-top text-zinc-600 dark:text-zinc-400">
                    Hobbyists and students making personal items.
                  </td>
                  <td className="p-3.5 align-top text-zinc-500 font-mono text-[11px]">
                    Free download with login verification.
                  </td>
                </tr>

                {/* Tier 1 */}
                <tr className={`${isLight ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'bg-amber-950/10 hover:bg-amber-950/20'}`}>
                  <td className="p-3.5 align-top">
                    <span className="font-bold block text-[#F26C65]">Tier 1: Static Asset Commercial License</span>
                    <span className="text-[10px] font-mono font-bold text-[#F26C65]">$15.00 one-off</span>
                  </td>
                  <td className="p-3.5 align-top font-medium text-zinc-800 dark:text-zinc-200">
                    Single exported file (STL/STEP/OBJ/DXF) generated during that session.
                  </td>
                  <td className="p-3.5 align-top text-zinc-600 dark:text-zinc-400">
                    Makers/sellers who want to manufacture and sell physical units of one specific design variation.
                  </td>
                  <td className="p-3.5 align-top text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                    One-off fee per design / file export (e.g., $15 per design variant).
                  </td>
                </tr>

                {/* Tier 2 */}
                <tr className={`${isLight ? 'bg-purple-50/20 hover:bg-purple-50/40' : 'bg-purple-950/10 hover:bg-purple-950/20'}`}>
                  <td className="p-3.5 align-top">
                    <span className="font-bold block text-[#4B00F2] dark:text-[#855BFF]">
                      Tier 2: Commercial Subscription / Tool Access
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#4B00F2] dark:text-[#855BFF]">
                      $25.00 / month
                    </span>
                  </td>
                  <td className="p-3.5 align-top font-medium text-zinc-800 dark:text-zinc-200">
                    Continuous access to the live configurator, batch exporting, and seed tweaking.
                  </td>
                  <td className="p-3.5 align-top text-zinc-600 dark:text-zinc-400">
                    Active commercial shops, Print-on-Demand (POD) businesses, and custom-order fabricators.
                  </td>
                  <td className="p-3.5 align-top text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                    Recurring monthly/annual subscription (e.g., Maker tier at $25/month).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Guarantee Footer */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
            isLight ? 'bg-zinc-100/70 border-zinc-200 text-zinc-600' : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
          }`}>
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>
              All CAD models exported through Fabify are guaranteed watertight 2-manifold solids, verified for physical manufacturing by Fab Foundation Poland.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className={`p-4 border-t flex items-center justify-between shrink-0 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
          <span className="text-xs text-zinc-400">
            Select tier to configure licenses in cart
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isLight ? 'border-zinc-300 hover:bg-zinc-200' : 'border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
