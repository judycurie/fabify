/**
 * Ergonomic Control Dock for Desk Organizer & Box Configurator
 * Features:
 * - Persistent navigation tabs (Dimensions, Compartments, Structure, Label, Export/License)
 * - Tactile steppers (- / +) for single-tap millimeter precision
 * - Instant binary STL export & digital license checkout
 */

import React from 'react';
import { BoxConfig, BoxDimensions } from '../types/box';
import { AppTheme } from '../types/tag';
import { 
  Box, 
  Grid3X3, 
  Layers, 
  Type, 
  Download, 
  X, 
  Minus, 
  Plus, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  ShoppingBag,
  FileCode,
  Sliders
} from 'lucide-react';

export type BoxActiveTab = 'dimensions' | 'grid' | 'structure' | 'label' | 'export' | null;

interface BoxControlDockProps {
  config: BoxConfig;
  dimensions: BoxDimensions | null;
  theme: AppTheme;
  activeTab: BoxActiveTab;
  onSelectTab: (tab: BoxActiveTab) => void;
  onChange: (partial: Partial<BoxConfig>) => void;
  onExportSTL: (binary: boolean) => void;
  onOpenLicenseModal?: () => void;
}

const BOX_COLORS = [
  { name: 'Jet Black', value: '#09090b' },
  { name: 'Matte Carbon', value: '#18181b' },
  { name: 'Dark Slate', value: '#27272a' },
  { name: 'Mid Grey', value: '#52525b' },
  { name: 'Light Silver', value: '#d4d4d8' },
  { name: 'Warm Terracotta', value: '#c2410c' },
  { name: 'Forest Green', value: '#15803d' },
  { name: 'Pure White', value: '#ffffff' },
];

