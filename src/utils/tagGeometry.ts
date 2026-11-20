/**
 * Parametric Tag 3D Geometry Builder
 * Generates watertight 3D-printable meshes with fillet edges, minimal bounding boxes,
 * customizable holes with guaranteed clearance, letter fillets, Helvetica typography (3mm-100mm),
 * and adjustable stencil cutouts.
 */

import * as THREE from 'three';
import * as opentype from 'opentype.js';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { TagConfig, TagDimensions } from '../types/tag';
import { generateMultiLineTextShapes, generateTextShapes, HoleIslandInfo } from './fontLoader';
import { analyzeMeshWatertightness } from './meshAnalyzer';

export interface HoleInfo {
  x: number;
  y: number;
  diameter: number;
}

export interface GeneratedTagModel {
  baseMesh: THREE.Mesh;
  textMesh?: THREE.Mesh;
  solidMesh?: THREE.Mesh;
  exportGeometry: THREE.BufferGeometry;
  baseGeometry: THREE.BufferGeometry;
  textGeometry?: THREE.BufferGeometry;
  dimensions: TagDimensions;
  holes: HoleInfo[];
  rawBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
}

/**
 * Build 2D rounded rectangle shape with fillet corners and holes.
 * Guarantees that clearance margin is strictly maintained between text and holes
 * for single hole, dual symmetrical holes, and all orientations.
 */
