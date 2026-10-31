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
  Sliders,
  Lock
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
  onExportSTEP?: () => void;
  onOpenLicenseModal?: () => void;
  isFree?: boolean;
  price?: number;
  isPurchased?: boolean;
  templateName?: string;
  onPurchase?: () => void;
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
  onExportSTEP,
  onOpenLicenseModal,
  isFree = true,
  price = 0,
  isPurchased = false,
  templateName = '',
  onPurchase
}) => {
  const isLight = theme === 'light';
  const isSheetOpen = activeTab !== null;
  const bName = templateName?.toLowerCase() || '';
  const isPaidBox = 
    !isFree || 
    price > 0 ||
    bName.includes('valet') ||
    bName.includes('edc') ||
    bName.includes('stack') ||
    bName.includes('tier') ||
    bName.includes('hardware') ||
    bName.includes('screws');

  const isUnlocked = !isPaidBox || isPurchased;

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

      {/* Slide-in Flyout Panel from the Right */}
      <div
        className={`fixed right-12 sm:right-16 top-14 sm:top-16 bottom-11 sm:bottom-14 z-30 transition-all duration-300 ease-out w-[calc(100vw-58px)] sm:w-[380px] max-w-[420px] ${
          isSheetOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-x-8 opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`h-full rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border backdrop-blur-2xl transition-colors duration-200 flex flex-col ${
            isLight
              ? 'bg-white/98 border-zinc-200 shadow-zinc-400/40 text-zinc-900'
              : 'bg-zinc-900/98 border-zinc-800 shadow-black text-zinc-100'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3.5 pb-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#4B00F2]">
                Desk Organizer · {activeTab}
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
                      config.hasScoop ? 'bg-[#4B00F2]' : 'bg-zinc-300 dark:bg-zinc-700'
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
                      config.hasStackingLip ? 'bg-[#4B00F2]' : 'bg-zinc-300 dark:bg-zinc-700'
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

                {/* Text Position on Organizer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs">Text Position & Placement</label>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {config.textPosition === 'front_center' && 'Front Center'}
                      {config.textPosition === 'front_top' && 'Front Top'}
                      {config.textPosition === 'front_bottom' && 'Front Bottom'}
                      {config.textPosition === 'front_left' && 'Front Left'}
                      {config.textPosition === 'front_right' && 'Front Right'}
                      {config.textPosition === 'back_wall' && 'Back Face'}
                      {config.textPosition === 'inside_bottom' && 'Inside Floor'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: 'front_center', label: 'Front Center' },
                      { id: 'front_top', label: 'Front Top' },
                      { id: 'front_bottom', label: 'Front Bottom' },
                      { id: 'front_left', label: 'Front Left' },
                      { id: 'front_right', label: 'Front Right' },
                      { id: 'back_wall', label: 'Back Face' },
                      { id: 'inside_bottom', label: 'Inside Floor' },
                    ].map((pos) => {
                      const isSel = (config.textPosition || 'front_center') === pos.id;
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => onChange({ textPosition: pos.id as any })}
                          className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold transition-all truncate text-center ${
                            isSel
                              ? isLight 
                                ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm' 
                                : 'bg-white text-zinc-950 border-white shadow-sm'
                              : isLight 
                              ? 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700' 
                              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300'
                          }`}
                        >
                          {pos.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fine Vertical Offset */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Vertical Position Offset</span>
                    <span className="font-mono font-bold">{(config.textVerticalOffset || 0) > 0 ? `+${config.textVerticalOffset} mm` : `${config.textVerticalOffset || 0} mm`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onChange({ textVerticalOffset: Math.max(-15, (config.textVerticalOffset || 0) - 1) })}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={-15}
                      max={15}
                      step={1}
                      value={config.textVerticalOffset || 0}
                      onChange={(e) => onChange({ textVerticalOffset: Number(e.target.value) })}
                      className="flex-1 accent-zinc-900 dark:accent-white"
                    />
                    <button
                      onClick={() => onChange({ textVerticalOffset: Math.min(15, (config.textVerticalOffset || 0) + 1) })}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                            isSel ? 'ring-2 ring-[#4B00F2] scale-110' : 'hover:scale-105'
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
                {!isUnlocked ? (
                  /* GATED PREMIUM CAD LICENSE CARD - ONLY OPTION IS ADD TO BASKET */
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                    isLight ? 'bg-amber-50/80 border-amber-300' : 'bg-amber-950/20 border-amber-800/60'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-[#F26C65]/15 text-[#F26C65] shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            Commercial CAD License Required
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-[#F26C65]/15 text-[#F26C65] border border-[#F26C65]/30">
                            ${(price || 3.50).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          <strong>{templateName || 'This organizer'}</strong> is a commercial design. Free models generate STLs, while paid models generate production <strong>STEP (.step)</strong> CAD files plus slice-ready STLs.
                        </p>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 pl-2 border-l-2 border-[#F26C65]/40 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] shrink-0" />
                        <span>Generates Production STEP (.step) CAD solid for Fusion 360 & SolidWorks</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] shrink-0" />
                        <span>Commercial physical print rights (sell unlimited printed organizers)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] shrink-0" />
                        <span>Watertight binary STL with smooth scoops & stacking rims</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] shrink-0" />
                        <span>Permanent access & re-downloads in your library</span>
                      </div>
                    </div>

                    {/* ONLY OPTION FOR PAID MODEL: ADD TO BASKET */}
                    <button
                      type="button"
                      onClick={onPurchase}
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#F26C65] hover:bg-[#D9554E] text-white flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md shadow-[#F26C65]/20"
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                      <span>Add to Basket (${(price || 3.50).toFixed(2)})</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* For Purchased Paid Models: Generate Production CAD STEP */}
                    {isPurchased && onExportSTEP && (
                      <button
                        type="button"
                        onClick={onExportSTEP}
                        className="w-full p-4 rounded-2xl text-left border border-transparent transition-all active:scale-[0.98] flex items-center justify-between bg-[#F26C65] hover:bg-[#D9554E] text-white shadow-md shadow-[#F26C65]/20 cursor-pointer mb-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-white/20 text-white">
                            <FileCode className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm block">Download Production STEP (.step)</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/25 text-white font-bold uppercase">
                                CAD SOLID
                              </span>
                            </div>
                            <span className="text-[11px] block mt-0.5 text-white/90">
                              ISO 10303-21 standard solid for SolidWorks, Fusion 360, FreeCAD
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-80 shrink-0" />
                      </button>
                    )}

                    {/* Instant Free / Digital CAD Download with #4B00F2 */}
                    <button
                      type="button"
                      onClick={() => onExportSTL(true)}
                      className="w-full p-4 rounded-2xl text-left border border-white/20 transition-all active:scale-[0.98] flex items-center justify-between shadow-indigo-glow bg-[#4B00F2] hover:bg-[#3D00C6] text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-white/20 text-white">
                          <Download className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm block">
                              {isPurchased ? 'Download Slicer STL' : 'Download Free STL'}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-white/25 text-white">
                              {isPurchased ? 'LICENSED' : 'FREE'}
                            </span>
                          </div>
                          <span className="text-[11px] block mt-0.5 text-white/90">
                            Watertight slicer-ready model (Bambu, Prusa, Cura, OrcaSlicer)
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-80 shrink-0" />
                    </button>
                  </>
                )}

                {/* Slicer specs summary */}
                {dimensions && (
                  <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-4 h-4 text-[#4B00F2]" />
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

      {/* Right-aligned Vertical Compact Navigation Ribbon for Box Configurator */}
      <nav
        aria-label="Grid Box Tools Navigation Ribbon"
        className={`fixed right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border shadow-xl transition-all duration-200 backdrop-blur-xl ${
          isLight
            ? 'bg-white/95 border-zinc-200/90 text-zinc-900 shadow-zinc-400/25'
            : 'bg-zinc-950/95 border-zinc-800/90 text-zinc-100 shadow-black'
        }`}
      >
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          {[
            { id: 'dimensions' as BoxActiveTab, label: 'Size', icon: Box },
            { id: 'grid' as BoxActiveTab, label: 'Grid', icon: Grid3X3 },
            { id: 'structure' as BoxActiveTab, label: 'Walls', icon: Layers },
            { id: 'label' as BoxActiveTab, label: 'Label', icon: Type },
            { id: 'export' as BoxActiveTab, label: !isUnlocked ? 'Add to Basket' : 'Export', icon: Download, isCTA: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isCTA) {
              const CTAIcon = !isUnlocked ? ShoppingBag : Icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (!isUnlocked && onPurchase) {
                      onPurchase();
                    } else {
                      onSelectTab(isActive ? null : tab.id);
                    }
                  }}
                  aria-label={!isUnlocked ? "Add to Basket" : "Download Free STL"}
                  title={!isUnlocked ? `Add to Basket ($${(price > 0 ? price : 3.50).toFixed(2)})` : "Download Free STL"}
                  className={`flex flex-col items-center justify-center p-0.5 sm:p-1 rounded-lg sm:rounded-xl transition-all active:scale-95 w-9 sm:w-11 h-9 sm:h-11 text-white shadow-md cursor-pointer ${
                    !isUnlocked
                      ? 'bg-[#F26C65] hover:bg-[#D9554E]'
                      : 'bg-[#4B00F2] hover:bg-[#3D00C6]'
                  } ${isActive ? 'ring-2 ring-offset-1 ' + (isLight ? 'ring-zinc-950 ring-offset-white' : 'ring-white ring-offset-zinc-950') : ''}`}
                >
                  <CTAIcon className="w-3.5 h-3.5 mb-0.5 text-white" />
                  <span className="text-[6.5px] sm:text-[7.5px] font-bold tracking-tight text-white leading-tight text-center">
                    {!isUnlocked ? 'Basket' : 'Free STL'}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(isActive ? null : tab.id)}
                aria-label={tab.label}
                title={tab.label}
                className={`relative flex flex-col items-center justify-center p-0.5 sm:p-1 rounded-lg sm:rounded-xl transition-all active:scale-95 w-9 sm:w-11 h-9 sm:h-11 cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'bg-zinc-950 text-white font-bold shadow-md shadow-zinc-900/25 ring-1 ring-zinc-800'
                      : 'bg-white text-zinc-950 font-bold shadow-md shadow-white/20 ring-1 ring-zinc-200'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5" />
                <span className="text-[7px] sm:text-[8px] font-semibold tracking-tight leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