export const BoxControlDock: React.FC<BoxControlDockProps> = ({
  config,
  dimensions,
  theme,
  activeTab,
  onSelectTab,
  onChange,
  onExportSTL,
  onOpenLicenseModal,
}) => {
  const isLight = theme === 'light';
  const isSheetOpen = activeTab !== null;

  const stepValue = (
    key: keyof BoxConfig,
    currentVal: number,
    delta: number,
    minVal: number,
    maxVal: number,
    precision: number = 1
  ) => {
    const next = Math.max(minVal, Math.min(maxVal, currentVal + delta));
    const factor = Math.pow(10, precision);
    const rounded = Math.round(next * factor) / factor;
    onChange({ [key]: rounded });
  };

  return (
    <>
      {/* Backdrop */}
      {isSheetOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200"
          onClick={() => onSelectTab(null)}
        />
      )}

      {/* Slide-Up Drawer */}
      <div
        className={`fixed left-0 right-0 z-20 transition-all duration-300 ease-out flex flex-col ${
          isSheetOpen
            ? 'bottom-16 sm:bottom-14 max-h-[72vh] sm:max-h-[60vh] opacity-100 translate-y-0'
            : 'bottom-0 max-h-0 opacity-0 pointer-events-none translate-y-6'
        }`}
      >
        <div
          className={`max-w-2xl w-full mx-auto rounded-t-3xl border-t border-x shadow-2xl flex flex-col overflow-hidden ${
            isLight
              ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-400/20'
              : 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-black/80'
          } backdrop-blur-xl`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3.5 pb-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                Desk Organizer Engine · {activeTab}
              </span>
            </div>
            <button
              onClick={() => onSelectTab(null)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* 1. DIMENSIONS TAB */}
            {activeTab === 'dimensions' && (
              <div className="space-y-4">
                {/* Width (X) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Width (X Axis)</span>
                    <span className="font-mono font-bold">{config.width} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepValue('width', config.width, -5, 40, 280, 0)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={40}
                      max={280}
                      step={5}
                      value={config.width}
                      onChange={(e) => onChange({ width: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      onClick={() => stepValue('width', config.width, 5, 40, 280, 0)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Depth (Y) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Depth (Y Axis)</span>
                    <span className="font-mono font-bold">{config.depth} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepValue('depth', config.depth, -5, 40, 220, 0)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={40}
                      max={220}
                      step={5}
                      value={config.depth}
                      onChange={(e) => onChange({ depth: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      onClick={() => stepValue('depth', config.depth, 5, 40, 220, 0)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Height (Z) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Height (Z Axis)</span>
                    <span className="font-mono font-bold">{config.height} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepValue('height', config.height, -2, 18, 120, 0)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={18}
                      max={120}
                      step={2}
                      value={config.height}
                      onChange={(e) => onChange({ height: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      onClick={() => stepValue('height', config.height, 2, 18, 120, 0)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Corner Fillet Radius */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Outer Corner Radius</span>
                    <span className="font-mono font-bold">{config.filletRadius} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepValue('filletRadius', config.filletRadius, -0.5, 0, 16, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={16}
                      step={0.5}
                      value={config.filletRadius}
                      onChange={(e) => onChange({ filletRadius: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      onClick={() => stepValue('filletRadius', config.filletRadius, 0.5, 0, 16, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. GRID COMPARTMENTS TAB */}
            {activeTab === 'grid' && (
              <div className="space-y-4">
                {/* Columns & Rows Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Columns (X)</span>
                      <span className="font-mono">{config.gridColumns}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((col) => (
                        <button
                          key={col}
                          onClick={() => onChange({ gridColumns: col })}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            config.gridColumns === col
                              ? isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                              : isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Rows (Y)</span>
                      <span className="font-mono">{config.gridRows}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map((row) => (
                        <button
                          key={row}
                          onClick={() => onChange({ gridRows: row })}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            config.gridRows === row
                              ? isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                              : isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {row}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pocket Dimension Live Telemetry */}
                {dimensions && (
                  <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                  }`}>
                    <span className="text-zinc-500">Each Pocket Size:</span>
                    <span className="font-mono font-bold">
                      {dimensions.compartmentWidth} × {dimensions.compartmentDepth} × {dimensions.compartmentHeight} mm
                    </span>
                  </div>
                )}

                {/* Divider Thickness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Divider Wall Thickness</span>
                    <span className="font-mono font-bold">{config.dividerThickness} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepValue('dividerThickness', config.dividerThickness, -0.2, 1.2, 4.0, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={1.2}
                      max={4.0}
                      step={0.2}
                      value={config.dividerThickness}
                      onChange={(e) => onChange({ dividerThickness: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      onClick={() => stepValue('dividerThickness', config.dividerThickness, 0.2, 1.2, 4.0, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Finger Scoop Toggle */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                }`}>
                  <div>
                    <span className="font-bold text-xs block">Ergonomic Finger Scoop</span>
                    <span className="text-[11px] text-zinc-500 block">
                      Curved front pocket edge to easily slide out coins, washers & SD cards
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ hasScoop: !config.hasScoop })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      config.hasScoop ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      config.hasScoop ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* 3. STRUCTURE & WALLS TAB */}
            {activeTab === 'structure' && (
              <div className="space-y-4">
                {/* Wall Thickness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Outer Wall Shell Thickness</span>
                    <span className="font-mono font-bold">{config.wallThickness} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepValue('wallThickness', config.wallThickness, -0.2, 1.4, 5.0, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={1.4}
                      max={5.0}
                      step={0.2}
                      value={config.wallThickness}
                      onChange={(e) => onChange({ wallThickness: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      onClick={() => stepValue('wallThickness', config.wallThickness, 0.2, 1.4, 5.0, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Floor Thickness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Bottom Floor Thickness</span>
                    <span className="font-mono font-bold">{config.floorThickness} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepValue('floorThickness', config.floorThickness, -0.2, 1.4, 6.0, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={1.4}
                      max={6.0}
                      step={0.2}
                      value={config.floorThickness}
                      onChange={(e) => onChange({ floorThickness: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      onClick={() => stepValue('floorThickness', config.floorThickness, 0.2, 1.4, 6.0, 1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stacking Lip Toggle */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                }`}>
                  <div>
                    <span className="font-bold text-xs block">Modular Stacking Lip</span>
                    <span className="text-[11px] text-zinc-500 block">
                      Stepped top edge for stacking multiple units securely
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ hasStackingLip: !config.hasStackingLip })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      config.hasStackingLip ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      config.hasStackingLip ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* 4. FRONT LABEL & COLOR TAB */}
            {activeTab === 'label' && (
              <div className="space-y-4">
                {/* Front Label Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs">Front Face Text</label>
                    <button
                      type="button"
                      onClick={() => onChange({ hasLabel: !config.hasLabel })}
                      className="text-xs text-zinc-500 underline"
                    >
                      {config.hasLabel ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={config.labelText}
                    onChange={(e) => onChange({ labelText: e.target.value.toUpperCase() })}
                    placeholder="ORGANIZER, TOOLS, EDC..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs uppercase focus:outline-none focus:ring-1 ${
                      isLight ? 'bg-white border-zinc-300 focus:border-zinc-900' : 'bg-zinc-950 border-zinc-700 focus:border-white'
                    }`}
                  />
                </div>

                {/* Label Style: Embossed vs Debossed */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ labelStyle: 'embossed' })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      config.labelStyle === 'embossed'
                        ? isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                        : isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    Embossed (Raised)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ labelStyle: 'debossed' })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      config.labelStyle === 'debossed'
                        ? isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                        : isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    Debossed (Recessed)
                  </button>
                </div>

                {/* Color Swatches */}
                <div className="space-y-2 pt-2">
                  <label className="font-bold text-xs block">Box Finish Color</label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {BOX_COLORS.map((col) => {
                      const isSel = config.primaryColor === col.value;
                      return (
                        <button
                          key={col.value}
                          onClick={() => onChange({ primaryColor: col.value })}
                          title={col.name}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            isSel ? 'ring-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.value, borderColor: '#71717a' }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 5. EXPORT / DIGITAL LICENSE TAB */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                {/* Instant Free / Digital CAD Download */}
                <button
                  type="button"
                  onClick={() => onExportSTL(true)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all active:scale-[0.98] flex items-center justify-between shadow-md ${
                    isLight ? 'bg-zinc-900 text-white hover:bg-black' : 'bg-white text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isLight ? 'bg-white/10 text-white' : 'bg-zinc-950/10 text-zinc-950'}`}>
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm block">Download Binary STL</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-500 text-white">
                          FREE
                        </span>
                      </div>
                      <span className={`text-[11px] block mt-0.5 ${isLight ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        Watertight slicer-ready model (Bambu, Prusa, Cura, OrcaSlicer)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70 shrink-0" />
                </button>

                {/* Slicer specs summary */}
                {dimensions && (
                  <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Watertight Sliced Mesh</span>
                      </div>
                      <span className="font-mono font-semibold">
                        {dimensions.totalLength} × {dimensions.totalWidth} × {dimensions.totalHeight} mm
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-sans">Pockets</span>
                        <span className="font-bold">{dimensions.compartmentCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-sans">Volume</span>
                        <span className="font-bold">{dimensions.volumeCm3} cm³</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-sans">Weight</span>
                        <span className="font-bold">{dimensions.weightGramsPLA} g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-sans">Est. Time</span>
                        <span className="font-bold">~{dimensions.estimatedPrintMinutes}m</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Bottom Bar for Box Configurator */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-30 pb-safe border-t transition-colors duration-200 backdrop-blur-xl ${
          isLight ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-lg' : 'bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl'
        }`}
      >
        <div className="max-w-lg mx-auto px-2 flex items-center justify-around h-16 sm:h-14">
          {[
            { id: 'dimensions' as BoxActiveTab, label: 'Dimensions', icon: Box },
            { id: 'grid' as BoxActiveTab, label: 'Grid', icon: Grid3X3 },
            { id: 'structure' as BoxActiveTab, label: 'Walls', icon: Layers },
            { id: 'label' as BoxActiveTab, label: 'Label', icon: Type },
            { id: 'export' as BoxActiveTab, label: 'Download', icon: Download, isCTA: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isCTA) {
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(isActive ? null : tab.id)}
                  aria-label="Download STL"
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-95 min-h-[48px] min-w-[56px] ${
                    isActive
                      ? isLight ? 'bg-zinc-900 text-white shadow-md' : 'bg-white text-zinc-950 shadow-md'
                      : isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-bold tracking-tight">Download</span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(isActive ? null : tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all active:scale-95 min-h-[48px] min-w-[56px] ${
                  isActive
                    ? isLight ? 'text-zinc-950 font-bold' : 'text-white font-bold'
                    : isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? (isLight ? 'bg-zinc-200/80' : 'bg-zinc-800/80') : 'bg-transparent'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
