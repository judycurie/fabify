/**
 * Model Licensing & Access Tiers Specification
 * Defines access scopes, commercial rights, and monetization models.
 */

export type ModelTierId = 'free' | 'tier1_static' | 'tier2_subscription';

export interface ModelTierInfo {
  id: ModelTierId;
  name: string;
  badge: string;
  priceDisplay: string;
  priceValue: number;
  period: 'one-off' | 'monthly' | 'forever';
  accessScope: string;
  bestFor: string;
  typicalMonetization: string;
  highlights: string[];
  includesStep: boolean;
  includesStl: boolean;
  unlimitedExports: boolean;
}

export const MODEL_TIERS: Record<ModelTierId, ModelTierInfo> = {
  free: {
    id: 'free',
    name: 'Free Community License',
    badge: 'FREE COMMUNITY',
    priceDisplay: '$0.00',
    priceValue: 0,
    period: 'forever',
    accessScope: 'Single watertight binary STL generated for personal 3D printing in this session.',
    bestFor: 'Hobbyists, students, and makers fabricating items for personal, non-commercial use.',
    typicalMonetization: 'Free download with 1-click account verification.',
    highlights: [
      'Watertight binary STL file export',
      'Personal non-commercial physical 3D print use',
      'Instant direct download and email dispatch',
      'Standard Helvetica parametric typography',
    ],
    includesStep: false,
    includesStl: true,
    unlimitedExports: false,
  },
  tier1_static: {
    id: 'tier1_static',
    name: 'Tier 1: Static Asset Commercial License',
    badge: 'TIER 1 · ONE-OFF',
    priceDisplay: '$15.00',
    priceValue: 15.0,
    period: 'one-off',
    accessScope: 'Single exported file (STL/STEP/OBJ/DXF) generated during that session.',
    bestFor: 'Makers/sellers who want to manufacture and sell physical units of one specific design variation.',
    typicalMonetization: 'One-off fee per design / file export (e.g., $15 per design variant).',
    highlights: [
      'Single exported file (STL / STEP / OBJ / DXF)',
      'Full physical manufacturing & sales rights for physical units',
      'Production STEP (.step) ISO CAD Solid included',
      'Dual-color multi-part STLs for multi-material printing',
      'Direct dispatch to login email with license certificate',
    ],
    includesStep: true,
    includesStl: true,
    unlimitedExports: false,
  },
  tier2_subscription: {
    id: 'tier2_subscription',
    name: 'Tier 2: Commercial Subscription / Tool Access',
    badge: 'TIER 2 · MAKER SUB',
    priceDisplay: '$25.00 / mo',
    priceValue: 25.0,
    period: 'monthly',
    accessScope: 'Continuous access to the live configurator, batch exporting, and seed tweaking.',
    bestFor: 'Active commercial shops, Print-on-Demand (POD) businesses, and custom-order fabricators.',
    typicalMonetization: 'Recurring monthly/annual subscription (e.g., Maker tier at $25/month).',
    highlights: [
      'Continuous access to live parametric configurators',
      'Unlimited batch exporting (STL, STEP, and Multi-Part)',
      'Live seed tweaking and dimension recalculation',
      'Full commercial rights across all created variations',
      'Priority direct email delivery and cloud library sync',
    ],
    includesStep: true,
    includesStl: true,
    unlimitedExports: true,
  },
};
