import { TagConfig } from '../types/tag';
import { BoxConfig } from '../types/box';

/**
 * Generates a clean, standardized alphanumeric parameter code summarizing
 * the user's custom dimensions, typography, and geometry for tags and plates.
 * Example: TAG·EMB·T1·T2.4·F6.8·[FORGE3D]
 */
export function generateTagParamCode(config: TagConfig): string {
  const line1 = (config.text || 'TAG').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const line2 = config.hasSecondLine && config.textLine2 
    ? `+${config.textLine2.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')}` 
    : '';
  const style = config.tagStyle === 'embossed' ? 'EMB' : config.tagStyle === 'debossed' ? 'DEB' : 'CUT';
  const holes = config.holePlacement === 'none' 
    ? 'H0' 
    : `${config.holePlacement === 'both-ends' ? '2E' : config.holePlacement[0].toUpperCase()}${config.holeCount}`;
  const fontS = Math.round(config.fontSize * 10) / 10;
  const thk = Math.round(config.baseThickness * 10) / 10;
  return `TAG·${style}·${holes}·T${thk}·F${fontS}·[${line1}${line2}]`;
}

/**
 * Generates a clean, standardized alphanumeric parameter code summarizing
 * the user's custom dimensions, compartments, and geometry for desk organizers.
 * Example: BOX·150x100x34·G2x2·W2.4·SCP·STD·[DAILYEDC]
 */
export function generateBoxParamCode(config: BoxConfig): string {
  const dim = `${Math.round(config.width)}x${Math.round(config.depth)}x${Math.round(config.height)}`;
  const grid = `G${config.gridColumns}x${config.gridRows}`;
  const w = `W${Math.round(config.wallThickness * 10) / 10}`;
  const scp = config.hasScoop ? 'SCP' : 'FLT';
  const stk = config.hasStackingLip ? 'STK' : 'STD';
  const lbl = config.hasLabel && config.labelText 
    ? `·[${config.labelText.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')}]` 
    : '';
  return `BOX·${dim}·${grid}·${w}·${scp}·${stk}${lbl}`;
}
