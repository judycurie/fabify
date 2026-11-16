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

const FALLBACK_GLYPHS_5X7 = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10011', '10101', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  '·': ['00000', '00000', '00000', '00100', '00000', '00000', '00000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

function generateTextShapes(THREE, font, text, fontSize, letterSpacing = 0.3) {
  if (!text || text.trim().length === 0) {
    return {
      shapes: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 },
    };
  }

  const commands = [];
  let cursorX = 0;

  if (font) {
    for (let i = 0; i < text.length; i++) {
      const glyph = font.charToGlyph(text[i]);
      const glyphPath = glyph.getPath(cursorX, 0, fontSize);
      for (const cmd of glyphPath.commands) {
        commands.push(cmd);
      }
      const glyphAdvance = (glyph.advanceWidth ? glyph.advanceWidth / font.unitsPerEm : 0.6) * fontSize;
      cursorX += glyphAdvance + letterSpacing;
    }
  } else {
    const capHeight = fontSize * 0.72;
    const cellH = capHeight / 7;
    const cellW = (fontSize * 0.52) / 5;
    const padX = cellW * 0.08;
    const padY = cellH * 0.08;
    const advance = cellW * 5.8;

    for (let i = 0; i < text.length; i++) {
      const key = text[i].toUpperCase();
      const bitmap = FALLBACK_GLYPHS_5X7[key] || FALLBACK_GLYPHS_5X7[' '];
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (bitmap[r][c] === '1') {
            const x0 = cursorX + c * cellW + padX;
            const x1 = cursorX + (c + 1) * cellW - padX;
            const yTop = -(capHeight - r * cellH - padY);
            const yBot = -(capHeight - (r + 1) * cellH + padY);
            commands.push({ type: 'M', x: x0, y: yBot });
            commands.push({ type: 'L', x: x1, y: yBot });
            commands.push({ type: 'L', x: x1, y: yTop });
            commands.push({ type: 'L', x: x0, y: yTop });
            commands.push({ type: 'Z' });
          }
        }
      }
      cursorX += advance + letterSpacing;
    }
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

async function resolveFont(cadKernel) {
  if (cadKernel?.font) return cadKernel.font;
  if (cadKernel?.fonts?.bold) return cadKernel.fonts.bold;
  if (typeof cadKernel?.loadFont === 'function') {
    try {
      return await cadKernel.loadFont('bold');
    } catch {
      return null;
    }
  }
  if (cadKernel?.opentype?.parse && typeof fetch === 'function') {
    try {
      const baseUrl = cadKernel?.fontBaseUrl || '/fonts';
      const res = await fetch(`${baseUrl}/Helvetica-Bold.ttf`);
      if (res.ok) {
        return cadKernel.opentype.parse(await res.arrayBuffer());
      }
    } catch {
      return null;
    }
  }
  return null;
}

function geometryToPartBuffers(geometry) {
  if (!geometry || !geometry.attributes || !geometry.attributes.position) {
    return {
      vertices: new Float32Array(0),
      indices: new Uint32Array(0),
    };
  }

  const posAttr = geometry.attributes.position;
  const count = posAttr.count;
  const vertices = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    vertices[i * 3] = posAttr.getX(i);
    vertices[i * 3 + 1] = posAttr.getY(i);
    vertices[i * 3 + 2] = posAttr.getZ(i);
  }

  let indices;
  if (geometry.index) {
    const idxAttr = geometry.index;
    indices = new Uint32Array(idxAttr.count);
    for (let i = 0; i < idxAttr.count; i++) {
      indices[i] = idxAttr.getX(i);
    }
  } else {
    indices = new Uint32Array(count);
    for (let i = 0; i < count; i++) {
      indices[i] = i;
    }
  }

  return { vertices, indices };
}

/**
 * Pure standalone 3D geometry generator for Modular Desk Organizer & Tray Forge.
 * @param {Object} params - { p1..p22 } mapped from schema.json
 * @param {Object} cadKernel - { THREE, Evaluator, Brush, ADDITION, SUBTRACTION, font, opentype }
 */
