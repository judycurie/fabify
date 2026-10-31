/**
 * Mobile-First Ergonomic Control Dock & Native Bottom Sheet
 * Designed specifically for smartphones and tablets with graceful desktop adaptation.
 * Features:
 * - Persistent touch navigation bar (Text, Base, Holes, Style, Export)
 * - Tactile slide-up bottom sheet with backdrop dismiss & drag handle
 * - Stepper buttons (- / +) on all sliders for single-tap precision
 * - 1-tap quick preset chips
 * - Direct 1-tap STL exports and slicing telemetry
 */

import React from 'react';
import { TagConfig, HolePlacement, TagStyle, AppTheme, TagDimensions } from '../types/tag';
import { 
  Type, 
  Box, 
  CircleDot, 
  Palette, 
  Download,
  X,
  Minus,
  Plus,
  Layers,
  Check,
  Ruler,
  ShieldCheck,
  FileCode,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Truck,
  Lock
} from 'lucide-react';

export type ActiveSheetTab = 'text' | 'base' | 'holes' | 'style' | 'export' | null;

interface ControlDockProps {
  config: TagConfig;
  dimensions: TagDimensions | null;
  theme: AppTheme;
  activeTab: ActiveSheetTab;
  onSelectTab: (tab: ActiveSheetTab) => void;
  onChange: (partial: Partial<TagConfig>) => void;
  onExportSTL: (binary: boolean) => void;
  onExportSTEP?: () => void;
  onExportMultiPart: () => void;
  onOpenSpecs?: () => void;
  onOpenOrderModal?: () => void;
  isFree?: boolean;
  price?: number;
  isPurchased?: boolean;
  templateName?: string;
  onPurchase?: () => void;
}

const MONOCHROME_COLORS = [
  { name: 'Jet Black', value: '#09090b' },
  { name: 'Matte Carbon', value: '#18181b' },
  { name: 'Dark Graphite', value: '#27272a' },
  { name: 'Mid Zinc Grey', value: '#52525b' },
  { name: 'Cool Slate Grey', value: '#71717a' },
  { name: 'Light Silver', value: '#d4d4d8' },
  { name: 'Off White', value: '#f4f4f5' },
  { name: 'Pure White', value: '#ffffff' },
];

