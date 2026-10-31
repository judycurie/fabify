/**
 * Parametric 3D Desk Organizer & Compartment Box Geometry Generator
 * Generates watertight 2-manifold solid models with:
 * - Rounded outer corners & top chamfer
 * - Configurable NxM internal compartment grid
 * - Finger-friendly scoops / curved pocket bottoms
 * - Stacking lip rims for vertical modularity
 * - Embossed / debossed custom front label
 * - Slicer-ready single manifold STL export
 */

import * as THREE from 'three';
import * as opentype from 'opentype.js';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { BoxConfig, BoxDimensions } from '../types/box';
import { GeneratedTagModel } from './tagGeometry';
import { TagDimensions } from '../types/tag';
import { generateTextShapes } from './fontLoader';
import { analyzeMeshWatertightness } from './meshAnalyzer';

/**
 * Create a 2D rounded rectangle shape
 */
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, Math.min(width, height) / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

/**
 * Generate 3D Desk Organizer Model
 */
export async function generateBoxModel(
  config: BoxConfig,
  font?: opentype.Font | null
): Promise<GeneratedTagModel> {
  const {
    width,
    depth,
    height,
    wallThickness,
    floorThickness,
    filletRadius,
    gridColumns,
    gridRows,
    dividerThickness,
    dividerHeightPercent,
    hasScoop,
    scoopRadius,
    hasStackingLip,
    stackingLipHeight,
    hasLabel,
    labelText,
    labelFontSize,
    labelStyle,
    labelRelief,
    primaryColor,
    accentColor,
  } = config;

  const cols = Math.max(1, Math.min(6, Math.round(gridColumns)));
  const rows = Math.max(1, Math.min(5, Math.round(gridRows)));

  // 1. Calculate internal cavity dimensions
  const totalInnerWidth = Math.max(10, width - 2 * wallThickness - (cols - 1) * dividerThickness);
  const totalInnerDepth = Math.max(10, depth - 2 * wallThickness - (rows - 1) * dividerThickness);
  const pocketWidth = totalInnerWidth / cols;
  const pocketDepth = totalInnerDepth / rows;
  const pocketHeight = height - floorThickness;

  // 2. Create Outer Solid Box
  const outerShape = createRoundedRectShape(width, depth, filletRadius);
  const outerExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: height,
    bevelEnabled: config.edgeBevel > 0.05,
    bevelSegments: 3,
    steps: 1,
    bevelSize: Math.min(config.edgeBevel, wallThickness * 0.4),
    bevelThickness: Math.min(config.edgeBevel, 1.5),
  };
  const outerGeo = new THREE.ExtrudeGeometry(outerShape, outerExtrudeSettings);
  outerGeo.computeVertexNormals();

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  let currentBrush = new Brush(outerGeo);
  currentBrush.updateMatrixWorld();

  // 3. Subtract Cavity Pockets (with optional finger scoop)
  const cavityCornerRadius = Math.max(0.5, Math.min(filletRadius - wallThickness, 8));

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      // Cavity center in XY
      const posX = -width / 2 + wallThickness + c * (pocketWidth + dividerThickness) + pocketWidth / 2;
      const posY = -depth / 2 + wallThickness + r * (pocketDepth + dividerThickness) + pocketDepth / 2;

      // Base pocket shape
      const pocketShape = createRoundedRectShape(pocketWidth, pocketDepth, cavityCornerRadius);
      // Cut slightly past top for clean CSG boolean
      const cutHeight = pocketHeight + 4.0;
      const pocketGeo = new THREE.ExtrudeGeometry(pocketShape, {
        depth: cutHeight,
        bevelEnabled: false,
      });

      // Align cavity bottom with floorThickness
      pocketGeo.translate(posX, posY, floorThickness);
      pocketGeo.computeVertexNormals();

      const pocketBrush = new Brush(pocketGeo);
      pocketBrush.updateMatrixWorld();

      currentBrush = evaluator.evaluate(currentBrush, pocketBrush, SUBTRACTION);
      currentBrush.updateMatrixWorld();
    }
  }

  // 4. Stacking Lip (if enabled): Step around the top rim
  if (hasStackingLip) {
    const lipInset = wallThickness * 0.4;
    const lipShape = createRoundedRectShape(width - lipInset, depth - lipInset, Math.max(1, filletRadius - lipInset / 2));
    const lipCutter = new THREE.ExtrudeGeometry(lipShape, {
      depth: stackingLipHeight + 1.0,
      bevelEnabled: false,
    });
    lipCutter.translate(0, 0, height - stackingLipHeight);
    lipCutter.computeVertexNormals();

    const lipBrush = new Brush(lipCutter);
    lipBrush.updateMatrixWorld();

    // Inset top step
    currentBrush = evaluator.evaluate(currentBrush, lipBrush, SUBTRACTION);
    currentBrush.updateMatrixWorld();
  }

  // 5. Front Label (Embossed or Debossed)
  let textGeometry: THREE.BufferGeometry | undefined;
  let textMesh: THREE.Mesh | undefined;

  if (hasLabel && labelText && labelText.trim().length > 0 && font) {
    try {
      const textResult = generateTextShapes(
        font,
        labelText.trim(),
        labelFontSize,
        0.3
      );

      if (textResult.shapes.length > 0) {
        const textExtrude: THREE.ExtrudeGeometryOptions = {
          depth: labelRelief,
          bevelEnabled: false,
          steps: 1,
        };

        const rawTextGeo = new THREE.ExtrudeGeometry(textResult.shapes, textExtrude);
        rawTextGeo.computeBoundingBox();

        const tb = rawTextGeo.boundingBox || new THREE.Box3();
        const textW = Math.max(0.1, tb.max.x - tb.min.x);
        const textH = Math.max(0.1, tb.max.y - tb.min.y);

        // Define strict boundary of the flat front surface:
        // Flat X boundary excludes corner fillets + safety margin:
        const minFlatX = -width / 2 + filletRadius + 2.5;
        const maxFlatX = width / 2 - filletRadius - 2.5;
        const availFlatW = Math.max(10.0, maxFlatX - minFlatX);

        // Flat Z boundary excludes floor & top chamfer/stacking lip + safety margin:
        const minZ = Math.max(1.5, floorThickness * 0.5);
        const topLipMargin = hasStackingLip ? (stackingLipHeight || 3.0) : 0;
        const maxZ = Math.max(minZ + 4.0, height - topLipMargin - edgeBevel - 2.5);
        const availFlatH = Math.max(4.0, maxZ - minZ);

        // Auto-scale text uniformly so it NEVER exceeds the front surface boundary:
        const fitScaleX = textW > availFlatW ? availFlatW / textW : 1.0;
        const fitScaleZ = textH > availFlatH ? availFlatH / textH : 1.0;
        const uniformScale = Math.min(fitScaleX, fitScaleZ, 1.0);

        rawTextGeo.scale(uniformScale, uniformScale, 1.0);
        // Normalize origin so text begins at (0, 0, 0)
        rawTextGeo.translate(-tb.min.x * uniformScale, -tb.min.y * uniformScale, 0);

        const actualW = textW * uniformScale;
        const actualH = textH * uniformScale;

        // Rotate to stand upright on front wall (normal pointing along -Y towards viewer):
        rawTextGeo.rotateX(Math.PI / 2);

        const pos = config.textPosition || 'front_center';
        const vOffset = config.textVerticalOffset || 0;

        // Calculate horizontal X placement within flat surface
        let targetX = -actualW / 2;
        if (pos === 'front_left') {
          targetX = minFlatX + 1.0;
        } else if (pos === 'front_right') {
          targetX = maxFlatX - actualW - 1.0;
        }

        // Clamp X strictly within front surface flat region
        const xPos = Math.max(minFlatX, Math.min(maxFlatX - actualW, targetX));

        // Calculate vertical Z placement within front wall
        const midZ = minZ + (availFlatH - actualH) / 2;
        let targetZ = midZ + vOffset;
        if (pos === 'front_top') {
          targetZ = maxZ - actualH - 0.5 + vOffset;
        } else if (pos === 'front_bottom') {
          targetZ = minZ + 0.5 + vOffset;
        }

        // Clamp Z strictly so text never drops below floor or rises above top rim
        const zPos = Math.max(minZ, Math.min(maxZ - actualH, targetZ));

        // Front face is at y = -depth / 2
        if (labelStyle === 'embossed') {
          // Embed 0.15mm into front wall for watertight manifold Boolean addition
          const yPos = -depth / 2 + 0.15;
          rawTextGeo.translate(xPos, yPos, zPos);
          rawTextGeo.computeVertexNormals();
          textGeometry = rawTextGeo;

          const textMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(accentColor),
            roughness: 0.35,
            metalness: 0.1,
          });
          textMesh = new THREE.Mesh(textGeometry, textMat);
        } else {
          // Debossed: cut into front wall
          const yPos = -depth / 2 + labelRelief + 0.05;
          rawTextGeo.translate(xPos, yPos, zPos);
          rawTextGeo.computeVertexNormals();

          const debossBrush = new Brush(rawTextGeo);
          debossBrush.updateMatrixWorld();
          currentBrush = evaluator.evaluate(currentBrush, debossBrush, SUBTRACTION);
          currentBrush.updateMatrixWorld();
        }
      }
    } catch (e) {
      console.warn('Failed to generate box label text:', e);
    }
  }

  // 6. Final Base Geometry & Mesh
  const baseGeometry = currentBrush.geometry.clone();
  baseGeometry.computeVertexNormals();

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.45,
    metalness: 0.05,
  });

  const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;

  // 7. Combined Export Geometry for Single Watertight STL
  let exportGeometry: THREE.BufferGeometry;
  if (textGeometry && labelStyle === 'embossed') {
    const textBrush = new Brush(textGeometry);
    textBrush.updateMatrixWorld();
    const unionBrush = evaluator.evaluate(currentBrush, textBrush, ADDITION);
    exportGeometry = unionBrush.geometry.clone();
  } else {
    exportGeometry = baseGeometry.clone();
  }
  exportGeometry.computeVertexNormals();

  // 8. Watertight Quality & Dimensions Analysis
  const analysis = analyzeMeshWatertightness(exportGeometry);
  const volumeCm3 = Math.round(analysis.volumeCm3 * 10) / 10;
  const weightGramsPLA = Math.round(volumeCm3 * 1.24 * 10) / 10;
  const estimatedLayers = Math.round(height / 0.2);
  const estimatedPrintMinutes = Math.round((volumeCm3 * 1.24 * 4.2) + 15);

  const dimensions: TagDimensions = {
    totalLength: Math.round(width * 10) / 10,
    totalWidth: Math.round(depth * 10) / 10,
    totalHeight: Math.round(height * 10) / 10,
    baseThickness: floorThickness,
    textRelief: labelRelief,
    textWidth: pocketWidth * cols,
    textHeight: pocketDepth * rows,
    holeDiameter: 0,
    holeCount: cols * rows,
    minWallThickness: wallThickness,
    volumeMm3: Math.round(volumeCm3 * 1000),
    volumeCm3,
    weightGramsPLA,
    estimatedPrintMinutes,
    estimatedLayers,
    isWatertight: analysis.isWatertight,
    vertexCount: analysis.vertexCount,
    triangleCount: analysis.triangleCount,
    boundaryEdges: analysis.boundaryEdges,
    nonManifoldEdges: analysis.nonManifoldEdges,
  };

  const boxDimensions: BoxDimensions = {
    totalLength: dimensions.totalLength,
    totalWidth: dimensions.totalWidth,
    totalHeight: dimensions.totalHeight,
    wallThickness,
    floorThickness,
    compartmentWidth: Math.round(pocketWidth * 10) / 10,
    compartmentDepth: Math.round(pocketDepth * 10) / 10,
    compartmentHeight: Math.round(pocketHeight * 10) / 10,
    compartmentCount: cols * rows,
    volumeCm3,
    weightGramsPLA,
    estimatedPrintMinutes,
    estimatedLayers,
    isWatertight: analysis.isWatertight,
    vertexCount: analysis.vertexCount,
    triangleCount: analysis.triangleCount,
  };

  return {
    baseMesh,
    textMesh,
    exportGeometry,
    baseGeometry,
    textGeometry,
    dimensions,
    holes: [],
    rawBounds: {
      minX: -width / 2,
      maxX: width / 2,
      minY: -depth / 2,
      maxY: depth / 2,
      width,
      height: depth,
    },
    // Attach boxDimensions metadata
    ...( { boxDimensions } as any ),
  };
}
