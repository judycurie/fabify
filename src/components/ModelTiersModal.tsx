import React from 'react';
import { MODEL_TIERS, ModelTierId } from '../types/tiers';
import { AppTheme } from '../types/tag';
import { 
  X, 
  Check, 
  ShieldCheck, 
  FileCode, 
  Crown, 
  Download,
  Zap,
  Clock,
  Sparkles
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div className={`px-5 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md font-bold">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg tracking-tight">CAD Licensing & Model Tiers</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                  Fab Foundation Poland
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Transparent access scopes, commercial rights, and monetization guidelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-2 rounded-xl transition-colors ${
              isLight ? 'hover:bg-zinc-200 text-zinc-600' : 'hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Responsive Comparison Matrix */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Notice */}
          <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-700' : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
          }`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4B00F2] shrink-0" />
              <span>
                <strong>No recurring subscriptions:</strong> The $25 configurator access is a one-time 30-day pass with no automatic renewal.
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap hidden sm:inline-block">
              100% NON-RECURRING
            </span>
          </div>

          {/* Detailed Cards for 2 Commercial Tiers + Free Community */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* FREE COMMUNITY CARD */}
            <div
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isLight ? 'border-zinc-200 bg-zinc-50/70' : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                      Free Community
                    </span>
                    <h3 className="font-bold text-sm sm:text-base mt-1.5">Free STL Download</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-[#4B00F2] dark:text-[#855BFF]">$0.00</span>
                    <span className="block text-[10px] text-zinc-400 uppercase font-mono">Personal use</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <strong className="text-[10.5px] uppercase tracking-wider text-zinc-500 block">What is Included</strong>
                    <ul className="text-zinc-700 dark:text-zinc-300 space-y-1 mt-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                        <span>Watertight binary STL file export</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                        <span>Instant download & dispatch to login email</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                        <span>Standard parametric typography</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-[10.5px] uppercase tracking-wider text-zinc-500 block">Dedicated For</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      Hobbyists, students, and makers fabricating personal 3D prints for non-commercial home or school use.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTier?.('free');
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-white bg-[#4B00F2] hover:bg-[#3d00c7]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Free STL (Personal)</span>
                </button>
              </div>
            </div>

            {/* TIER 1 CARD: $5 STATIC MODEL */}
            <div
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                selectedTier === 'tier1_static'
                  ? 'border-[#F26C65] ring-2 ring-[#F26C65]/30'
                  : isLight
                  ? 'border-zinc-200 bg-zinc-50/70'
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#F26C65]/10 text-[#F26C65] border border-[#F26C65]/30">
                      Tier 1 · Commercial
                    </span>
                    <h3 className="font-bold text-sm sm:text-base mt-1.5">Static Model License</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-[#F26C65]">$5.00</span>
                    <span className="block text-[10px] text-zinc-400 uppercase font-mono">one-off / design</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <strong className="text-[10.5px] uppercase tracking-wider text-zinc-500 block">What is Included</strong>
                    <ul className="text-zinc-700 dark:text-zinc-300 space-y-1 mt-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#F26C65] shrink-0" />
                        <span>Watertight STL + STEP CAD + DXF</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#F26C65] shrink-0" />
                        <span>Dual-color multi-part export files</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#F26C65] shrink-0" />
                        <span>Full commercial manufacturing & sales rights</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#F26C65] shrink-0" />
                        <span>Commercial license certificate to email</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-[10.5px] uppercase tracking-wider text-zinc-500 block">Dedicated For</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      Makers and sellers on Etsy or local craft shops who want to manufacture and sell physical products of one specific custom design variation.
                    </p>
                  </div>

                  <div>
                    <strong className="text-[10.5px] uppercase tracking-wider text-zinc-500 block">Typical Monetization</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                      One-off fee of $5 per design variant.
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
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm text-white bg-[#F26C65] hover:bg-[#d9554e]"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Choose Tier 1 ($5 One-Off)</span>
                </button>
              </div>
            </div>

            {/* TIER 2 CARD: $25 1-MONTH TOOL ACCESS (NO SUBSCRIPTION) */}
            <div
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                selectedTier === 'tier2_subscription'
                  ? 'border-[#4B00F2] ring-2 ring-[#4B00F2]/30'
                  : isLight
                  ? 'border-zinc-200 bg-zinc-50/70'
                  : 'border-zinc-900 bg-zinc-900/40'
              }`}
            >
              <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-[8.5px] font-bold uppercase rounded-bl-xl tracking-wider">
                1-Month Tool Access
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#4B00F2]/10 text-[#4B00F2] dark:text-[#855BFF] border border-[#4B00F2]/30">
                      Tier 2 · 1-Month Pass
                    </span>
                    <h3 className="font-bold text-sm sm:text-base mt-1.5">Configurator Tool Access</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-[#4B00F2] dark:text-[#855BFF]">$25.00</span>
                    <span className="block text-[10px] text-zinc-400 uppercase font-mono">works for month</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <strong className="text-[10.5px] uppercase tracking-wider text-zinc-500 block">What is Included</strong>
                    <ul className="text-zinc-700 dark:text-zinc-300 space-y-1 mt-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] dark:text-[#855BFF] shrink-0" />
                        <span>30-day live access to all configurators</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] dark:text-[#855BFF] shrink-0" />
                        <span><strong>No subscription:</strong> Payment works for month</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] dark:text-[#855BFF] shrink-0" />
                        <span>Unlimited batch exports (STL, STEP, Multi-Part)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] dark:text-[#855BFF] shrink-0" />
                        <span>Commercial rights on all generated variants</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-[10.5px] uppercase tracking-wider text-zinc-500 block">Dedicated For</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      Active commercial shops, Print-on-Demand (POD) businesses, custom fabrication studios, and high-volume makers needing live seed tweaking and continuous batch generation.
                    </p>
                  </div>

                  <div>
                    <strong className="text-[10.5px] uppercase tracking-wider text-zinc-500 block">Typical Monetization</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                      One-off $25 payment works for the month (no recurring lock-in).
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
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md text-white bg-[#4B00F2] hover:bg-[#3d00c7]"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Get 1-Month Access ($25)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Master Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`${isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-300'} font-bold`}>
                  <th className="p-3 border-b border-zinc-200 dark:border-zinc-800 w-1/5">Model Tier</th>
                  <th className="p-3 border-b border-zinc-200 dark:border-zinc-800 w-1/4">What is Included</th>
                  <th className="p-3 border-b border-zinc-200 dark:border-zinc-800 w-1/4">Dedicated For / Best For</th>
                  <th className="p-3 border-b border-zinc-200 dark:border-zinc-800 w-1/4">Monetization & Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-normal">
                {/* Free Tier */}
                <tr className={isLight ? 'hover:bg-zinc-50' : 'hover:bg-zinc-900/50'}>
                  <td className="p-3 align-top">
                    <span className="font-bold block text-zinc-900 dark:text-zinc-100">Free Community</span>
                    <span className="text-[10px] font-mono font-bold text-[#4B00F2] dark:text-[#855BFF]">$0.00</span>
                  </td>
                  <td className="p-3 align-top text-zinc-600 dark:text-zinc-400">
                    Single watertight binary STL generated for personal 3D printing.
                  </td>
                  <td className="p-3 align-top text-zinc-600 dark:text-zinc-400">
                    Hobbyists, students, and personal DIY makers.
                  </td>
                  <td className="p-3 align-top text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                    Free instant download with email dispatch.
                  </td>
                </tr>

                {/* Tier 1 */}
                <tr className={isLight ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'bg-amber-950/10 hover:bg-amber-950/20'}>
                  <td className="p-3 align-top">
                    <span className="font-bold block text-[#F26C65]">Tier 1: Static Model Commercial License</span>
                    <span className="text-[10px] font-mono font-bold text-[#F26C65]">$5.00 one-off</span>
                  </td>
                  <td className="p-3 align-top font-medium text-zinc-800 dark:text-zinc-200">
                    Single exported production solid (STL + STEP CAD + DXF) + multi-part STLs + full physical selling rights.
                  </td>
                  <td className="p-3 align-top text-zinc-600 dark:text-zinc-400">
                    Makers and Etsy sellers manufacturing and selling physical units of one specific design variation.
                  </td>
                  <td className="p-3 align-top text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                    One-off fee of $5 per design variant (no recurring fees).
                  </td>
                </tr>

                {/* Tier 2 */}
                <tr className={isLight ? 'bg-purple-50/20 hover:bg-purple-50/40' : 'bg-purple-950/10 hover:bg-purple-950/20'}>
                  <td className="p-3 align-top">
                    <span className="font-bold block text-[#4B00F2] dark:text-[#855BFF]">
                      Tier 2: 1-Month Configurator Tool Access
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#4B00F2] dark:text-[#855BFF]">
                      $25.00 (1-Month Pass)
                    </span>
                  </td>
                  <td className="p-3 align-top font-medium text-zinc-800 dark:text-zinc-200">
                    Continuous access to live configurator, unlimited batch exports, and seed tweaking for 30 days.
                  </td>
                  <td className="p-3 align-top text-zinc-600 dark:text-zinc-400">
                    Active commercial shops, Print-on-Demand (POD) businesses, and custom-order fabricators.
                  </td>
                  <td className="p-3 align-top text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                    Payment of $25 works for the month, no need of subscription.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Guarantee Footer */}
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs ${
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
            Select tier to configure licenses in cart or studio
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isLight ? 'border-zinc-300 hover:bg-zinc-200 text-zinc-800' : 'border-zinc-700 hover:bg-zinc-800 text-zinc-200'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
