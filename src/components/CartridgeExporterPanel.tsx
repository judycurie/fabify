import React, { useState } from 'react';
import JSZip from 'jszip';
import { Package, Download, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { AppTheme } from '../types/tag';

import tagSchemaRaw from '../cartridges/parametric-tag/schema.json?raw';
import tagMaterialsRaw from '../cartridges/parametric-tag/materials.json?raw';
import tagPresetsRaw from '../cartridges/parametric-tag/presets.json?raw';
import tagGeometryRaw from '../cartridges/parametric-tag/geometry.js?raw';

import plateSchemaRaw from '../cartridges/architectural-plate/schema.json?raw';
import plateMaterialsRaw from '../cartridges/architectural-plate/materials.json?raw';
import platePresetsRaw from '../cartridges/architectural-plate/presets.json?raw';
import plateGeometryRaw from '../cartridges/architectural-plate/geometry.js?raw';

import boxSchemaRaw from '../cartridges/desk-organizer-box/schema.json?raw';
import boxMaterialsRaw from '../cartridges/desk-organizer-box/materials.json?raw';
import boxPresetsRaw from '../cartridges/desk-organizer-box/presets.json?raw';
import boxGeometryRaw from '../cartridges/desk-organizer-box/geometry.js?raw';

interface CartridgeDefinition {
  productSlug: string;
  displayName: string;
  schema: string;
  materials: string;
  presets: string;
  geometry: string;
}

const PRODUCT_CARTRIDGES: CartridgeDefinition[] = [
  {
    productSlug: 'parametric-tag',
    displayName: 'Parametric Tag & Keyring',
    schema: tagSchemaRaw,
    materials: tagMaterialsRaw,
    presets: tagPresetsRaw,
    geometry: tagGeometryRaw,
  },
  {
    productSlug: 'architectural-plate',
    displayName: 'Architectural Plates & Signs',
    schema: plateSchemaRaw,
    materials: plateMaterialsRaw,
    presets: platePresetsRaw,
    geometry: plateGeometryRaw,
  },
  {
    productSlug: 'desk-organizer-box',
    displayName: 'Desk Organizer & Tray',
    schema: boxSchemaRaw,
    materials: boxMaterialsRaw,
    presets: boxPresetsRaw,
    geometry: boxGeometryRaw,
  },
];

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface CartridgeExporterPanelProps {
  theme: AppTheme;
}

export const CartridgeExporterPanel: React.FC<CartridgeExporterPanelProps> = ({ theme }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [lastDoneSlug, setLastDoneSlug] = useState<string | null>(null);

  const isLight = theme === 'light';

  const handleExportSingle = async (cartridge: CartridgeDefinition) => {
    setBusySlug(cartridge.productSlug);
    try {
      const zip = new JSZip();
      zip.file('schema.json', cartridge.schema);
      zip.file('materials.json', cartridge.materials);
      zip.file('presets.json', cartridge.presets);
      zip.file('geometry.js', cartridge.geometry);
      const blob = await zip.generateAsync({ type: 'blob' });
      triggerBlobDownload(blob, `${cartridge.productSlug}_cartridge.zip`);
      setLastDoneSlug(cartridge.productSlug);
      setTimeout(() => setLastDoneSlug((cur) => (cur === cartridge.productSlug ? null : cur)), 2000);
    } finally {
      setBusySlug(null);
    }
  };

  const handleExportAll = async () => {
    setBusySlug('__all__');
    try {
      const rootZip = new JSZip();
      for (const cartridge of PRODUCT_CARTRIDGES) {
        const folder = rootZip.folder(cartridge.productSlug);
        if (folder) {
          folder.file('schema.json', cartridge.schema);
          folder.file('materials.json', cartridge.materials);
          folder.file('presets.json', cartridge.presets);
          folder.file('geometry.js', cartridge.geometry);
        }
      }
      const blob = await rootZip.generateAsync({ type: 'blob' });
      triggerBlobDownload(blob, 'fabify_all_product_cartridges.zip');
      setLastDoneSlug('__all__');
      setTimeout(() => setLastDoneSlug((cur) => (cur === '__all__' ? null : cur)), 2000);
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div
      className={`fixed bottom-14 left-3 z-40 w-[264px] rounded-2xl border shadow-2xl backdrop-blur-xl transition-all pointer-events-auto ${
        isLight
          ? 'bg-white/95 border-zinc-300 text-zinc-950 shadow-zinc-400/30'
          : 'bg-zinc-900/95 border-zinc-700 text-zinc-100 shadow-black/70'
      }`}
    >
      <div
        className={`px-3 py-2 flex items-center justify-between border-b ${
          isLight ? 'border-zinc-200' : 'border-zinc-800'
        } ${isCollapsed ? 'border-b-0' : ''}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Package className="w-3.5 h-3.5 text-[#4B00F2] shrink-0" />
          <span className="text-[11px] font-bold tracking-tight truncate">
            Export All Product Cartridges
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={`p-1 rounded-lg transition-colors ${
            isLight ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-zinc-800 text-zinc-300'
          }`}
          aria-label={isCollapsed ? 'Expand cartridge panel' : 'Collapse cartridge panel'}
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-2.5 space-y-1.5">
          {PRODUCT_CARTRIDGES.map((c) => {
            const isBusy = busySlug === c.productSlug;
            const isDone = lastDoneSlug === c.productSlug;
            return (
              <button
                key={c.productSlug}
                type="button"
                disabled={busySlug !== null}
                onClick={() => handleExportSingle(c)}
                className={`w-full px-2.5 py-1.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 text-[11px] font-semibold cursor-pointer active:scale-[0.99] disabled:opacity-60 ${
                  isLight
                    ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-900'
                    : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 text-zinc-100'
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate font-bold">{c.productSlug}</div>
                  <div className="text-[9.5px] opacity-70 truncate">{c.displayName}</div>
                </div>
                <span className="shrink-0 flex items-center gap-1 font-mono text-[10px] text-[#4B00F2] dark:text-[#A788FF]">
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Download className={`w-3.5 h-3.5 ${isBusy ? 'animate-pulse' : ''}`} />
                  )}
                  <span>.zip</span>
                </span>
              </button>
            );
          })}

          <button
            type="button"
            disabled={busySlug !== null}
            onClick={handleExportAll}
            className="w-full mt-1 py-2 px-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 bg-[#4B00F2] hover:bg-[#3D00C6] text-white transition-all cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {lastDoneSlug === '__all__' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{busySlug === '__all__' ? 'Bundling...' : 'Export All (.zip)'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
