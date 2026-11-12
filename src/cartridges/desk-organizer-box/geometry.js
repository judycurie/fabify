/**
 * Standalone Pure ES Module: Modular Desk Organizer & Tray Forge Geometry Engine
 * Zero external relative imports, zero DOM/React/Three.js scene setup.
 */

function createRoundedRectShape(THREE, width, height, radius) {
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

function opentypeCommandsToShapes(THREE, commands) {
  const contours = [];
  let currentContour = [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  function recordPoint(x, y) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      if (currentContour.length > 0) contours.push(currentContour);
      const y = -cmd.y;
      currentContour = [{ x: cmd.x, y }];
      recordPoint(cmd.x, y);
    } else if (cmd.type === 'L') {
      const y = -cmd.y;
      currentContour.push({ x: cmd.x, y });
      recordPoint(cmd.x, y);
    } else if (cmd.type === 'Q') {
      const p0 = currentContour[currentContour.length - 1];
      const p1 = { x: cmd.x1, y: -cmd.y1 };
      const p2 = { x: cmd.x, y: -cmd.y };
      const steps = 6;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        const x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
        const y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
        currentContour.push({ x, y });
        recordPoint(x, y);
      }
    } else if (cmd.type === 'C') {
      const p0 = currentContour[currentContour.length - 1];
      const p1 = { x: cmd.x1, y: -cmd.y1 };
      const p2 = { x: cmd.x2, y: -cmd.y2 };
      const p3 = { x: cmd.x, y: -cmd.y };
      const steps = 8;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
        const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
        currentContour.push({ x, y });
        recordPoint(x, y);
      }
    }
  }

  if (currentContour.length > 0) contours.push(currentContour);

  if (contours.length === 0) {
    return {
      shapes: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 },
    };
  }

  function polygonArea(pts) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return a / 2;
  }

  function pointInPoly(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x;
      const yi = poly[i].y;
      const xj = poly[j].x;
      const yj = poly[j].y;
      const intersect = yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const items = contours
    .map((c) => ({
      pts: c,
      area: Math.abs(polygonArea(c)),
      isHole: false,
      parentIdx: -1,
    }))
    .filter((item) => item.pts.length >= 3 && item.area > 0.001)
    .sort((a, b) => b.area - a.area);

  for (let i = 0; i < items.length; i++) {
    const pts = items[i].pts;
    const testPt = {
      x: (pts[0].x + pts[Math.floor(pts.length / 2)].x) / 2,
      y: (pts[0].y + pts[Math.floor(pts.length / 2)].y) / 2,
    };

    let parent = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (pointInPoly(testPt, items[j].pts)) {
        parent = j;
        break;
      }
    }

    if (parent !== -1) {
      items[i].parentIdx = parent;
      items[i].isHole = !items[parent].isHole;
    }
  }

  const shapes = [];
  const mapIdxToShape = new Map();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.isHole) {
      const shape = new THREE.Shape();
      shape.moveTo(item.pts[0].x, item.pts[0].y);
      for (let k = 1; k < item.pts.length; k++) {
        shape.lineTo(item.pts[k].x, item.pts[k].y);
      }
      shape.closePath();
      shapes.push(shape);
      mapIdxToShape.set(i, shape);
    } else {
      const parentShape = mapIdxToShape.get(item.parentIdx);
      if (parentShape) {
        const holePath = new THREE.Path();
        holePath.moveTo(item.pts[0].x, item.pts[0].y);
        for (let k = 1; k < item.pts.length; k++) {
          holePath.lineTo(item.pts[k].x, item.pts[k].y);
        }
        holePath.closePath();
        parentShape.holes.push(holePath);
      }
    }
  }

  return {
    shapes,
    bounds: {
      minX: Number.isFinite(minX) ? minX : 0,
      maxX: Number.isFinite(maxX) ? maxX : 0,
      minY: Number.isFinite(minY) ? minY : 0,
      maxY: Number.isFinite(maxY) ? maxY : 0,
      width: Math.max(0.1, Number.isFinite(maxX - minX) ? maxX - minX : 0),
      height: Math.max(0.1, Number.isFinite(maxY - minY) ? maxY - minY : 0),
    },
  };
}