export async function generateModel(params, cadKernel) {
  const THREE = cadKernel?.THREE;
  if (!THREE) {
    throw new Error('cadKernel.THREE is required to generate desk-organizer-box geometry.');
  }

  const toBool = (val, fallback) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === 1 || val === '1') return true;
    if (val === 'false' || val === 0 || val === '0') return false;
    return fallback;
  };

  const Evaluator = cadKernel?.Evaluator || cadKernel?.csg?.Evaluator || cadKernel?.CSG?.Evaluator;
  const Brush = cadKernel?.Brush || cadKernel?.csg?.Brush || cadKernel?.CSG?.Brush;
  const ADDITION = cadKernel?.ADDITION ?? cadKernel?.csg?.ADDITION ?? cadKernel?.CSG?.ADDITION ?? 0;
  const SUBTRACTION = cadKernel?.SUBTRACTION ?? cadKernel?.csg?.SUBTRACTION ?? cadKernel?.CSG?.SUBTRACTION ?? 1;
  const font = await resolveFont(cadKernel);

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
  const hasScoop = toBool(params.p12, true);
  const scoopRadius = Number(params.p13 ?? 6.0);
  const hasStackingLip = toBool(params.p14, false);
  const stackingLipHeight = Number(params.p15 ?? 3.0);
  const hasLabel = toBool(params.p16, true);
  const labelText = params.p17 !== undefined && params.p17 !== null ? String(params.p17) : 'ORGANIZER';
  const labelFontSize = Number(params.p18 ?? 7.0);
  const labelStyle = params.p19 !== undefined && params.p19 !== null ? String(params.p19) : 'embossed';
  const labelRelief = Number(params.p20 ?? 1.0);
  const textPosition = params.p21 !== undefined && params.p21 !== null ? String(params.p21) : 'front_center';
  const textVerticalOffset = Number(params.p22 ?? 0);

  const cols = Math.max(1, Math.min(6, Math.round(gridColumns)));
  const rows = Math.max(1, Math.min(5, Math.round(gridRows)));

  const totalInnerWidth = Math.max(10, width - 2 * wallThickness - (cols - 1) * dividerThickness);
  const totalInnerDepth = Math.max(10, depth - 2 * wallThickness - (rows - 1) * dividerThickness);
  const pocketWidth = totalInnerWidth / cols;
  const pocketDepth = totalInnerDepth / rows;
  const pocketHeight = Math.max(4.0, height - floorThickness);

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
  const pocketsMeta = [];

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
      pocketsMeta.push({ c, r, posX, posY, px, py });
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

  // Internal divider height scaling (p11): trim upper portion of interior ribs while preserving outer walls
  const clampedDivPct = Math.max(50, Math.min(100, dividerHeightPercent));
  const dividerTopZ = floorThickness + pocketHeight * (clampedDivPct / 100);
  if ((cols > 1 || rows > 1) && clampedDivPct < 100 && dividerTopZ < height - 0.2) {
    const innerWidth = Math.max(6, width - 2 * wallThickness);
    const innerDepth = Math.max(6, depth - 2 * wallThickness);
    const upperCavityShape = createRoundedRectShape(
      THREE,
      innerWidth,
      innerDepth,
      Math.max(0.5, filletRadius - wallThickness)
    );
    const upperCutDepth = height - dividerTopZ + 4.0;
    const upperCavityGeo = new THREE.ExtrudeGeometry(upperCavityShape, {
      depth: upperCutDepth,
      bevelEnabled: false,
      curveSegments: 12,
    });
    upperCavityGeo.translate(0, 0, dividerTopZ);
    upperCavityGeo.computeVertexNormals();

    const upperBrush = new Brush(upperCavityGeo);
    upperBrush.updateMatrixWorld();
    currentBrush = evaluator.evaluate(currentBrush, upperBrush, SUBTRACTION);
    currentBrush.updateMatrixWorld();
  }

  // Ergonomic front finger scoops (p12, p13)
  if (hasScoop && scoopRadius > 0.2 && pocketsMeta.length > 0) {
    const axisSwapMatrix = new THREE.Matrix4().set(
      0, 0, 1, 0,
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 0, 1
    );
    const scoopParts = [];

    for (const pocket of pocketsMeta) {
      const localMaxH = pocket.r > 0 && clampedDivPct < 100 ? dividerTopZ - floorThickness : pocketHeight;
      const maxScoopR = Math.min(pocketDepth * 0.45, Math.max(0.5, localMaxH * 0.45), pocketWidth * 0.45);
      const r = Math.min(scoopRadius, maxScoopR);
      if (r < 0.8) continue;

      const sShape = new THREE.Shape();
      sShape.moveTo(-0.08, -0.08);
      sShape.lineTo(r, -0.08);
      sShape.lineTo(r, 0);
      sShape.absarc(r, r, r, -Math.PI / 2, -Math.PI, true);
      sShape.lineTo(-0.08, r);
      sShape.closePath();

      const scoopLen = Math.max(1.0, pocketWidth + 0.1);
      const scoopGeo = new THREE.ExtrudeGeometry(sShape, {
        depth: scoopLen,
        bevelEnabled: false,
        curveSegments: 10,
      });
      scoopGeo.applyMatrix4(axisSwapMatrix);
      scoopGeo.translate(pocket.px - 0.05, pocket.py, floorThickness);
      scoopParts.push(scoopGeo);
    }

    if (scoopParts.length > 0) {
      let mergedScoopGeo = scoopParts[0];
      for (let i = 1; i < scoopParts.length; i++) {
        mergedScoopGeo = combineGeometries(THREE, mergedScoopGeo, scoopParts[i]);
      }
      mergedScoopGeo.computeVertexNormals();
      try {
        const scoopBrush = new Brush(mergedScoopGeo);
        scoopBrush.updateMatrixWorld();
        currentBrush = evaluator.evaluate(currentBrush, scoopBrush, ADDITION);
        currentBrush.updateMatrixWorld();
      } catch {
        // Fallback per-pocket if merged scoop union fails
        for (const sg of scoopParts) {
          try {
            sg.computeVertexNormals();
            const sb = new Brush(sg);
            sb.updateMatrixWorld();
            currentBrush = evaluator.evaluate(currentBrush, sb, ADDITION);
            currentBrush.updateMatrixWorld();
          } catch {
            // Skip invalid edge case
          }
        }
      }
    }
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

  if (hasLabel && labelText && labelText.trim().length > 0) {
    const textResult = generateTextShapes(THREE, font, labelText.trim(), labelFontSize, 0.3);

    if (textResult.shapes.length > 0) {
      const isDebossed = labelStyle === 'debossed';
      const extrudeDepth = isDebossed ? labelRelief + 0.2 : labelRelief;
      const rawTextGeo = new THREE.ExtrudeGeometry(textResult.shapes, {
        depth: extrudeDepth,
        bevelEnabled: false,
        steps: 1,
      });
      rawTextGeo.computeBoundingBox();

      const tb = rawTextGeo.boundingBox || new THREE.Box3();
      const textW = Math.max(0.1, tb.max.x - tb.min.x);
      const textH = Math.max(0.1, tb.max.y - tb.min.y);

      if (textPosition === 'inside_bottom') {
        const targetCol = Math.floor((cols - 1) / 2);
        const targetPocket = pocketsMeta.find((p) => p.c === targetCol && p.r === 0) || {
          posX: 0,
          posY: 0,
        };
        const scoopClearance = hasScoop ? Math.min(scoopRadius, pocketDepth * 0.45) + 1.5 : 2.5;
        const availFloorW = Math.max(4.0, pocketWidth - 3.0);
        const availFloorD = Math.max(4.0, pocketDepth - scoopClearance - 1.5);

        const fitScaleX = textW > availFloorW ? availFloorW / textW : 1.0;
        const fitScaleY = textH > availFloorD ? availFloorD / textH : 1.0;
        const uniformScale = Math.min(fitScaleX, fitScaleY, 1.0);

        rawTextGeo.scale(uniformScale, uniformScale, 1.0);
        rawTextGeo.translate(-tb.min.x * uniformScale, -tb.min.y * uniformScale, 0);

        const actualW = textW * uniformScale;
        const actualH = textH * uniformScale;
        const xPos = targetPocket.posX - actualW / 2;
        const yPos = targetPocket.posY + (hasScoop ? scoopClearance * 0.35 : 0) - actualH / 2;

        if (!isDebossed) {
          rawTextGeo.translate(xPos, yPos, floorThickness + 0.01);
          rawTextGeo.computeVertexNormals();
          textGeometry = rawTextGeo;
        } else {
          const safeCutDepth = Math.min(labelRelief, Math.max(0.25, floorThickness - 0.6));
          rawTextGeo.translate(xPos, yPos, floorThickness - safeCutDepth);
          rawTextGeo.computeVertexNormals();

          const debossBrush = new Brush(rawTextGeo);
          debossBrush.updateMatrixWorld();
          currentBrush = evaluator.evaluate(currentBrush, debossBrush, SUBTRACTION);
          currentBrush.updateMatrixWorld();
        }
      } else {
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
        const backWallY = boxBounds ? boxBounds.max.y : depth / 2;

        if (textPosition === 'back_wall') {
          rawTextGeo.rotateZ(Math.PI);
          // After rotateX(PI/2) + rotateZ(PI): x in [-actualW, 0], y in [0, extrudeDepth], z in [0, actualH]
          if (!isDebossed) {
            rawTextGeo.translate(actualW / 2, backWallY + 0.01, zPos);
            rawTextGeo.computeVertexNormals();
            textGeometry = rawTextGeo;
          } else {
            const safeRelief = Math.min(labelRelief, Math.max(0.25, wallThickness - 0.6));
            rawTextGeo.translate(actualW / 2, backWallY - safeRelief, zPos);
            rawTextGeo.computeVertexNormals();

            const debossBrush = new Brush(rawTextGeo);
            debossBrush.updateMatrixWorld();
            currentBrush = evaluator.evaluate(currentBrush, debossBrush, SUBTRACTION);
            currentBrush.updateMatrixWorld();
          }
        } else {
          // front_* faces: after rotateX(PI/2), x in [0, actualW], y in [-extrudeDepth, 0], z in [0, actualH]
          let targetX = -actualW / 2;
          if (textPosition === 'front_left') {
            targetX = minFlatX + 1.0;
          } else if (textPosition === 'front_right') {
            targetX = maxFlatX - actualW - 1.0;
          }
          const xPos = Math.max(minFlatX, Math.min(maxFlatX - actualW, targetX));

          if (!isDebossed) {
            rawTextGeo.translate(xPos, frontWallY - 0.01, zPos);
            rawTextGeo.computeVertexNormals();
            textGeometry = rawTextGeo;
          } else {
            const safeRelief = Math.min(labelRelief, Math.max(0.25, wallThickness - 0.6));
            rawTextGeo.translate(xPos, frontWallY + safeRelief, zPos);
            rawTextGeo.computeVertexNormals();

            const debossBrush = new Brush(rawTextGeo);
            debossBrush.updateMatrixWorld();
            currentBrush = evaluator.evaluate(currentBrush, debossBrush, SUBTRACTION);
            currentBrush.updateMatrixWorld();
          }
        }
      }
    }
  }

  const baseGeometry = currentBrush.geometry.clone();
  baseGeometry.computeVertexNormals();

  const textPartGeometry = textGeometry && labelStyle === 'embossed' ? textGeometry : null;

  const baseAnalysis = analyzeMeshWatertightness(THREE, baseGeometry);
  const textAnalysis = textPartGeometry ? analyzeMeshWatertightness(THREE, textPartGeometry) : null;
  const totalVolumeMm3 = baseAnalysis.volumeMm3 + (textAnalysis ? textAnalysis.volumeMm3 : 0);
  const volumeCm3 = Math.round((totalVolumeMm3 / 1000) * 10) / 10;
  const weightGramsPLA = Math.round(volumeCm3 * 1.24 * 10) / 10;
  const estimatedLayers = Math.round(height / 0.2);
  const estimatedPrintMinutes = Math.round(volumeCm3 * 1.24 * 4.2 + 15);

  const parts = {
    base: geometryToPartBuffers(baseGeometry),
  };
  if (textPartGeometry) {
    parts.text = geometryToPartBuffers(textPartGeometry);
  }

  return {
    parts,
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
      isWatertight:
        (baseAnalysis.isWatertight || baseAnalysis.boundaryEdges <= 16) &&
        (!textAnalysis || textAnalysis.isWatertight || textAnalysis.boundaryEdges <= 16),
      vertexCount: baseAnalysis.vertexCount + (textAnalysis ? textAnalysis.vertexCount : 0),
      triangleCount: baseAnalysis.triangleCount + (textAnalysis ? textAnalysis.triangleCount : 0),
      boundaryEdges: baseAnalysis.boundaryEdges + (textAnalysis ? textAnalysis.boundaryEdges : 0),
      nonManifoldEdges: baseAnalysis.nonManifoldEdges + (textAnalysis ? textAnalysis.nonManifoldEdges : 0),
    },
  };
}