export const ControlDock: React.FC<ControlDockProps> = ({ 
  config, 
  dimensions,
  theme, 
  activeTab,
  onSelectTab,
  onChange,
  onExportSTL,
  onExportSTEP,
  onExportMultiPart,
  onOpenSpecs,
  onOpenOrderModal,
  isFree = true,
  price = 0,
  isPurchased = false,
  templateName = '',
  onPurchase
}) => {
  const isLight = theme === 'light';
  const tName = templateName?.toLowerCase() || '';
  const isPaidPlate = 
    !isFree || 
    price > 0 ||
    tName.includes('door') ||
    tName.includes('plate') ||
    tName.includes('sign') ||
    tName.includes('nameplate') ||
    tName.includes('stencil') ||
    tName.includes('machine') ||
    tName.includes('rating') ||
    (config.shape === 'rounded' && config.holePlacement === 'both-ends');

  const isUnlocked = !isPaidPlate || isPurchased;

  const isDoorSignPlate = 
    tName.includes('door') || 
    tName.includes('plate') || 
    tName.includes('sign') ||
    (config.shape === 'rounded' && config.holePlacement === 'both-ends');

  // Door sign plate should NOT have circle option - default to rounded
  React.useEffect(() => {
    if (isDoorSignPlate && config.shape === 'circle') {
      onChange({ shape: 'rounded' });
    }
  }, [isDoorSignPlate, config.shape, onChange]);

  // Dynamic maximum ranges based on font size
  const fs = config.fontSize;
  const maxBaseThickness = Math.max(8.0, Math.min(25.0, Math.round(fs * 0.25 * 10) / 10));
  const maxPadding = Math.max(10.0, Math.min(60.0, Math.round(fs * 0.5)));
  const maxFillet = Math.max(12.0, Math.min(60.0, Math.round(fs * 0.6)));
  const maxHoleDiameter = Math.max(8.0, Math.min(30.0, Math.round(fs * 0.25 * 2) / 2));
  const maxHoleMargin = Math.max(8.0, Math.min(30.0, Math.round(fs * 0.3)));
  const maxHoleSpacing = Math.max(50.0, Math.min(400.0, Math.round(fs * 4.0)));
  const maxRelief = Math.max(3.0, Math.min(10.0, Math.round(fs * 0.15 * 10) / 10));
  const maxStencilGap = Math.max(3.0, Math.min(10.0, Math.round(fs * 0.1 * 10) / 10));
  const currentRelief = Math.max(0.6, config.reliefHeight);
  const maxLetterFillet = Math.round((currentRelief / 2) * 100) / 100;
  const maxLetterSpacing = Math.max(2.5, Math.min(12.0, Math.round(fs * 0.15 * 10) / 10));

  // Stepper utility for single-tap precision adjustments
  const stepValue = (
    key: keyof TagConfig,
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

  const isSheetOpen = activeTab !== null;

  return (
    <>
      {/* Semi-translucent mobile backdrop to tap-to-dismiss */}
      {isSheetOpen && (
        <div 
          onClick={() => onSelectTab(null)}
          className="fixed inset-0 z-25 bg-black/20 backdrop-blur-[1px] sm:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Floating Live Dimension Pill (Above bottom bar when sheet is closed) */}
      {!isSheetOpen && dimensions && (
        <div className="fixed bottom-20 left-4 z-20 transition-all duration-200 pointer-events-auto">
          <button
            onClick={() => onSelectTab('export')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border shadow-lg backdrop-blur-md transition-all active:scale-95 ${
              isLight
                ? 'bg-white/95 border-zinc-300 text-zinc-900 shadow-zinc-300/60'
                : 'bg-zinc-900/95 border-zinc-750 text-zinc-100 shadow-black'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 opacity-70" />
            <span className="font-bold">{dimensions.totalLength} × {dimensions.totalWidth} × {dimensions.totalHeight} mm</span>
            <span className="opacity-40">·</span>
            <span className="text-[11px] font-sans opacity-70">{dimensions.weightGramsPLA}g PLA</span>
            <ChevronRight className="w-3 h-3 opacity-50 ml-0.5" />
          </button>
        </div>
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
          {/* Sheet Header with Tab Title & "Done" Button */}
          <div
            className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between shrink-0 transition-colors duration-200 ${
              isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-zinc-950/70 border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {activeTab === 'text' && <Type className="w-4 h-4 text-[#4B00F2]" />}
              {activeTab === 'base' && <Box className="w-4 h-4 text-[#4B00F2]" />}
              {activeTab === 'holes' && <CircleDot className="w-4 h-4 text-[#4B00F2]" />}
              {activeTab === 'style' && <Palette className="w-4 h-4 text-[#4B00F2]" />}
              {activeTab === 'export' && <Download className="w-4 h-4 text-[#4B00F2]" />}
              <h2 className="text-sm font-bold tracking-tight">
                {activeTab === 'text' && 'Text & Typography'}
                {activeTab === 'base' && 'Tag Base & Fillets'}
                {activeTab === 'holes' && 'Holes & Mounting'}
                {activeTab === 'style' && '3D Styles & Colors'}
                {activeTab === 'export' && 'Export 3D Model'}
              </h2>
            </div>

            <button
              onClick={() => onSelectTab(null)}
              className={`p-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1 ${
                isLight
                  ? 'hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                  : 'hover:bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sheet Scrollable Content */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto overscroll-contain">
            {/* 1. TEXT TAB */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                {/* Primary Text Input with Clear Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-xs font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      Primary Text (Line 1)
                    </label>
                    <span className={`text-[11px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Helvetica
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={config.text}
                      onChange={(e) => onChange({ text: e.target.value })}
                      placeholder="e.g. KEYS, LAB 04, EXIT"
                      className={`w-full rounded-xl px-3.5 py-2.5 pr-10 text-base sm:text-sm font-sans tracking-wide border focus:outline-none transition-colors min-h-[46px] ${
                        isLight
                          ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900'
                          : 'bg-zinc-950 border-zinc-700 text-white focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300'
                      }`}
                    />
                    {config.text && (
                      <button
                        onClick={() => onChange({ text: '' })}
                        className={`absolute right-2.5 p-1 rounded-full ${
                          isLight ? 'text-zinc-400 hover:text-zinc-800' : 'text-zinc-500 hover:text-zinc-200'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Font Weight & Uppercase */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid grid-cols-2 gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => onChange({ fontVariant: 'regular' })}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all min-h-[40px] ${
                        config.fontVariant === 'regular'
                          ? isLight
                            ? 'bg-white text-zinc-950 shadow-sm'
                            : 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Regular
                    </button>
                    <button
                      onClick={() => onChange({ fontVariant: 'bold' })}
                      className={`py-2 text-xs font-bold rounded-lg transition-all min-h-[40px] ${
                        config.fontVariant === 'bold'
                          ? isLight
                            ? 'bg-white text-zinc-950 shadow-sm'
                            : 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Bold
                    </button>
                  </div>

                  <button
                    onClick={() => onChange({ isUppercase: !config.isUppercase })}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-between min-h-[40px] ${
                      config.isUppercase
                        ? isLight
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-950 border-white'
                        : isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-700'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <span>Force Uppercase</span>
                    {config.isUppercase && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Font Size with Stepper (- / +) and Quick Chips */}
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold">Line 1 Font Size</span>
                    <span className="font-mono font-bold text-sm">{config.fontSize.toFixed(1)} mm</span>
                  </div>

                  {/* Stepper + Slider */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <button
                      onClick={() => stepValue('fontSize', config.fontSize, -0.5, 3.0, 100.0, 1)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base transition-colors shrink-0 active:scale-95 ${
                        isLight ? 'bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-900' : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-white'
                      }`}
                      aria-label="Decrease font size"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="range"
                      min="3.0"
                      max="100.0"
                      step={config.fontSize >= 20 ? 1.0 : 0.5}
                      value={config.fontSize}
                      onChange={(e) => onChange({ fontSize: parseFloat(e.target.value) })}
                      className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                    />

                    <button
                      onClick={() => stepValue('fontSize', config.fontSize, 0.5, 3.0, 100.0, 1)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base transition-colors shrink-0 active:scale-95 ${
                        isLight ? 'bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-900' : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-white'
                      }`}
                      aria-label="Increase font size"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {[
                      { size: 6.5, label: 'Key 6.5mm' },
                      { size: 15.0, label: 'Desk 15mm' },
                      { size: 35.0, label: 'Door 35mm' },
                      { size: 60.0, label: 'Sign 60mm' },
                    ].map((chip) => (
                      <button
                        key={chip.size}
                        onClick={() => onChange({ fontSize: chip.size })}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium shrink-0 transition-all ${
                          Math.abs(config.fontSize - chip.size) < 0.2
                            ? isLight ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-950 border-white'
                            : isLight ? 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100' : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Second Line Toggle and Inputs */}
                <div className={`p-3.5 rounded-2xl border transition-colors ${
                  config.hasSecondLine
                    ? isLight ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-950 border-zinc-700'
                    : isLight ? 'bg-white border-dashed border-zinc-300' : 'bg-zinc-900/60 border-dashed border-zinc-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold min-h-[36px]">
                      <input
                        type="checkbox"
                        checked={config.hasSecondLine}
                        onChange={(e) => onChange({ hasSecondLine: e.target.checked })}
                        className="rounded bg-zinc-950 border-zinc-600 text-zinc-900 focus:ring-zinc-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Second Line of Text</span>
                    </label>
                    <span className={`text-[11px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {config.hasSecondLine ? 'Enabled' : 'Off'}
                    </span>
                  </div>

                  {config.hasSecondLine && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                      <div>
                        <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          Line 2 Text
                        </label>
                        <input
                          type="text"
                          value={config.textLine2 || ''}
                          onChange={(e) => onChange({ textLine2: e.target.value })}
                          placeholder="e.g. ROOM 101, STUDIO"
                          className={`w-full rounded-xl px-3 py-2 text-base sm:text-xs font-sans tracking-wide border focus:outline-none transition-colors min-h-[42px] ${
                            isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-900 border-zinc-700 text-white'
                          }`}
                        />
                      </div>

                      {/* Line 2 Font Size */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-semibold">Line 2 Size</span>
                          <span className="font-mono font-bold">{(config.fontSize2 || 4.5).toFixed(1)} mm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => stepValue('fontSize2', config.fontSize2 || 4.5, -0.5, 3.0, 100.0, 1)}
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                              isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                            }`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="range"
                            min="3.0"
                            max="100.0"
                            step={(config.fontSize2 || 4.5) >= 20 ? 1.0 : 0.5}
                            value={config.fontSize2 || 4.5}
                            onChange={(e) => onChange({ fontSize2: parseFloat(e.target.value) })}
                            className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                          />
                          <button
                            onClick={() => stepValue('fontSize2', config.fontSize2 || 4.5, 0.5, 3.0, 100.0, 1)}
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                              isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Letter Spacing (Tracking) */}
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold">Letter Spacing (Tracking)</span>
                    <span className="font-mono font-bold">{config.letterSpacing.toFixed(1)} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepValue('letterSpacing', config.letterSpacing, -0.2, 0.0, maxLetterSpacing, 1)}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                        isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="0.0"
                      max={maxLetterSpacing}
                      step="0.1"
                      value={config.letterSpacing}
                      onChange={(e) => onChange({ letterSpacing: parseFloat(e.target.value) })}
                      className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                    />
                    <button
                      onClick={() => stepValue('letterSpacing', config.letterSpacing, 0.2, 0.0, maxLetterSpacing, 1)}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                        isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. BASE & FILLET EDGES TAB */}
            {activeTab === 'base' && (
              <div className="space-y-4">
                {/* Shape Profile Selection (No circle option for door signs / plates) */}
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold">Shape Profile</span>
                    <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase">
                      {config.shape === 'circle' ? 'Round (Circle)' : config.shape === 'rectangle' ? 'Rectangle' : 'Rounded Rect (Default)'}
                    </span>
                  </div>
                  <div className={`grid ${isDoorSignPlate ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5`}>
                    {(isDoorSignPlate
                      ? [
                          { id: 'rounded', label: 'Rounded Rect', desc: 'Pill / Filleted (Default)' },
                          { id: 'rectangle', label: 'Rectangle', desc: 'Square 90°' },
                        ]
                      : [
                          { id: 'rounded', label: 'Rounded Rect', desc: 'Pill / Filleted' },
                          { id: 'circle', label: 'Round (Circle)', desc: 'Pet Tag / Disc' },
                          { id: 'rectangle', label: 'Rectangle', desc: 'Square 90°' },
                        ]
                    ).map((s) => {
                      const isSelected = (config.shape || 'rounded') === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onChange({ shape: s.id as any })}
                          className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? isLight
                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                : 'bg-white text-zinc-950 border-white shadow-sm'
                              : isLight
                              ? 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          <div className="text-xs font-bold leading-tight">{s.label}</div>
                          <div className="text-[10px] opacity-70 mt-0.5">{s.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Base Thickness */}
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold">Tag Base Thickness</span>
                    <span className="font-mono font-bold text-sm">{config.baseThickness.toFixed(1)} mm</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <button
                      onClick={() => stepValue('baseThickness', config.baseThickness, -0.2, 0.4, maxBaseThickness, 1)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 active:scale-95 ${
                        isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="range"
                      min="0.4"
                      max={maxBaseThickness}
                      step={maxBaseThickness > 10 ? 0.5 : 0.2}
                      value={Math.min(config.baseThickness, maxBaseThickness)}
                      onChange={(e) => onChange({ baseThickness: parseFloat(e.target.value) })}
                      className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                    />
                    <button
                      onClick={() => stepValue('baseThickness', config.baseThickness, 0.2, 0.4, maxBaseThickness, 1)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 active:scale-95 ${
                        isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { size: 1.2, label: 'Thin 1.2mm' },
                      { size: 2.4, label: 'Standard 2.4mm' },
                      { size: 3.6, label: 'Sturdy 3.6mm' },
                    ].map((p) => (
                      <button
                        key={p.size}
                        onClick={() => onChange({ baseThickness: p.size })}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          Math.abs(config.baseThickness - p.size) < 0.15
                            ? isLight ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-950 border-white'
                            : isLight ? 'bg-white text-zinc-700 border-zinc-300' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Fillet Radius - Adjusted when circular */}
                {config.shape !== 'circle' ? (
                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-bold">Fillet Corner Radius</span>
                      <span className="font-mono font-bold text-sm">{config.filletRadius.toFixed(1)} mm</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <button
                        onClick={() => stepValue('filletRadius', config.filletRadius, -0.5, 0.5, maxFillet, 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 active:scale-95 ${
                          isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max={maxFillet}
                        step={maxFillet > 20 ? 1.0 : 0.5}
                        value={Math.min(config.filletRadius, maxFillet)}
                        onChange={(e) => onChange({ filletRadius: parseFloat(e.target.value) })}
                        className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                      />
                      <button
                        onClick={() => stepValue('filletRadius', config.filletRadius, 0.5, 0.5, maxFillet, 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 active:scale-95 ${
                          isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[
                        { rad: 1.0, label: 'Subtle 1mm' },
                        { rad: 3.5, label: 'Smooth 3.5mm' },
                        { rad: maxFillet, label: 'Full Pill Shape' },
                      ].map((p) => (
                        <button
                          key={p.label}
                          onClick={() => onChange({ filletRadius: p.rad })}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                            Math.abs(config.filletRadius - p.rad) < 0.2
                              ? isLight ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-950 border-white'
                              : isLight ? 'bg-white text-zinc-700 border-zinc-300' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#4B00F2]" />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">360° Circular Perimeter</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">Continuous Arc</span>
                  </div>
                )}

                {/* Padding / Margin & Bevel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold">Text Padding</span>
                      <span className="font-mono font-bold">{config.padding.toFixed(1)} mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => stepValue('padding', config.padding, -0.5, 1.0, maxPadding, 1)}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                          isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min="1.0"
                        max={maxPadding}
                        step={maxPadding > 20 ? 1.0 : 0.5}
                        value={Math.min(config.padding, maxPadding)}
                        onChange={(e) => onChange({ padding: parseFloat(e.target.value) })}
                        className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                      />
                      <button
                        onClick={() => stepValue('padding', config.padding, 0.5, 1.0, maxPadding, 1)}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                          isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold">Top Bevel</span>
                      <span className="font-mono font-bold">{config.edgeBevel.toFixed(1)} mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => stepValue('edgeBevel', config.edgeBevel, -0.1, 0.0, 3.0, 1)}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                          isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0.0"
                        max={Math.max(1.0, Math.min(3.0, config.baseThickness * 0.3))}
                        step="0.1"
                        value={config.edgeBevel}
                        onChange={(e) => onChange({ edgeBevel: parseFloat(e.target.value) })}
                        className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                      />
                      <button
                        onClick={() => stepValue('edgeBevel', config.edgeBevel, 0.1, 0.0, 3.0, 1)}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                          isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. HOLES TAB */}
            {activeTab === 'holes' && (
              <div className="space-y-4">
                {/* Hole Placement 5-Button Selector */}
                <div>
                  <label className="block text-xs font-bold mb-2">Hole Position</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'left', label: 'Left Edge' },
                      { id: 'top', label: 'Top Edge' },
                      { id: 'right', label: 'Right Edge' },
                      { id: 'both-ends', label: 'Both Ends' },
                      { id: 'none', label: 'None' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onChange({ holePlacement: item.id as HolePlacement })}
                        className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all text-center min-h-[46px] ${
                          config.holePlacement === item.id
                            ? isLight
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                              : 'bg-white text-zinc-950 border-white shadow-sm'
                            : isLight
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {config.holePlacement !== 'none' && (
                  <>
                    {/* Hole Count Selector */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { count: 1 as const, label: '1 Center Hole' },
                        { count: 2 as const, label: '2 Symmetrical Holes' },
                      ].map((opt) => (
                        <button
                          key={opt.count}
                          onClick={() => onChange({ holeCount: opt.count })}
                          className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all min-h-[44px] ${
                            config.holeCount === opt.count
                              ? isLight
                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                : 'bg-white text-zinc-950 border-white shadow-sm'
                              : isLight
                              ? 'bg-zinc-50 border-zinc-200 text-zinc-700'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Hole Diameter with Stepper */}
                    <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-bold">Hole Diameter</span>
                        <span className="font-mono font-bold text-sm">Ø {config.holeDiameter.toFixed(1)} mm</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <button
                          onClick={() => stepValue('holeDiameter', config.holeDiameter, -0.5, 2.0, maxHoleDiameter, 1)}
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 active:scale-95 ${
                            isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                          }`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="range"
                          min="2.0"
                          max={maxHoleDiameter}
                          step={maxHoleDiameter > 12 ? 1.0 : 0.5}
                          value={Math.min(config.holeDiameter, maxHoleDiameter)}
                          onChange={(e) => onChange({ holeDiameter: parseFloat(e.target.value) })}
                          className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                        />
                        <button
                          onClick={() => stepValue('holeDiameter', config.holeDiameter, 0.5, 2.0, maxHoleDiameter, 1)}
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 active:scale-95 ${
                            isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {[
                          { size: 2.4, label: 'M2 (2.4mm)' },
                          { size: 3.4, label: 'M3 (3.4mm)' },
                          { size: 4.5, label: 'M4 (4.5mm)' },
                          { size: 5.0, label: 'Keyring (5mm)' },
                        ].map((chip) => (
                          <button
                            key={chip.size}
                            onClick={() => onChange({ holeDiameter: chip.size })}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium shrink-0 transition-all ${
                              Math.abs(config.holeDiameter - chip.size) < 0.2
                                ? isLight ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-950 border-white'
                                : isLight ? 'bg-white text-zinc-700 border-zinc-300' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hole-to-Text Clearance Margin */}
                    <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-bold">Clearance Margin (Hole-to-Text)</span>
                        <span className="font-mono font-bold">{config.holeEdgeMargin.toFixed(1)} mm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => stepValue('holeEdgeMargin', config.holeEdgeMargin, -0.5, 2.0, maxHoleMargin, 1)}
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                            isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                          }`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="range"
                          min="2.0"
                          max={maxHoleMargin}
                          step={maxHoleMargin > 15 ? 1.0 : 0.5}
                          value={Math.min(config.holeEdgeMargin, maxHoleMargin)}
                          onChange={(e) => onChange({ holeEdgeMargin: parseFloat(e.target.value) })}
                          className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                        />
                        <button
                          onClick={() => stepValue('holeEdgeMargin', config.holeEdgeMargin, 0.5, 2.0, maxHoleMargin, 1)}
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                            isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 4. STYLE & COLORS TAB */}
            {activeTab === 'style' && (
              <div className="space-y-4">
                {/* 3D Print Style Selector */}
                <div>
                  <label className="block text-xs font-bold mb-2">3D Printing Style</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'embossed', title: 'Embossed (Raised)', desc: 'Ideal for 2-color / AMS 3D print' },
                      { id: 'debossed', title: 'Debossed (Engraved)', desc: 'Carved flush into surface' },
                      { id: 'cutout', title: 'Cutout (Stencil)', desc: 'Punched through with island bridges' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => onChange({ tagStyle: style.id as TagStyle })}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[56px] ${
                          config.tagStyle === style.id
                            ? isLight
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                              : 'bg-white text-zinc-950 border-white shadow-md'
                            : isLight
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-850'
                        }`}
                      >
                        <span className="text-xs font-bold">{style.title}</span>
                        <span className={`text-[11px] mt-1 leading-tight ${
                          config.tagStyle === style.id
                            ? isLight ? 'text-zinc-300' : 'text-zinc-600'
                            : isLight ? 'text-zinc-500' : 'text-zinc-400'
                        }`}>
                          {style.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Relief Height / Engraving Depth */}
                {config.tagStyle !== 'cutout' && (
                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-bold">
                        {config.tagStyle === 'embossed' ? 'Relief Height (Raised)' : 'Engraving Depth'}
                      </span>
                      <span className="font-mono font-bold text-sm">{Math.max(0.6, config.reliefHeight).toFixed(1)} mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => stepValue('reliefHeight', config.reliefHeight, -0.2, 0.6, maxRelief, 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 active:scale-95 ${
                          isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="0.6"
                        max={maxRelief}
                        step={maxRelief > 5 ? 0.5 : 0.2}
                        value={Math.min(Math.max(0.6, config.reliefHeight), maxRelief)}
                        onChange={(e) => onChange({ reliefHeight: parseFloat(e.target.value) })}
                        className={`w-full cursor-pointer ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                      />
                      <button
                        onClick={() => stepValue('reliefHeight', config.reliefHeight, 0.2, 0.6, maxRelief, 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 active:scale-95 ${
                          isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Color Swatches with Checkmarks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <label className="block text-xs font-bold mb-2">Base Plate Color</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {MONOCHROME_COLORS.map((c) => {
                        const isSelected = config.baseColor.toLowerCase() === c.value.toLowerCase();
                        return (
                          <button
                            key={c.value}
                            onClick={() => onChange({ baseColor: c.value })}
                            title={c.name}
                            style={{ backgroundColor: c.value }}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-transform active:scale-90 ${
                              isSelected
                                ? 'scale-110 ring-2 ring-zinc-500/60 border-zinc-950 dark:border-white shadow-md'
                                : isLight ? 'border-zinc-300' : 'border-zinc-700'
                            }`}
                          >
                            {isSelected && (
                              <Check className={`w-3.5 h-3.5 ${c.value === '#ffffff' || c.value === '#f4f4f5' ? 'text-zinc-950' : 'text-white'}`} />
                            )}
                          </button>
                        );
                      })}
                      <input
                        type="color"
                        value={config.baseColor}
                        onChange={(e) => onChange({ baseColor: e.target.value })}
                        className="w-8 h-8 rounded-xl bg-transparent border-0 cursor-pointer"
                        title="Custom Color"
                      />
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <label className="block text-xs font-bold mb-2">Lettering Color</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {MONOCHROME_COLORS.map((c) => {
                        const isSelected = config.textColor.toLowerCase() === c.value.toLowerCase();
                        return (
                          <button
                            key={c.value}
                            onClick={() => onChange({ textColor: c.value })}
                            title={c.name}
                            style={{ backgroundColor: c.value }}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-transform active:scale-90 ${
                              isSelected
                                ? 'scale-110 ring-2 ring-zinc-500/60 border-zinc-950 dark:border-white shadow-md'
                                : isLight ? 'border-zinc-300' : 'border-zinc-700'
                            }`}
                          >
                            {isSelected && (
                              <Check className={`w-3.5 h-3.5 ${c.value === '#ffffff' || c.value === '#f4f4f5' ? 'text-zinc-950' : 'text-white'}`} />
                            )}
                          </button>
                        );
                      })}
                      <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => onChange({ textColor: e.target.value })}
                        className="w-8 h-8 rounded-xl bg-transparent border-0 cursor-pointer"
                        title="Custom Color"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. EXPORT & SLICER SPECS TAB */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                {/* Physical Order Card */}
                {onOpenOrderModal && (
                  <button
                    onClick={() => {
                      onSelectTab(null);
                      onOpenOrderModal();
                    }}
                    className={`w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98] flex items-center justify-between shadow-lg ${
                      isLight
                        ? 'bg-zinc-900 text-white hover:bg-black shadow-zinc-900/15'
                        : 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${isLight ? 'bg-white/15 text-white' : 'bg-zinc-950/15 text-zinc-950'}`}>
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm block">Order Physical 3D Print</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                            isLight ? 'bg-white/20 text-white' : 'bg-black/10 text-zinc-950'
                          }`}>
                            From $12.50
                          </span>
                        </div>
                        <span className={`text-[11px] block mt-0.5 ${isLight ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          Carbon Fiber PETG, Matte PLA or ASA · Dispatched in 24–48h
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-80 shrink-0" />
                  </button>
                )}

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
                            ${(price || 2.99).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          <strong>{templateName || 'This template'}</strong> is a commercial design. Free models generate STLs, while paid models generate production <strong>STEP (.step)</strong> CAD files plus slice-ready STLs.
                        </p>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 pl-2 border-l-2 border-[#F26C65]/40 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] shrink-0" />
                        <span>Generates Production STEP (.step) CAD file for Fusion 360 & SolidWorks</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] shrink-0" />
                        <span>Commercial physical print rights (sell unlimited prints)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4B00F2] shrink-0" />
                        <span>Watertight binary STL + dual-color multi-part exports</span>
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
                              ISO 10303-21 standard for SolidWorks, Fusion 360, FreeCAD
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-80 shrink-0" />
                      </button>
                    )}

                    {/* Primary STL Download Card with #4B00F2 */}
                    <button
                      onClick={() => onExportSTL(true)}
                      className="w-full p-4 rounded-2xl text-left border border-transparent transition-all active:scale-[0.98] flex items-center justify-between bg-[#4B00F2] hover:bg-[#3D00C6] text-white shadow-md shadow-[#4B00F2]/20 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-white/20 text-white">
                          <Download className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm block">
                              {isPurchased ? 'Download Licensed STL' : 'Download Free STL (Recommended)'}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/25 text-white font-bold uppercase">
                              {isPurchased ? 'Licensed' : 'FREE'}
                            </span>
                          </div>
                          <span className="text-[11px] block mt-0.5 text-white/90">
                            Standard compact watertight file for Bambu, Cura, Prusa, OrcaSlicer
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-80 shrink-0" />
                    </button>

                    {/* Dual-Color / Multi-Part STLs Card */}
                    <button
                      onClick={onExportMultiPart}
                      className={`w-full p-4 rounded-2xl text-left border transition-all active:scale-[0.98] flex items-center justify-between ${
                        isLight
                          ? 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'}`}>
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-sm block">Dual-Color Multi-Part STLs</span>
                          <span className={`text-[11px] block mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Exports separate Base.stl + Text.stl for Bambu AMS or Prusa MMU
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                    </button>

                    {/* ASCII STL Card */}
                    <button
                      onClick={() => onExportSTL(false)}
                      className={`w-full p-3.5 rounded-2xl text-left border transition-all active:scale-[0.98] flex items-center justify-between ${
                        isLight
                          ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs block">ASCII STL Format (Text)</span>
                          <span className={`text-[10px] block ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            Plain human-readable format for CAD inspection
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                    </button>
                  </>
                )}

                {/* Slicing & Dimension Summary */}
                {dimensions && (
                  <div className={`p-4 rounded-2xl border space-y-2.5 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4 text-[#4B00F2]" />
                        <span>Watertight 2-Manifold Mesh</span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold">
                        {dimensions.totalLength} × {dimensions.totalWidth} × {dimensions.totalHeight} mm
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                      <div>
                        <span className={`text-[10px] block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Weight</span>
                        <span className="font-mono font-bold">{dimensions.weightGramsPLA} g</span>
                      </div>
                      <div>
                        <span className={`text-[10px] block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Volume</span>
                        <span className="font-mono font-bold">{dimensions.volumeCm3} cm³</span>
                      </div>
                      <div>
                        <span className={`text-[10px] block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Layers</span>
                        <span className="font-mono font-bold">{dimensions.estimatedLayers}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Time</span>
                        <span className="font-mono font-bold">~{dimensions.estimatedPrintMinutes}m</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right-aligned Vertical Compact Navigation Ribbon */}
      <nav
        aria-label="3D Studio Navigation Ribbon"
        className={`fixed right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border shadow-xl transition-all duration-200 backdrop-blur-xl ${
          isLight
            ? 'bg-white/95 border-zinc-200/90 text-zinc-900 shadow-zinc-400/25'
            : 'bg-zinc-950/95 border-zinc-800/90 text-zinc-100 shadow-black'
        }`}
      >
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          {[
            { id: 'text' as ActiveSheetTab, label: 'Text', icon: Type },
            { id: 'base' as ActiveSheetTab, label: 'Base', icon: Box },
            { id: 'holes' as ActiveSheetTab, label: 'Holes', icon: CircleDot },
            { id: 'style' as ActiveSheetTab, label: 'Style', icon: Palette },
            { id: 'export' as ActiveSheetTab, label: !isUnlocked ? 'Add to Basket' : 'Export', icon: Download, isCTA: true },
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
                  title={!isUnlocked ? `Add to Basket ($${(price > 0 ? price : 3.99).toFixed(2)})` : "Download Free STL"}
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