function generateTextShapes(THREE, font, text, fontSize, letterSpacing = 0.3) {
  if (!font || !text || text.trim().length === 0) {
    return {
      shapes: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 },
    };
  }

  const commands = [];
  let cursorX = 0;

  for (let i = 0; i < text.length; i++) {
    const glyph = font.charToGlyph(text[i]);
    const glyphPath = glyph.getPath(cursorX, 0, fontSize);
    for (const cmd of glyphPath.commands) {
      commands.push(cmd);
    }
    const glyphAdvance = (glyph.advanceWidth ? glyph.advanceWidth / font.unitsPerEm : 0.6) * fontSize;
    cursorX += glyphAdvance + letterSpacing;
  }

  return opentypeCommandsToShapes(THREE, commands);
}

function combineGeometries(THREE, geomA, geomB) {
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

function analyzeMeshWatertightness(THREE, geometry) {
  const pos = geometry.attributes.position;
  if (!pos || pos.count === 0) {
    return {
      isWatertight: false,
      boundaryEdges: 0,
      nonManifoldEdges: 0,
      vertexCount: 0,
      triangleCount: 0,
      volumeMm3: 0,
      volumeCm3: 0,
      weightGramsPLA: 0,
      estimatedPrintMinutes: 0,
    };
  }

  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }

  const spatialKey = (i) => {
    const x = Math.round(pos.getX(i) * 1000);
    const y = Math.round(pos.getY(i) * 1000);
    const z = Math.round(pos.getZ(i) * 1000);
    return `${x},${y},${z}`;
  };

  const edgeMap = new Map();
  let totalTriangles = 0;
  let signedVolume = 0;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const cross = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();

  const isIndexed = geometry.index !== null;
  const index = geometry.index;
  const loopCount = isIndexed ? index.count : pos.count;

  for (let i = 0; i < loopCount; i += 3) {
    const idx0 = isIndexed ? index.getX(i) : i;
    const idx1 = isIndexed ? index.getX(i + 1) : i + 1;
    const idx2 = isIndexed ? index.getX(i + 2) : i + 2;

    totalTriangles++;

    vA.fromBufferAttribute(pos, idx0);
    vB.fromBufferAttribute(pos, idx1);
    vC.fromBufferAttribute(pos, idx2);

    edge1.subVectors(vB, vA);
    edge2.subVectors(vC, vA);
    cross.crossVectors(edge1, edge2);
    signedVolume += vA.dot(cross) / 6.0;

    const k0 = spatialKey(idx0);
    const k1 = spatialKey(idx1);
    const k2 = spatialKey(idx2);

    const edges = [
      k0 < k1 ? `${k0}|${k1}` : `${k1}|${k0}`,
      k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`,
      k2 < k0 ? `${k2}|${k0}` : `${k0}|${k2}`,
    ];

    for (const e of edges) {
      edgeMap.set(e, (edgeMap.get(e) || 0) + 1);
    }
  }

  let boundaryEdges = 0;
  let nonManifoldEdges = 0;

  for (const count of edgeMap.values()) {
    if (count === 1) boundaryEdges++;
    else if (count > 2) nonManifoldEdges++;
  }

  const isWatertight = boundaryEdges === 0 && nonManifoldEdges === 0 && totalTriangles > 0;
  const volumeMm3 = Math.max(0, Math.abs(signedVolume));
  const volumeCm3 = volumeMm3 / 1000;
  const weightGramsPLA = Math.round(volumeCm3 * 1.24 * 100) / 100;
  const estimatedPrintMinutes = Math.max(3, Math.round(3 + volumeCm3 * 3.5));

  return {
    isWatertight,
    boundaryEdges,
    nonManifoldEdges,
    vertexCount: pos.count,
    triangleCount: totalTriangles,
    volumeMm3,
    volumeCm3,
    weightGramsPLA,
    estimatedPrintMinutes,
  };
}

/**
 * Pure standalone 3D geometry generator for Modular Desk Organizer & Tray Forge.
 * @param {Object} params - { p1..p22 } mapped from schema.json
 * @param {Object} cadKernel - { THREE, Evaluator, Brush, ADDITION, SUBTRACTION, font }
 */
export function generateModel(params, cadKernel) {
  const THREE = cadKernel?.THREE;
  if (!THREE) {
    throw new Error('cadKernel.THREE is required to generate desk-organizer-box geometry.');
  }

  const Evaluator = cadKernel?.Evaluator || cadKernel?.csg?.Evaluator;
  const Brush = cadKernel?.Brush || cadKernel?.csg?.Brush;
  const ADDITION = cadKernel?.ADDITION ?? cadKernel?.csg?.ADDITION ?? 0;
  const SUBTRACTION = cadKernel?.SUBTRACTION ?? cadKernel?.csg?.SUBTRACTION ?? 1;
  const font = cadKernel?.font || null;

  const width = Number(params.p1 ?? 120.0);
  const depth = Number(params.p2 ?? 80.0);
  const height = Number(params.p3 ?? 45.0);
  const wallThickness = Number(params.p4 ?? 2.4);
  const floorThickness = Number(params.p5 ?? 2.4);
  const filletRadius = Number(params.p6 ?? 5.0);
  const edgeBevel = Number(params.p7 ?? 0.6);
  const gridColumns = Number(params.p8 ?? 2);
  const gridRows = Number(params.p9 ?? 2);
  const dividerThickness = Number(params.p10 ?? 1.8);
  const dividerHeightPercent = Number(params.p11 ?? 100);
  const hasScoop = params.p12 ?? true;
  const scoopRadius = Number(params.p13 ?? 6.0);
  const hasStackingLip = params.p14 ?? false;
  const stackingLipHeight = Number(params.p15 ?? 3.0);
  const hasLabel = params.p16 ?? true;
  const labelText = String(params.p17 ?? 'ORGANIZER');
  const labelFontSize = Number(params.p18 ?? 7.0);
  const labelStyle = params.p19 ?? 'embossed';
  const labelRelief = Number(params.p20 ?? 1.0);
  const textPosition = params.p21 ?? 'front_center';
  const textVerticalOffset = Number(params.p22 ?? 0);

  const cols = Math.max(1, Math.min(6, Math.round(gridColumns)));
  const rows = Math.max(1, Math.min(5, Math.round(gridRows)));

  const totalInnerWidth = Math.max(10, width - 2 * wallThickness - (cols - 1) * dividerThickness);
  const totalInnerDepth = Math.max(10, depth - 2 * wallThickness - (rows - 1) * dividerThickness);
  const pocketWidth = totalInnerWidth / cols;
  const pocketDepth = totalInnerDepth / rows;
  const pocketHeight = height - floorThickness;

  const outerShape = createRoundedRectShape(THREE, width, depth, filletRadius);
  const outerGeo = new THREE.ExtrudeGeometry(outerShape, {
    depth: height,
    bevelEnabled: edgeBevel > 0.05,
    bevelSegments: 3,
    steps: 1,
    bevelSize: Math.min(edgeBevel, wallThickness * 0.4),
    bevelThickness: Math.min(edgeBevel, 1.5),
  });
  outerGeo.computeVertexNormals();

  const canCSG = Boolean(Evaluator && Brush);
  if (!canCSG) {
    throw new Error('cadKernel requires CSG Evaluator & Brush to carve desk-organizer-box pockets.');
  }

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  let currentBrush = new Brush(outerGeo);
  currentBrush.updateMatrixWorld();

  const cavityCornerRadius = Math.max(0.5, Math.min(filletRadius - wallThickness, 8));
  const pocketShapes = [];

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const posX = -width / 2 + wallThickness + c * (pocketWidth + dividerThickness) + pocketWidth / 2;
      const posY = -depth / 2 + wallThickness + r * (pocketDepth + dividerThickness) + pocketDepth / 2;

      const pShape = new THREE.Shape();
      const px = posX - pocketWidth / 2;
      const py = posY - pocketDepth / 2;
      const pr = Math.min(cavityCornerRadius, Math.min(pocketWidth, pocketDepth) / 2);

      pShape.moveTo(px + pr, py);
      pShape.lineTo(px + pocketWidth - pr, py);
      pShape.quadraticCurveTo(px + pocketWidth, py, px + pocketWidth, py + pr);
      pShape.lineTo(px + pocketWidth, py + pocketDepth - pr);
      pShape.quadraticCurveTo(px + pocketWidth, py + pocketDepth, px + pocketWidth - pr, py + pocketDepth);
      pShape.lineTo(px + pr, py + pocketDepth);
      pShape.quadraticCurveTo(px, py + pocketDepth, px, py + pocketDepth - pr);
      pShape.lineTo(px, py + pr);
      pShape.quadraticCurveTo(px, py, px + pr, py);

      pocketShapes.push(pShape);
    }
  }

  if (pocketShapes.length > 0) {
    const cutHeight = pocketHeight + 4.0;
    const combinedPocketGeo = new THREE.ExtrudeGeometry(pocketShapes, {
      depth: cutHeight,
      bevelEnabled: false,
      curveSegments: 12,
    });
    combinedPocketGeo.translate(0, 0, floorThickness);
    combinedPocketGeo.computeVertexNormals();

    const pocketsBrush = new Brush(combinedPocketGeo);
    pocketsBrush.updateMatrixWorld();

    currentBrush = evaluator.evaluate(currentBrush, pocketsBrush, SUBTRACTION);
    currentBrush.updateMatrixWorld();
  }

  if (hasStackingLip) {
    const lipInset = wallThickness * 0.4;
    const lipShape = createRoundedRectShape(
      THREE,
      width - lipInset,
      depth - lipInset,
      Math.max(1, filletRadius - lipInset / 2)
    );
    const lipCutter = new THREE.ExtrudeGeometry(lipShape, {
      depth: stackingLipHeight + 1.0,
      bevelEnabled: false,
    });
    lipCutter.translate(0, 0, height - stackingLipHeight);
    lipCutter.computeVertexNormals();

    const lipBrush = new Brush(lipCutter);
    lipBrush.updateMatrixWorld();

    currentBrush = evaluator.evaluate(currentBrush, lipBrush, SUBTRACTION);
    currentBrush.updateMatrixWorld();
  }

  let textGeometry = undefined;

  if (hasLabel && labelText && labelText.trim().length > 0 && font) {
    const textResult = generateTextShapes(THREE, font, labelText.trim(), labelFontSize, 0.3);

    if (textResult.shapes.length > 0) {
      const rawTextGeo = new THREE.ExtrudeGeometry(textResult.shapes, {
        depth: labelRelief,
        bevelEnabled: false,
        steps: 1,
      });
      rawTextGeo.computeBoundingBox();

      const tb = rawTextGeo.boundingBox || new THREE.Box3();
      const textW = Math.max(0.1, tb.max.x - tb.min.x);
      const textH = Math.max(0.1, tb.max.y - tb.min.y);

      const minFlatX = -width / 2 + filletRadius + 2.5;
      const maxFlatX = width / 2 - filletRadius - 2.5;
      const availFlatW = Math.max(10.0, maxFlatX - minFlatX);

      const minZ = Math.max(1.5, floorThickness * 0.5);
      const topLipMargin = hasStackingLip ? (stackingLipHeight || 3.0) : 0;
      const maxZ = Math.max(minZ + 4.0, height - topLipMargin - edgeBevel - 2.5);
      const availFlatH = Math.max(4.0, maxZ - minZ);

      const fitScaleX = textW > availFlatW ? availFlatW / textW : 1.0;
      const fitScaleZ = textH > availFlatH ? availFlatH / textH : 1.0;
      const uniformScale = Math.min(fitScaleX, fitScaleZ, 1.0);

      rawTextGeo.scale(uniformScale, uniformScale, 1.0);
      rawTextGeo.translate(-tb.min.x * uniformScale, -tb.min.y * uniformScale, 0);

      const actualW = textW * uniformScale;
      const actualH = textH * uniformScale;

      rawTextGeo.rotateX(Math.PI / 2);

      let targetX = -actualW / 2;
      if (textPosition === 'front_left') {
        targetX = minFlatX + 1.0;
      } else if (textPosition === 'front_right') {
        targetX = maxFlatX - actualW - 1.0;
      }
      const xPos = Math.max(minFlatX, Math.min(maxFlatX - actualW, targetX));

      const midZ = minZ + (availFlatH - actualH) / 2;
      let targetZ = midZ + textVerticalOffset;
      if (textPosition === 'front_top') {
        targetZ = maxZ - actualH - 0.5 + textVerticalOffset;
      } else if (textPosition === 'front_bottom') {
        targetZ = minZ + 0.5 + textVerticalOffset;
      }
      const zPos = Math.max(minZ, Math.min(maxZ - actualH, targetZ));

      currentBrush.geometry.computeBoundingBox();
      const boxBounds = currentBrush.geometry.boundingBox;
      const frontWallY = boxBounds ? boxBounds.min.y : -depth / 2;

      if (labelStyle === 'embossed') {
        const yPos = frontWallY + 0.15;
        rawTextGeo.translate(xPos, yPos, zPos);
        rawTextGeo.computeVertexNormals();
        textGeometry = rawTextGeo;
      } else {
        const yPos = frontWallY + labelRelief + 0.1;
        rawTextGeo.translate(xPos, yPos, zPos);
        rawTextGeo.computeVertexNormals();

        const debossBrush = new Brush(rawTextGeo);
        debossBrush.updateMatrixWorld();
        currentBrush = evaluator.evaluate(currentBrush, debossBrush, SUBTRACTION);
        currentBrush.updateMatrixWorld();
      }
    }
  }

  const baseGeometry = currentBrush.geometry.clone();
  baseGeometry.computeVertexNormals();

  let exportGeometry;
  if (textGeometry && labelStyle === 'embossed') {
    try {
      const textBrush = new Brush(textGeometry);
      textBrush.updateMatrixWorld();
      const unionBrush = evaluator.evaluate(currentBrush, textBrush, ADDITION);
      exportGeometry = unionBrush.geometry.clone();
    } catch {
      exportGeometry = combineGeometries(THREE, baseGeometry, textGeometry);
    }
  } else {
    exportGeometry = baseGeometry.clone();
  }
  exportGeometry.computeVertexNormals();

  const analysis = analyzeMeshWatertightness(THREE, exportGeometry);
  const volumeCm3 = Math.round(analysis.volumeCm3 * 10) / 10;
  const weightGramsPLA = Math.round(volumeCm3 * 1.24 * 10) / 10;
  const estimatedLayers = Math.round(height / 0.2);
  const estimatedPrintMinutes = Math.round(volumeCm3 * 1.24 * 4.2 + 15);

  return {
    geometry: exportGeometry,
    baseGeometry,
    textGeometry,
    bounds: {
      minX: -width / 2,
      maxX: width / 2,
      minY: -depth / 2,
      maxY: depth / 2,
      width,
      height: depth,
    },
    dimensions: {
      totalLength: Math.round(width * 10) / 10,
      totalWidth: Math.round(depth * 10) / 10,
      totalHeight: Math.round(height * 10) / 10,
      wallThickness,
      floorThickness,
      compartmentWidth: Math.round(pocketWidth * 10) / 10,
      compartmentDepth: Math.round(pocketDepth * 10) / 10,
      compartmentHeight: Math.round(pocketHeight * 10) / 10,
      compartmentCount: cols * rows,
      dividerHeightPercent,
      hasScoop,
      scoopRadius,
      volumeCm3,
      weightGramsPLA,
      estimatedPrintMinutes,
      estimatedLayers,
      isWatertight: analysis.isWatertight,
      vertexCount: analysis.vertexCount,
      triangleCount: analysis.triangleCount,
      boundaryEdges: analysis.boundaryEdges,
      nonManifoldEdges: analysis.nonManifoldEdges,
    },
  };
}