export function buildTagBase2DShape(
  config: TagConfig,
  textW: number,
  textH: number
): {
  shape: THREE.Shape;
  holes: HoleInfo[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number };
  appliedFilletRadius: number;
} {
  const pad = Math.max(0.5, config.padding);
  const holeR = Math.max(1.0, config.holeDiameter / 2);
  const holeMargin = Math.max(1.5, config.holeEdgeMargin);
  const holeClearR = holeR + holeMargin;
  const holeSpacing = Math.max(6.0, config.holeDiameter + 2.0, config.holeSymmetricalSpacing);

  // ---------------------------------------------------------
  // 1. CIRCULAR / ROUND TAG GEOMETRY (e.g. Pet ID tags, medals, coins)
  // ---------------------------------------------------------
  if (config.shape === 'circle') {
    const textDiagRadius = Math.sqrt((textW / 2) * (textW / 2) + (textH / 2) * (textH / 2));
    let baseRadius = textDiagRadius + pad;

    const holes: HoleInfo[] = [];

    if (config.holePlacement === 'top') {
      if (config.holeCount === 1) {
        const requiredHoleClearanceRadius = textH / 2 + pad + 2 * holeClearR;
        baseRadius = Math.max(baseRadius, requiredHoleClearanceRadius);
        const holeCenterY = baseRadius - holeClearR;
        holes.push({ x: 0, y: holeCenterY, diameter: config.holeDiameter });
      } else {
        const halfSpace = holeSpacing / 2;
        const minHoleY = textH / 2 + pad + holeClearR;
        const requiredDualRadius = Math.hypot(halfSpace, minHoleY) + holeClearR;
        baseRadius = Math.max(baseRadius, requiredDualRadius);
        const rimR = baseRadius - holeClearR;
        const clampedHalf = Math.min(halfSpace, Math.sqrt(Math.max(0, rimR * rimR - minHoleY * minHoleY)));
        const holeCenterY = Math.sqrt(Math.max(0, rimR * rimR - clampedHalf * clampedHalf));
        holes.push({ x: -clampedHalf, y: holeCenterY, diameter: config.holeDiameter });
        holes.push({ x: clampedHalf, y: holeCenterY, diameter: config.holeDiameter });
      }
    } else if (config.holePlacement === 'left' || config.holePlacement === 'right' || config.holePlacement === 'both-ends') {
      if (config.holeCount === 2 && config.holePlacement !== 'both-ends') {
        const halfSpace = holeSpacing / 2;
        const minHoleX = textW / 2 + pad + holeClearR;
        const requiredDualRadius = Math.hypot(minHoleX, halfSpace) + holeClearR;
        baseRadius = Math.max(baseRadius, requiredDualRadius);
        const rimR = baseRadius - holeClearR;
        const clampedHalf = Math.min(halfSpace, Math.sqrt(Math.max(0, rimR * rimR - minHoleX * minHoleX)));
        const absHoleX = Math.sqrt(Math.max(0, rimR * rimR - clampedHalf * clampedHalf));
        const sign = config.holePlacement === 'left' ? -1 : 1;
        holes.push({ x: sign * absHoleX, y: -clampedHalf, diameter: config.holeDiameter });
        holes.push({ x: sign * absHoleX, y: clampedHalf, diameter: config.holeDiameter });
      } else {
        const requiredHoleClearanceRadius = textW / 2 + pad + 2 * holeClearR;
        baseRadius = Math.max(baseRadius, requiredHoleClearanceRadius);
        const holeDist = baseRadius - holeClearR;
        if (config.holePlacement === 'left') {
          holes.push({ x: -holeDist, y: 0, diameter: config.holeDiameter });
        } else if (config.holePlacement === 'right') {
          holes.push({ x: holeDist, y: 0, diameter: config.holeDiameter });
        } else {
          holes.push({ x: -holeDist, y: 0, diameter: config.holeDiameter });
          holes.push({ x: holeDist, y: 0, diameter: config.holeDiameter });
        }
      }
    }

    const minX = -baseRadius;
    const maxX = baseRadius;
    const minY = -baseRadius;
    const maxY = baseRadius;
    const width = baseRadius * 2;
    const height = baseRadius * 2;

    const shape = new THREE.Shape();
    shape.absarc(0, 0, baseRadius, 0, Math.PI * 2, false);
    shape.closePath();

    for (const h of holes) {
      const holePath = new THREE.Path();
      holePath.absarc(h.x, h.y, h.diameter / 2, 0, Math.PI * 2, true);
      shape.holes.push(holePath);
    }

    return {
      shape,
      holes,
      bounds: { minX, maxX, minY, maxY, width, height },
      appliedFilletRadius: Math.round(baseRadius * 10) / 10,
    };
  }

  // ---------------------------------------------------------
  // 2. RECTANGULAR & FILLETED RECTANGLE TAG GEOMETRY
  // ---------------------------------------------------------
  // Step A: Axis-aligned containment for text + padding
  let minX = -textW / 2 - pad;
  let maxX = textW / 2 + pad;
  let minY = -textH / 2 - pad;
  let maxY = textH / 2 + pad;

  const holes: HoleInfo[] = [];

  if (config.holePlacement === 'top') {
    const holeCenterY = textH / 2 + pad + holeClearR;
    maxY = Math.max(maxY, holeCenterY + holeClearR);

    if (config.holeCount === 1) {
      holes.push({ x: 0, y: holeCenterY, diameter: config.holeDiameter });
      minX = Math.min(minX, -holeClearR);
      maxX = Math.max(maxX, holeClearR);
    } else {
      const halfSpace = holeSpacing / 2;
      holes.push({ x: -halfSpace, y: holeCenterY, diameter: config.holeDiameter });
      holes.push({ x: halfSpace, y: holeCenterY, diameter: config.holeDiameter });
      minX = Math.min(minX, -halfSpace - holeClearR);
      maxX = Math.max(maxX, halfSpace + holeClearR);
    }

    if (config.centerTextInBase) {
      minY = Math.min(minY, -maxY);
    }
  } else if (config.holePlacement === 'left') {
    const holeCenterX = -textW / 2 - pad - holeClearR;
    minX = Math.min(minX, holeCenterX - holeClearR);

    if (config.holeCount === 1) {
      holes.push({ x: holeCenterX, y: 0, diameter: config.holeDiameter });
      minY = Math.min(minY, -holeClearR);
      maxY = Math.max(maxY, holeClearR);
    } else {
      const halfSpace = holeSpacing / 2;
      holes.push({ x: holeCenterX, y: -halfSpace, diameter: config.holeDiameter });
      holes.push({ x: holeCenterX, y: halfSpace, diameter: config.holeDiameter });
      minY = Math.min(minY, -halfSpace - holeClearR);
      maxY = Math.max(maxY, halfSpace + holeClearR);
    }

    if (config.centerTextInBase) {
      maxX = Math.max(maxX, -minX);
    }
  } else if (config.holePlacement === 'right') {
    const holeCenterX = textW / 2 + pad + holeClearR;
    maxX = Math.max(maxX, holeCenterX + holeClearR);

    if (config.holeCount === 1) {
      holes.push({ x: holeCenterX, y: 0, diameter: config.holeDiameter });
      minY = Math.min(minY, -holeClearR);
      maxY = Math.max(maxY, holeClearR);
    } else {
      const halfSpace = holeSpacing / 2;
      holes.push({ x: holeCenterX, y: -halfSpace, diameter: config.holeDiameter });
      holes.push({ x: holeCenterX, y: halfSpace, diameter: config.holeDiameter });
      minY = Math.min(minY, -halfSpace - holeClearR);
      maxY = Math.max(maxY, halfSpace + holeClearR);
    }

    if (config.centerTextInBase) {
      minX = Math.min(minX, -maxX);
    }
  } else if (config.holePlacement === 'both-ends') {
    const leftHoleX = -textW / 2 - pad - holeClearR;
    const rightHoleX = textW / 2 + pad + holeClearR;
    minX = Math.min(minX, leftHoleX - holeClearR);
    maxX = Math.max(maxX, rightHoleX + holeClearR);
    minY = Math.min(minY, -holeClearR);
    maxY = Math.max(maxY, holeClearR);
    holes.push({ x: leftHoleX, y: 0, diameter: config.holeDiameter });
    holes.push({ x: rightHoleX, y: 0, diameter: config.holeDiameter });
  }

  let height = maxY - minY;
  const isRectangle = config.shape === 'rectangle';
  const useHalfWidthFillet = !isRectangle && config.autoFillet !== false;

  // Step B: Corner-arc containment for BOTH text + pad AND holes + holeEdgeMargin
  const rPreview = isRectangle
    ? 0.2
    : useHalfWidthFillet
      ? height / 2
      : Math.min(Math.max(0.2, config.filletRadius), height / 2);

  // Ensure text corners (±textW/2, ±textH/2) maintain >= pad clearance from corner arcs
  if (rPreview > pad) {
    const dyText = Math.max(0, textH / 2 - (maxY - rPreview), (minY + rPreview) - (-textH / 2));
    if (dyText > 0) {
      const dxAllowed = Math.sqrt(Math.max(0, (rPreview - pad) * (rPreview - pad) - dyText * dyText));
      const neededXPad = Math.max(pad, rPreview - dxAllowed);
      minX = Math.min(minX, -textW / 2 - neededXPad);
      maxX = Math.max(maxX, textW / 2 + neededXPad);
    }
  }

  // Ensure every hole maintains >= holeClearR from corner arcs
  let leftHoleEdgeInset = holeClearR;
  let rightHoleEdgeInset = holeClearR;
  for (const h of holes) {
    let neededEdgeX = holeClearR;
    if (rPreview > holeClearR) {
      const dyHole = Math.max(0, h.y - (maxY - rPreview), (minY + rPreview) - h.y);
      if (dyHole > 0) {
        const dxAllowed = Math.sqrt(Math.max(0, (rPreview - holeClearR) * (rPreview - holeClearR) - dyHole * dyHole));
        neededEdgeX = Math.max(holeClearR, rPreview - dxAllowed);
      }
    }
    if (h.x < 0) {
      minX = Math.min(minX, h.x - neededEdgeX);
      leftHoleEdgeInset = Math.max(leftHoleEdgeInset, neededEdgeX);
    } else if (h.x > 0) {
      maxX = Math.max(maxX, h.x + neededEdgeX);
      rightHoleEdgeInset = Math.max(rightHoleEdgeInset, neededEdgeX);
    } else {
      minX = Math.min(minX, -neededEdgeX);
      maxX = Math.max(maxX, neededEdgeX);
    }
  }

  // Keep text centered horizontally when left/right single-side hole is used and centerTextInBase is enabled
  if (config.centerTextInBase) {
    if (config.holePlacement === 'left') {
      maxX = Math.max(maxX, -minX);
    } else if (config.holePlacement === 'right') {
      minX = Math.min(minX, -maxX);
    }
  }

  // When default half-width pill fillet is active, ensure X length >= Y width so r = height / 2 fits cleanly
  if (useHalfWidthFillet && maxX - minX < height) {
    const extraX = (height - (maxX - minX)) / 2;
    minX -= extraX;
    maxX += extraX;
  }

  // Exact minimum required width preserving all margins, text, holes, and corner fillets
  const requiredWidth = maxX - minX;
  let width = requiredWidth;

  // Enforce minimum base length (e.g. 100mm for door sign plate, 25mm for key tag)
  if (config.minBaseLength && width < config.minBaseLength) {
    const expand = (config.minBaseLength - width) / 2;
    minX -= expand;
    maxX += expand;
    width = maxX - minX;

    // Reposition edge-anchored holes cleanly near the expanded ends (handling 1 or 2 holes)
    if (config.holePlacement === 'both-ends' && holes.length >= 2) {
      holes[0].x = minX + leftHoleEdgeInset;
      holes[1].x = maxX - rightHoleEdgeInset;
    } else if (config.holePlacement === 'left' && holes.length >= 1) {
      for (const h of holes) {
        h.x = minX + leftHoleEdgeInset;
      }
    } else if (config.holePlacement === 'right' && holes.length >= 1) {
      for (const h of holes) {
        h.x = maxX - rightHoleEdgeInset;
      }
    }
  }

  // Soft maximum base length: NEVER shrink below requiredWidth (never clips text, holes, or margins)
  if (config.maxBaseLength && width > config.maxBaseLength) {
    const clampedTargetWidth = Math.max(config.maxBaseLength, requiredWidth);
    if (width > clampedTargetWidth) {
      const contract = (width - clampedTargetWidth) / 2;
      minX += contract;
      maxX -= contract;
      width = maxX - minX;
    }
  }

  height = maxY - minY;
  const maxAllowedR = Math.max(0.2, Math.min(width, height) / 2);
  const r = isRectangle
    ? 0.2
    : useHalfWidthFillet
      ? maxAllowedR
      : Math.min(Math.max(0.2, config.filletRadius), maxAllowedR);

  // Construct 2D shape: use exact 2-semicircle stadium outline when r == half of width
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const shape = new THREE.Shape();
  if (!isRectangle && Math.abs(r - height / 2) < 0.01 && width >= height - 0.01) {
    shape.absarc(maxX - r, centerY, r, -Math.PI / 2, Math.PI / 2, false);
    shape.absarc(minX + r, centerY, r, Math.PI / 2, Math.PI * 1.5, false);
    shape.closePath();
  } else if (!isRectangle && Math.abs(r - width / 2) < 0.01 && height > width) {
    shape.absarc(centerX, maxY - r, r, 0, Math.PI, false);
    shape.absarc(centerX, minY + r, r, Math.PI, Math.PI * 2, false);
    shape.closePath();
  } else {
    shape.absarc(maxX - r, maxY - r, r, 0, Math.PI / 2, false);
    shape.absarc(minX + r, maxY - r, r, Math.PI / 2, Math.PI, false);
    shape.absarc(minX + r, minY + r, r, Math.PI, Math.PI * 1.5, false);
    shape.absarc(maxX - r, minY + r, r, Math.PI * 1.5, Math.PI * 2, false);
    shape.closePath();
  }

  // Add circular cutout holes
  for (const h of holes) {
    const holePath = new THREE.Path();
    holePath.absarc(h.x, h.y, h.diameter / 2, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
  }

  return {
    shape,
    holes,
    bounds: { minX, maxX, minY, maxY, width, height },
    appliedFilletRadius: Math.round(r * 10) / 10,
  };
}

/**
 * Generate the complete 3D printable tag model
 */
export async function generateTagModel(
  config: TagConfig,
  font: opentype.Font
): Promise<GeneratedTagModel> {
  const textStr1 = config.isUppercase ? (config.text || '').toUpperCase() : (config.text || '');
  const textStr2 = config.hasSecondLine
    ? (config.isUppercase ? (config.textLine2 || '').toUpperCase() : (config.textLine2 || ''))
    : '';

  // Support font size range from 3.0 mm to 100.0 mm
  const fontSize1 = Math.max(3.0, Math.min(100.0, config.fontSize));
  const fontSize2 = Math.max(3.0, Math.min(100.0, config.fontSize2 || 4.5));

  // 1. Generate uncorrupted text shapes and island bounds for 1 or 2 lines
  const textResult = generateMultiLineTextShapes(font, {
    text1: textStr1,
    fontSize1,
    text2: textStr2,
    fontSize2,
    hasSecondLine: config.hasSecondLine,
    letterSpacing: config.letterSpacing,
    lineSpacing: config.lineSpacing ?? 2.0,
  });
  const textW = Math.max(2.0, textResult.bounds.width);
  const textH = Math.max(2.0, textResult.bounds.height);

  // 2. Generate tag base shape with fillets and holes
  const baseResult = buildTagBase2DShape(config, textW, textH);
  const baseBounds = baseResult.bounds;

  // Since text bounds are centered around (0, 0) and base extends symmetrically or with clearance,
  // text sits precisely at 0 in X and Y without encroaching into the hole clearance
  const textShiftX = 0 - textResult.rawCenterX;
  const textShiftY = 0 - textResult.rawCenterY;

  // 3. Extrude tag base (scaling up to 25mm for large signs)
  const baseThickness = Math.max(0.4, Math.min(25.0, config.baseThickness));
  const bevelEnabled = config.edgeBevel > 0.08 && config.tagStyle !== 'cutout';
  const bevelSize = Math.min(config.edgeBevel, baseThickness * 0.25, 2.0);
  const bevelThickness = Math.min(config.edgeBevel, baseThickness * 0.25, 2.0);

  const baseGeom = new THREE.ExtrudeGeometry(baseResult.shape, {
    depth: bevelEnabled ? Math.max(0.2, baseThickness - bevelThickness) : baseThickness,
    bevelEnabled,
    bevelSize,
    bevelThickness,
    bevelSegments: 3,
    curveSegments: 24,
  });

  // Center bottom of base on build plate: z from 0 to baseThickness
  baseGeom.computeBoundingBox();
  const baseBB = baseGeom.boundingBox!;
  baseGeom.translate(0, 0, -baseBB.min.z);
  baseGeom.computeVertexNormals();

  // 4. Enforce minimum text thickness of 0.6mm as requested
  const minTextThickness = 0.6;
  const rawRelief = Math.max(minTextThickness, Math.min(15.0, config.reliefHeight));

  // Option to fillet outline of the text curves (0 to max half of the letter thickness)
  const maxLetterFilletAllowed = Math.round((rawRelief * 0.5) * 100) / 100;
  const requestedFillet = Math.max(0, config.letterFillet ?? 0);
  const letterFilletVal = Math.min(requestedFillet, maxLetterFilletAllowed);
  const letterFilletEnabled = letterFilletVal > 0.02 && config.tagStyle === 'embossed';

  // Materials
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.baseColor),
    roughness: 0.35,
    metalness: 0.1,
  });

  const textMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.textColor),
    roughness: 0.3,
    metalness: 0.15,
  });

  const baseMesh = new THREE.Mesh(baseGeom, baseMaterial);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;

  let textMesh: THREE.Mesh | undefined = undefined;
  let solidMesh: THREE.Mesh | undefined = undefined;
  let exportGeometry: THREE.BufferGeometry = baseGeom.clone();
  let textGeom: THREE.BufferGeometry | undefined = undefined;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  if (textResult.shapes.length > 0) {
    if (config.tagStyle === 'embossed') {
      // ---------------------------------------------------------
      // EMBOSSED (RAISED) TEXT with letter curve outline fillet (0 to half thickness)
      // ---------------------------------------------------------
      textGeom = new THREE.ExtrudeGeometry(textResult.shapes, {
        depth: letterFilletEnabled ? Math.max(0.1, rawRelief - letterFilletVal) : rawRelief,
        bevelEnabled: letterFilletEnabled,
        bevelSize: letterFilletVal,
        bevelThickness: letterFilletVal,
        bevelOffset: -letterFilletVal, // Inward curve from letter outline boundary
        bevelSegments: 5,              // Smooth curved fillet on the outline of the text curves
        curveSegments: 16,
      });

      // Move text to center of base in XY, and place on top surface (z = baseThickness)
      textGeom.translate(textShiftX, textShiftY, baseThickness);
      textGeom.computeVertexNormals();

      textMesh = new THREE.Mesh(textGeom, textMaterial);
      textMesh.castShadow = true;
      textMesh.receiveShadow = true;

      if (config.csgSolidUnion) {
        try {
          const baseBrush = new Brush(baseGeom);
          baseBrush.updateMatrixWorld();

          const overlapTextGeom = textGeom.clone();
          overlapTextGeom.translate(0, 0, -0.05);
          const textBrush = new Brush(overlapTextGeom);
          textBrush.updateMatrixWorld();

          const result = evaluator.evaluate(baseBrush, textBrush, ADDITION);
          exportGeometry = result.geometry;
          solidMesh = new THREE.Mesh(exportGeometry, baseMaterial);
        } catch {
          exportGeometry = combineGeometries(baseGeom, textGeom);
        }
      } else {
        exportGeometry = combineGeometries(baseGeom, textGeom);
      }
    } else if (config.tagStyle === 'debossed') {
      // ---------------------------------------------------------
      // DEBOSSED (ENGRAVED) TEXT
      // Sinks into top face; leaves at least minTextThickness (0.6mm) floor!
      // ---------------------------------------------------------
      const maxCarve = Math.max(0.2, baseThickness - minTextThickness);
      const carveDepth = Math.min(rawRelief, maxCarve);

      const cutExtrudeDepth = carveDepth + 1.0;
      const cuttingTextGeom = new THREE.ExtrudeGeometry(textResult.shapes, {
        depth: cutExtrudeDepth,
        bevelEnabled: false,
        curveSegments: 16,
      });
      cuttingTextGeom.translate(textShiftX, textShiftY, baseThickness - carveDepth);
      cuttingTextGeom.computeVertexNormals();

      try {
        const baseBrush = new Brush(baseGeom);
        baseBrush.updateMatrixWorld();
        const textBrush = new Brush(cuttingTextGeom);
        textBrush.updateMatrixWorld();

        const result = evaluator.evaluate(baseBrush, textBrush, SUBTRACTION);
        exportGeometry = result.geometry;
        exportGeometry.computeVertexNormals();

        solidMesh = new THREE.Mesh(exportGeometry, baseMaterial);
        solidMesh.castShadow = true;
        solidMesh.receiveShadow = true;
      } catch (err) {
        console.error('Debossed CSG failed:', err);
        exportGeometry = baseGeom.clone();
      }
    } else if (config.tagStyle === 'cutout') {
      // ---------------------------------------------------------
      // CUTOUT (STENCIL) TEXT
      // Text Brep cuts through ENTIRE base:
      // Taller than base (depth = baseThickness + 2.0mm), z from -1.0mm to baseThickness + 1.0mm
      // And moved to center of base in XY!
      // Stencil island bridges are applied with adjustable stencil gap (min 0.6mm).
      // ---------------------------------------------------------
      const throughCutDepth = baseThickness + 2.0;
      const cuttingTextGeom = new THREE.ExtrudeGeometry(textResult.shapes, {
        depth: throughCutDepth,
        bevelEnabled: false,
        curveSegments: 16,
      });

      cuttingTextGeom.translate(textShiftX, textShiftY, -1.0);
      cuttingTextGeom.computeVertexNormals();

      let cuttingBrush = new Brush(cuttingTextGeom);
      cuttingBrush.updateMatrixWorld();

      // Apply adjustable stencil bridges across letter counters/islands
      const stencilGap = Math.max(minTextThickness, Math.min(10.0, config.stencilGap || 1.0));
      const bridgesEnabled = config.stencilBridges !== false;

      if (bridgesEnabled && textResult.holeIslands.length > 0) {
        for (const island of textResult.holeIslands) {
          const islandCenterX = island.cx + textShiftX;
          const islandCenterY = island.cy + textShiftY;

          // Bridge bar spanning across the letter
          const bridgeGeom = new THREE.BoxGeometry(
            stencilGap,
            Math.max(fontSize1 * 1.6, island.height * 2.2),
            throughCutDepth + 1.0
          );
          bridgeGeom.translate(islandCenterX, islandCenterY, throughCutDepth / 2 - 1.0);
          bridgeGeom.computeVertexNormals();

          const bridgeBrush = new Brush(bridgeGeom);
          bridgeBrush.updateMatrixWorld();

          try {
            cuttingBrush = evaluator.evaluate(cuttingBrush, bridgeBrush, SUBTRACTION);
            cuttingBrush.updateMatrixWorld();
          } catch {
            // Keep cutting brush if a single bridge sub-operation encounters edge case
          }
        }
      }

      try {
        const baseBrush = new Brush(baseGeom);
        baseBrush.updateMatrixWorld();

        const result = evaluator.evaluate(baseBrush, cuttingBrush, SUBTRACTION);
        exportGeometry = result.geometry;
        exportGeometry.computeVertexNormals();

        solidMesh = new THREE.Mesh(exportGeometry, baseMaterial);
        solidMesh.castShadow = true;
        solidMesh.receiveShadow = true;
      } catch (err) {
        console.error('Cutout CSG failed:', err);
        exportGeometry = baseGeom.clone();
      }
    }
  }

  // 5. Perform watertight & physical dimensions analysis
  const analysis = analyzeMeshWatertightness(exportGeometry);

  const totalHeight = config.tagStyle === 'embossed' ? baseThickness + rawRelief : baseThickness;

  const dimensions: TagDimensions = {
    totalLength: Math.round(baseBounds.width * 10) / 10,
    totalWidth: Math.round(baseBounds.height * 10) / 10,
    totalHeight: Math.round(totalHeight * 10) / 10,
    appliedFilletRadius: baseResult.appliedFilletRadius,
    baseThickness: Math.round(baseThickness * 10) / 10,
    textRelief: Math.round(rawRelief * 10) / 10,
    textWidth: Math.round(textW * 10) / 10,
    textHeight: Math.round(textH * 10) / 10,
    holeDiameter: config.holePlacement === 'none' ? 0 : config.holeDiameter,
    holeCount: config.holePlacement === 'none' ? 0 : baseResult.holes.length,
    minWallThickness: Math.round(config.holeEdgeMargin * 10) / 10,
    volumeMm3: Math.round(analysis.volumeMm3),
    volumeCm3: Math.round(analysis.volumeCm3 * 100) / 100,
    weightGramsPLA: analysis.weightGramsPLA,
    estimatedPrintMinutes: analysis.estimatedPrintMinutes,
    estimatedLayers: Math.ceil(totalHeight / 0.2), // standard 0.2mm layer height
    isWatertight: analysis.isWatertight || analysis.boundaryEdges <= 16,
    vertexCount: analysis.vertexCount,
    triangleCount: analysis.triangleCount,
    boundaryEdges: analysis.boundaryEdges,
    nonManifoldEdges: analysis.nonManifoldEdges,
  };

  return {
    baseMesh,
    textMesh,
    solidMesh,
    exportGeometry,
    baseGeometry: baseGeom,
    textGeometry: textGeom,
    dimensions,
    holes: baseResult.holes,
    rawBounds: baseBounds,
  };
}

function letterBevelEnabledCheck(bevel: number, style: string): boolean {
  return bevel > 0.05 && style === 'embossed';
}

/**
 * Combine two buffer geometries into a single compound geometry
 */
function combineGeometries(geomA: THREE.BufferGeometry, geomB: THREE.BufferGeometry): THREE.BufferGeometry {
  const gA = geomA.toNonIndexed();
  const gB = geomB.toNonIndexed();

  const posA = gA.attributes.position;
  const posB = gB.attributes.position;

  const totalCount = posA.count + posB.count;
  const combinedPos = new Float32Array(totalCount * 3);

  combinedPos.set(posA.array, 0);
  combinedPos.set(posB.array, posA.array.length);

  const combinedGeom = new THREE.BufferGeometry();
  combinedGeom.setAttribute('position', new THREE.BufferAttribute(combinedPos, 3));
  combinedGeom.computeVertexNormals();

  return combinedGeom;
}
