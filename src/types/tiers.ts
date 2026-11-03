/**
 * Model Licensing & Access Tiers Specification
 * Defines access scopes, commercial rights, and monetization models.
 * 
 * Tiers:
 * - Free: Personal 3D printing STL ($0.00)
 * - Tier 1: Static Model Commercial License ($5.00 one-off per design variant)
 * - Tier 2: 1-Month Configurator Tool Access ($25.00 one-time payment for 30 days, no recurring subscription)
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
    badge: 'TIER 1 · $5 ONE-OFF',
    priceDisplay: '$5.00',
    priceValue: 5.0,
    period: 'one-off',
    accessScope: 'Single exported production solid model (STL + STEP ISO CAD Solid + DXF) generated during that session.',
    bestFor: 'Makers/sellers who want to manufacture and sell physical units of one specific design variation.',
    typicalMonetization: 'One-off fee of $5 per design variant (no recurring fees).',
    highlights: [
      'Watertight binary STL + ISO STEP CAD Solid + DXF vector',
      'Full physical manufacturing & commercial sales rights for physical units',
      'Dual-color multi-part STLs for multi-material 3D printing',
      'Direct dispatch to login email with official commercial certificate',
    ],
    includesStep: true,
    includesStl: true,
    unlimitedExports: false,
  },
  tier2_subscription: {
    id: 'tier2_subscription',
    name: 'Tier 2: 1-Month Configurator Tool Access',
    badge: 'TIER 2 · 1-MONTH PASS',
    priceDisplay: '$25.00 / month',
    priceValue: 25.0,
    period: 'monthly',
    accessScope: 'Continuous access to the live configurator, batch exporting, and seed tweaking for 30 days. One-off payment for the month with no recurring subscription.',
    bestFor: 'Active commercial shops, Print-on-Demand (POD) businesses, and custom-order fabricators.',
    typicalMonetization: 'Payment of $25 works for the month, no need of subscription (no auto-renewing lock-in).',
    highlights: [
      'Continuous 30-day live access to all parametric 3D configurators',
      'Payment of $25 works for the month — no recurring subscription needed',
      'Unlimited batch exporting (STL, STEP, and Multi-Part)',
      'Live seed tweaking and real-time dimension recalculation',
      'Full commercial manufacturing rights across all created variations',
      'Priority direct email delivery and cloud sync',
    ],
    includesStep: true,
    includesStl: true,
    unlimitedExports: true,
  },
};
