import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { OrderRecord, CartItem } from '../types/cart';
import { AppTheme } from '../types/tag';
import { exportSTL, getSafeFilename } from '../utils/stlExporter';
import { generateBoxModel } from '../utils/boxGeometry';
import { generateTagModel } from '../utils/tagGeometry';
import { loadHelveticaFont } from '../utils/fontLoader';
import { 
  CheckCircle2, 
  Download, 
  FileCode, 
  X, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderRecord | null;
  theme: AppTheme;
  onGoToDownloads: () => void;
  onGoToStudio: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  order,
  theme,
  onGoToDownloads,
  onGoToStudio,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#18181b', '#6366f1'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const isLight = theme === 'light';

  // Handler to generate and download STL file for an ordered item
  const handleDownloadItemSTL = async (item: CartItem) => {
    try {
      const font = await loadHelveticaFont('bold');
      if (item.productType === 'box' && item.boxConfig) {
        const generated = await generateBoxModel(item.boxConfig, font);
        const slug = (item.customText || 'desk_box').replace(/[^a-zA-Z0-9_-]/g, '_');
        exportSTL(generated.exportGeometry, {
          filename: `Fabify_Box_${slug}.stl`,
          binary: true,
        });
      } else if (item.tagConfig) {
        const generated = await generateTagModel(item.tagConfig, font);
        const slug = (item.customText || 'custom_tag').replace(/[^a-zA-Z0-9_-]/g, '_');
        exportSTL(generated.exportGeometry, {
          filename: `Fabify_Tag_${slug}.stl`,
          binary: true,
        });
      }
    } catch (err) {
      console.error('Failed to trigger digital STL export:', err);
    }
  };

  const handleDownloadLicense = (item: CartItem) => {
    const content = `FABIFY 3D DIGITAL LICENSE CERTIFICATE
======================================
Order ID: ${order.orderId}
License Key: ${order.downloadAccessKey}
Date: ${new Date(order.createdAt).toISOString()}
Licensee: ${order.customer.fullName} (${order.customer.email})

Product: ${item.title}
Product Type: ${item.productType.toUpperCase()}
License Grant: ${item.licenseType === 'commercial' ? 'COMMERCIAL 3D PRINTING LICENSE (Unlimited physical prints permitted for sale)' : 'PERSONAL USE 3D PRINTING LICENSE (Personal non-commercial printing)'}
Watertight 2-Manifold Guarantee: Yes
Software: Fabify 3D Engine
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `License_${order.orderId}_${item.title.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-xl max-h-[94vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Banner */}
        <div className={`p-6 border-b text-center relative ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${isLight ? 'hover:bg-zinc-200 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">Your Digital Files Are Ready!</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Order Reference: <strong className="font-mono text-zinc-900 dark:text-zinc-100">{order.orderId}</strong>
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Delivered to <span className="underline">{order.customer.email}</span> · Saved in My Downloads
          </p>
        </div>

        {/* Digital Files List with Direct Download Actions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Download Your 3D Models (.STL)
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Watertight 2-Manifold Slicer Ready
            </span>
          </div>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.image && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{item.templateName || item.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.licenseType}
                      </span>
                    </div>
                    {item.paramCode && (
                      <div className="mt-0.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-semibold tracking-tight inline-block">
                          CODE: {item.paramCode}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-zinc-500 mt-0.5 font-mono">
                      Text: {item.customText || 'N/A'} · Format: Binary STL
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadItemSTL(item)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 ${
                      isLight ? 'bg-zinc-900 hover:bg-black text-white' : 'bg-white hover:bg-zinc-100 text-zinc-950'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download STL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadLicense(item)}
                    title="Download License Certificate"
                    className={`p-2 rounded-xl border transition-colors ${
                      isLight ? 'hover:bg-zinc-200 border-zinc-300 text-zinc-700' : 'hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Slicer Compatibility Notice */}
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
            isLight ? 'bg-zinc-100/60 border-zinc-200 text-zinc-600' : 'bg-zinc-900/30 border-zinc-800 text-zinc-400'
          }`}>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Slicer Quick Tip</span>
            <p>
              These STL files have zero non-manifold edges. Drag and drop them directly into Bambu Studio, OrcaSlicer, PrusaSlicer, or Cura. Recommended layer height: 0.16mm–0.20mm with 3 perimeters and 15% infill.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-5 border-t shrink-0 grid grid-cols-2 gap-3 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
          <button
            type="button"
            onClick={onGoToDownloads}
            className={`py-3 px-4 rounded-2xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
              isLight
                ? 'border-zinc-300 hover:border-zinc-900 bg-white text-zinc-900'
                : 'border-zinc-700 hover:border-white bg-zinc-950 text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Digital Library</span>
          </button>

          <button
            type="button"
            onClick={onGoToStudio}
            className={`py-3 px-4 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all ${
              isLight ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-100 text-zinc-950'
            }`}
          >
            <span>Back to 3D Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
