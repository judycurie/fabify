import React, { useState } from 'react';
import { OrderRecord, CartItem } from '../types/cart';
import { AppTheme, TagConfig } from '../types/tag';
import { BoxConfig } from '../types/box';
import { getSavedOrders } from '../utils/orders';
import { exportSTL } from '../utils/stlExporter';
import { generateBoxModel } from '../utils/boxGeometry';
import { generateTagModel } from '../utils/tagGeometry';
import { loadHelveticaFont } from '../utils/fontLoader';
import { 
  Download, 
  FileCode, 
  Search, 
  BookOpen, 
  Sliders, 
  Package, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Tag as TagIcon,
  Box as BoxIcon
} from 'lucide-react';

interface MyDownloadsViewProps {
  theme: AppTheme;
  onOpenTagInStudio: (config: TagConfig) => void;
  onOpenBoxInStudio: (config: BoxConfig) => void;
}

export const MyDownloadsView: React.FC<MyDownloadsViewProps> = ({
  theme,
  onOpenTagInStudio,
  onOpenBoxInStudio,
}) => {
  const [orders] = useState<OrderRecord[]>(getSavedOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingItemId, setDownloadingItemId] = useState<string | null>(null);

  const isLight = theme === 'light';

  // Flatten all items across all orders
  const allItems: { item: CartItem; order: OrderRecord }[] = [];
  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      allItems.push({ item, order: ord });
    });
  });

  const filteredItems = allItems.filter(({ item, order }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.customText.toLowerCase().includes(q) ||
      order.orderId.toLowerCase().includes(q)
    );
  });

  const handleDownloadSTL = async (item: CartItem) => {
    setDownloadingItemId(item.id);
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
        const slug = (item.customText || 'tag').replace(/[^a-zA-Z0-9_-]/g, '_');
        exportSTL(generated.exportGeometry, {
          filename: `Fabify_Tag_${slug}.stl`,
          binary: true,
        });
      }
    } catch (e) {
      console.error('Error downloading STL:', e);
    } finally {
      setDownloadingItemId(null);
    }
  };

  const handleDownloadLicense = (item: CartItem, order: OrderRecord) => {
    const text = `FABIFY 3D DIGITAL LICENSE CERTIFICATE
======================================
Order ID: ${order.orderId}
License Key: ${order.downloadAccessKey}
Date: ${new Date(order.createdAt).toISOString()}
Licensee: ${order.customer.fullName} (${order.customer.email})

Product: ${item.title}
Product Type: ${item.productType.toUpperCase()}
License Grant: ${item.licenseType === 'commercial' ? 'COMMERCIAL 3D PRINTING LICENSE (Unlimited physical prints permitted for sale)' : 'PERSONAL USE 3D PRINTING LICENSE'}
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `License_${order.orderId}_${item.title.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto">
      {/* Header */}
      <section className={`py-10 px-4 sm:px-6 border-b text-center ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
      }`}>
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
            <span>Digital Assets & CAD Library</span>
            <span aria-hidden="true">·</span>
            <span>Instant Redownload Anytime</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Digital Library</h1>
          <p className={`text-xs sm:text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Access, redownload, and customize all your purchased CAD models, free templates, and commercial license certificates.
          </p>

          <div className="max-w-md mx-auto pt-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library by title or text..."
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-2xl border font-mono focus:outline-none focus:ring-1 ${
                  isLight ? 'bg-zinc-50 border-zinc-300 focus:border-zinc-900' : 'bg-zinc-900 border-zinc-700 focus:border-white'
                }`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Downloadable Models */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-zinc-400" />
            <h3 className="font-semibold text-base">Your digital library is empty</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Download free community templates or purchase premium CAD models to build your library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map(({ item, order }) => (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition-all hover:shadow-lg ${
                  isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      {item.image ? (
                        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                          <img
                            src={item.image}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`p-2 rounded-xl ${
                          isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
                        }`}>
                          {item.productType === 'box' ? <BoxIcon className="w-4 h-4" /> : <TagIcon className="w-4 h-4" />}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-sm tracking-tight">{item.templateName || item.title}</h3>
                        <span className="text-[11px] text-zinc-500 font-mono">Order {order.orderId}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {item.licenseType}
                    </span>
                  </div>

                  {item.paramCode && (
                    <div className="mb-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-semibold tracking-tight inline-block truncate max-w-full">
                        CODE: {item.paramCode}
                      </span>
                    </div>
                  )}

                  <div className={`p-3 rounded-2xl border text-xs font-mono my-2 ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                  }`}>
                    <div className="text-zinc-500 text-[10px] uppercase">Custom Identifier</div>
                    <div className="font-bold text-sm truncate mt-0.5">{item.customText || 'N/A'}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={downloadingItemId === item.id}
                      onClick={() => handleDownloadSTL(item)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                        isLight ? 'bg-zinc-900 hover:bg-black text-white' : 'bg-white hover:bg-zinc-100 text-zinc-950'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingItemId === item.id ? 'Generating...' : 'Download STL'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadLicense(item, order)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isLight ? 'hover:bg-zinc-100 border-zinc-300 text-zinc-800' : 'hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>License</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (item.productType === 'box' && item.boxConfig) {
                        onOpenBoxInStudio(item.boxConfig);
                      } else if (item.tagConfig) {
                        onOpenTagInStudio(item.tagConfig);
                      }
                    }}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isLight ? 'hover:bg-zinc-100 border-zinc-200 text-zinc-600' : 'hover:bg-zinc-800 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open in 3D Configurator</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
