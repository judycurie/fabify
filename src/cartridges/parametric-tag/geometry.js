/**
 * Standalone Pure ES Module: Parametric Tag & Keyring Forge Geometry Engine
 * Zero external relative imports, zero DOM/React/Three.js scene setup.
 */

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
      if (currentContour.length > 0) {
        contours.push(currentContour);
      }
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

  if (currentContour.length > 0) {
    contours.push(currentContour);
  }

  if (contours.length === 0) {
    return {
      shapes: [],
      holeIslands: [],
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
  const holeIslands = [];

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

        let hminX = Infinity, hmaxX = -Infinity, hminY = Infinity, hmaxY = -Infinity;
        for (const pt of item.pts) {
          if (pt.x < hminX) hminX = pt.x;
          if (pt.x > hmaxX) hmaxX = pt.x;
          if (pt.y < hminY) hminY = pt.y;
          if (pt.y > hmaxY) hmaxY = pt.y;
        }
        holeIslands.push({
          cx: (hminX + hmaxX) / 2,
          cy: (hminY + hmaxY) / 2,
          minX: hminX,
          maxX: hmaxX,
          minY: hminY,
          maxY: hmaxY,
          width: hmaxX - hminX,
          height: hmaxY - hminY,
        });
      }
    }
  }

  const width = Math.max(0.1, Number.isFinite(maxX - minX) ? maxX - minX : 0);
  const height = Math.max(0.1, Number.isFinite(maxY - minY) ? maxY - minY : 0);

  return {
    shapes,
    holeIslands,
    bounds: {
      minX: Number.isFinite(minX) ? minX : 0,
      maxX: Number.isFinite(maxX) ? maxX : 0,
      minY: Number.isFinite(minY) ? minY : 0,
      maxY: Number.isFinite(maxY) ? maxY : 0,
      width,
      height,
    },
  };
}

function translateCommands(commands, dx, dy) {
  return commands.map((cmd) => {
    const c = { ...cmd };
    if ('x' in c && typeof c.x === 'number') c.x += dx;
    if ('y' in c && typeof c.y === 'number') c.y -= dy;
    if ('x1' in c && typeof c.x1 === 'number') c.x1 += dx;
    if ('y1' in c && typeof c.y1 === 'number') c.y1 -= dy;
    if ('x2' in c && typeof c.x2 === 'number') c.x2 += dx;
    if ('y2' in c && typeof c.y2 === 'number') c.y2 -= dy;
    return c;
  });
}

function getLineCommandsAndBounds(font, text, fontSize, letterSpacing) {
  const commands = [];
  let cursorX = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const glyph = font.charToGlyph(char);
    const glyphPath = glyph.getPath(cursorX, 0, fontSize);

    for (const cmd of glyphPath.commands) {
      commands.push(cmd);
      if ('x' in cmd && typeof cmd.x === 'number') {
        const x = cmd.x;
        const y = -cmd.y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    const glyphAdvance = (glyph.advanceWidth ? glyph.advanceWidth / font.unitsPerEm : 0.6) * fontSize;
    cursorX += glyphAdvance + letterSpacing;
  }

  if (!Number.isFinite(minX)) {
    minX = 0;
    maxX = 0;
    minY = 0;
    maxY = 0;
  }

  return {
    commands,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(0.01, maxX - minX),
      height: Math.max(0.01, maxY - minY),
    },
  };
}

function generateMultiLineTextShapes(THREE, font, opts) {
  const t1 = opts.text1 ? opts.text1.trim() : '';
  const hasLine2 = !!opts.hasSecondLine && !!opts.text2 && opts.text2.trim().length > 0;
  const t2 = hasLine2 ? opts.text2.trim() : '';
  const lSpacing = opts.letterSpacing || 0;

  if (!font || (t1.length === 0 && (!hasLine2 || t2.length === 0))) {
    return {
      shapes: [],
      holeIslands: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 },
      rawCenterX: 0,
      rawCenterY: 0,
    };
  }

  const line1Res = t1.length > 0 ? getLineCommandsAndBounds(font, t1, opts.fontSize1, lSpacing) : null;
  const line2Res = hasLine2 && t2.length > 0 ? getLineCommandsAndBounds(font, t2, opts.fontSize2 || opts.fontSize1, lSpacing) : null;

  const allCommands = [];

  if (line1Res && line2Res) {
    const b1 = line1Res.bounds;
    const b2 = line2Res.bounds;
    const gap = Math.max(0.5, opts.lineSpacing ?? 2.0);

    const cx1 = (b1.minX + b1.maxX) / 2;
    const cx2 = (b2.minX + b2.maxX) / 2;
    const dx1 = -cx1;
    const dx2 = -cx2;

    let dy1 = gap / 2 - b1.minY;
    let dy2 = -gap / 2 - b2.maxY;
    const yOffset = (b1.height - b2.height) / 2;
    dy1 -= yOffset;
    dy2 -= yOffset;

    allCommands.push(...translateCommands(line1Res.commands, dx1, dy1));
    allCommands.push(...translateCommands(line2Res.commands, dx2, dy2));
  } else if (line1Res) {
    const b1 = line1Res.bounds;
    const cx1 = (b1.minX + b1.maxX) / 2;
    const cy1 = (b1.minY + b1.maxY) / 2;
    allCommands.push(...translateCommands(line1Res.commands, -cx1, -cy1));
  } else if (line2Res) {
    const b2 = line2Res.bounds;
    const cx2 = (b2.minX + b2.maxX) / 2;
    const cy2 = (b2.minY + b2.maxY) / 2;
    allCommands.push(...translateCommands(line2Res.commands, -cx2, -cy2));
  }

  const { shapes, holeIslands, bounds } = opentypeCommandsToShapes(THREE, allCommands);

  return {
    shapes,
    holeIslands,
    bounds,
    rawCenterX: (bounds.minX + bounds.maxX) / 2,
    rawCenterY: (bounds.minY + bounds.maxY) / 2,
  };
}

function buildTagBase2DShape(THREE, config, textW, textH) {
  const pad = Math.max(0.5, config.padding);
  const holeR = Math.max(1.0, config.holeDiameter / 2);
  const holeMargin = Math.max(1.5, config.holeEdgeMargin);
  const holeSpacing = Math.max(6.0, config.holeSymmetricalSpacing);

  if (config.shape === 'circle') {
    const textDiagRadius = Math.sqrt((textW / 2) * (textW / 2) + (textH / 2) * (textH / 2));
    let baseRadius = textDiagRadius + pad;
    const holes = [];

    if (config.holePlacement === 'top') {
      const requiredHoleClearanceRadius = textH / 2 + 2 * (holeMargin + holeR) + 0.5;
      baseRadius = Math.max(baseRadius, requiredHoleClearanceRadius);
      const holeCenterY = baseRadius - holeMargin - holeR;
      if (config.holeCount === 1) {
        holes.push({ x: 0, y: holeCenterY, diameter: config.holeDiameter });
      } else {
        const halfSpace = Math.min(holeSpacing / 2, baseRadius * 0.5);
        holes.push({ x: -halfSpace, y: holeCenterY, diameter: config.holeDiameter });
        holes.push({ x: halfSpace, y: holeCenterY, diameter: config.holeDiameter });
      }
    } else if (config.holePlacement === 'left') {
      const requiredHoleClearanceRadius = textW / 2 + 2 * (holeMargin + holeR) + 0.5;
      baseRadius = Math.max(baseRadius, requiredHoleClearanceRadius);
      const holeCenterX = -baseRadius + holeMargin + holeR;
      holes.push({ x: holeCenterX, y: 0, diameter: config.holeDiameter });
    } else if (config.holePlacement === 'right') {
      const requiredHoleClearanceRadius = textW / 2 + 2 * (holeMargin + holeR) + 0.5;
      baseRadius = Math.max(baseRadius, requiredHoleClearanceRadius);
      const holeCenterX = baseRadius - holeMargin - holeR;
      holes.push({ x: holeCenterX, y: 0, diameter: config.holeDiameter });
    } else if (config.holePlacement === 'both-ends') {
      const requiredHoleClearanceRadius = textW / 2 + 2 * (holeMargin + holeR) + 0.5;
      baseRadius = Math.max(baseRadius, requiredHoleClearanceRadius);
      const holeDist = baseRadius - holeMargin - holeR;
      holes.push({ x: -holeDist, y: 0, diameter: config.holeDiameter });
      holes.push({ x: holeDist, y: 0, diameter: config.holeDiameter });
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
    };
  }

  let minX = -textW / 2 - pad;
  let maxX = textW / 2 + pad;
  let minY = -textH / 2 - pad;
  let maxY = textH / 2 + pad;

  const holes = [];

  if (config.holePlacement === 'top') {
    const holeCenterY = textH / 2 + pad + holeMargin + holeR;
    maxY = holeCenterY + holeR + holeMargin;

    if (config.holeCount === 1) {
      holes.push({ x: 0, y: holeCenterY, diameter: config.holeDiameter });
    } else {
      const halfSpace = holeSpacing / 2;
      holes.push({ x: -halfSpace, y: holeCenterY, diameter: config.holeDiameter });
      holes.push({ x: halfSpace, y: holeCenterY, diameter: config.holeDiameter });
      minX = Math.min(minX, -halfSpace - holeR - holeMargin);
      maxX = Math.max(maxX, halfSpace + holeR + holeMargin);
    }

    if (config.centerTextInBase) {
      minY = -maxY;
    }
  } else if (config.holePlacement === 'left') {
    const holeCenterX = -textW / 2 - pad - holeMargin - holeR;
    minX = holeCenterX - (holeR + holeMargin);

    if (config.holeCount === 1) {
      holes.push({ x: holeCenterX, y: 0, diameter: config.holeDiameter });
    } else {
      const halfSpace = holeSpacing / 2;
      holes.push({ x: holeCenterX, y: -halfSpace, diameter: config.holeDiameter });
      holes.push({ x: holeCenterX, y: halfSpace, diameter: config.holeDiameter });
      minY = Math.min(minY, -halfSpace - holeR - holeMargin);
      maxY = Math.max(maxY, halfSpace + holeR + holeMargin);
    }

    if (config.centerTextInBase) {
      maxX = -minX;
    }
  } else if (config.holePlacement === 'right') {
    const holeCenterX = textW / 2 + pad + holeMargin + holeR;
    maxX = holeCenterX + holeR + holeMargin;

    if (config.holeCount === 1) {
      holes.push({ x: holeCenterX, y: 0, diameter: config.holeDiameter });
    } else {
      const halfSpace = holeSpacing / 2;
      holes.push({ x: holeCenterX, y: -halfSpace, diameter: config.holeDiameter });
      holes.push({ x: holeCenterX, y: halfSpace, diameter: config.holeDiameter });
      minY = Math.min(minY, -halfSpace - holeR - holeMargin);
      maxY = Math.max(maxY, halfSpace + holeR + holeMargin);
    }

    if (config.centerTextInBase) {
      minX = -maxX;
    }
  } else if (config.holePlacement === 'both-ends') {
    const leftHoleX = -textW / 2 - pad - holeMargin - holeR;
    minX = leftHoleX - (holeR + holeMargin);
    holes.push({ x: leftHoleX, y: 0, diameter: config.holeDiameter });

    const rightHoleX = textW / 2 + pad + holeMargin + holeR;
    maxX = rightHoleX + holeR + holeMargin;
    holes.push({ x: rightHoleX, y: 0, diameter: config.holeDiameter });
  }

  let width = maxX - minX;
  let height = maxY - minY;

  if (config.minBaseLength && width < config.minBaseLength) {
    const expand = (config.minBaseLength - width) / 2;
    minX -= expand;
    maxX += expand;
    width = maxX - minX;

    if (config.holePlacement === 'both-ends' && holes.length >= 2) {
      holes[0].x = minX + holeMargin + holeR;
      holes[1].x = maxX - (holeMargin + holeR);
    } else if (config.holePlacement === 'left' && holes.length >= 1) {
      holes[0].x = minX + holeMargin + holeR;
    } else if (config.holePlacement === 'right' && holes.length >= 1) {
      holes[0].x = maxX - (holeMargin + holeR);
    }
  }

  if (config.maxBaseLength && config.maxBaseLength > 0 && width > config.maxBaseLength) {
    const contract = (width - config.maxBaseLength) / 2;
    minX += contract;
    maxX -= contract;
    width = maxX - minX;
  }

  const maxR = Math.max(0.5, Math.min(width, height) / 2 - 0.05);
  const r = config.shape === 'rectangle'
    ? 0.2
    : Math.min(Math.max(0.2, config.filletRadius), maxR);

  const shape = new THREE.Shape();
  shape.absarc(maxX - r, maxY - r, r, 0, Math.PI / 2, false);
  shape.absarc(minX + r, maxY - r, r, Math.PI / 2, Math.PI, false);
  shape.absarc(minX + r, minY + r, r, Math.PI, Math.PI * 1.5, false);
  shape.absarc(maxX - r, minY + r, r, Math.PI * 1.5, Math.PI * 2, false);
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
  };
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
 * Pure standalone 3D geometry generator for Parametric Tag & Keyring Forge.
 * @param {Object} params - { p1..p28 } mapped from schema.json
 * @param {Object} cadKernel - { THREE, Evaluator, Brush, ADDITION, SUBTRACTION, font }
 */
export function generateModel(params, cadKernel) {
  const THREE = cadKernel?.THREE;
  if (!THREE) {
    throw new Error('cadKernel.THREE is required to generate parametric-tag geometry.');
  }

  const Evaluator = cadKernel?.Evaluator || cadKernel?.csg?.Evaluator;
  const Brush = cadKernel?.Brush || cadKernel?.csg?.Brush;
  const ADDITION = cadKernel?.ADDITION ?? cadKernel?.csg?.ADDITION ?? 0;
  const SUBTRACTION = cadKernel?.SUBTRACTION ?? cadKernel?.csg?.SUBTRACTION ?? 1;
  const font = cadKernel?.font || null;

  const config = {
    shape: params.p1 ?? 'rounded',
    text: params.p2 ?? 'KEYS',
    fontSize: Number(params.p3 ?? 6.8),
    fontVariant: params.p4 ?? 'bold',
    letterSpacing: Number(params.p5 ?? 0.4),
    letterFillet: Number(params.p6 ?? 0),
    isUppercase: params.p7 ?? true,
    hasSecondLine: params.p8 ?? false,
    textLine2: params.p9 ?? 'STUDIO',
    fontSize2: Number(params.p10 ?? 4.5),
    lineSpacing: Number(params.p11 ?? 1.8),
    baseThickness: Number(params.p12 ?? 2.4),
    padding: Number(params.p13 ?? 3.0),
    filletRadius: Number(params.p14 ?? 3.5),
    edgeBevel: Number(params.p15 ?? 0.4),
    minBaseLength: Number(params.p16 ?? 25.0),
    maxBaseLength: Number(params.p17 ?? 80.0),
    holePlacement: params.p18 ?? 'left',
    holeCount: Number(params.p19 ?? 1),
    holeDiameter: Number(params.p20 ?? 4.0),
    holeEdgeMargin: Number(params.p21 ?? 3.5),
    holeSymmetricalSpacing: Number(params.p22 ?? 16.0),
    tagStyle: params.p23 ?? 'embossed',
    reliefHeight: Number(params.p24 ?? 1.2),
    stencilGap: Number(params.p25 ?? 1.0),
    stencilBridges: params.p26 ?? true,
    centerTextInBase: params.p27 ?? true,
    csgSolidUnion: params.p28 ?? true,
  };

  const textStr1 = config.isUppercase ? (config.text || '').toUpperCase() : (config.text || '');
  const textStr2 = config.hasSecondLine
    ? (config.isUppercase ? (config.textLine2 || '').toUpperCase() : (config.textLine2 || ''))
    : '';

  const fontSize1 = Math.max(3.0, Math.min(100.0, config.fontSize));
  const fontSize2 = Math.max(3.0, Math.min(100.0, config.fontSize2 || 4.5));

  const textResult = generateMultiLineTextShapes(THREE, font, {
    text1: textStr1,
    fontSize1,
    text2: textStr2,
    fontSize2,
    hasSecondLine: config.hasSecondLine,
    letterSpacing: config.letterSpacing,
    lineSpacing: config.lineSpacing ?? 2.0,
  });

  const textW = Math.max(2.0, textResult.bounds.width || (textStr1.length * fontSize1 * 0.6));
  const textH = Math.max(2.0, textResult.bounds.height || fontSize1);

  const baseResult = buildTagBase2DShape(THREE, config, textW, textH);
  const baseBounds = baseResult.bounds;

  const textShiftX = 0 - textResult.rawCenterX;
  const textShiftY = 0 - textResult.rawCenterY;

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

  baseGeom.computeBoundingBox();
  const baseBB = baseGeom.boundingBox;
  baseGeom.translate(0, 0, -baseBB.min.z);
  baseGeom.computeVertexNormals();

  const minTextThickness = 0.6;
  const rawRelief = Math.max(minTextThickness, Math.min(15.0, config.reliefHeight));

  const maxLetterFilletAllowed = Math.round((rawRelief * 0.5) * 100) / 100;
  const requestedFillet = Math.max(0, config.letterFillet ?? 0);
  const letterFilletVal = Math.min(requestedFillet, maxLetterFilletAllowed);
  const letterFilletEnabled = letterFilletVal > 0.02 && config.tagStyle === 'embossed';

  let exportGeometry = baseGeom.clone();
  let textGeom = undefined;

  const canCSG = Boolean(Evaluator && Brush);
  const evaluator = canCSG ? new Evaluator() : null;
  if (evaluator) evaluator.useGroups = false;

  if (textResult.shapes.length > 0) {
    if (config.tagStyle === 'embossed') {
      textGeom = new THREE.ExtrudeGeometry(textResult.shapes, {
        depth: letterFilletEnabled ? Math.max(0.1, rawRelief - letterFilletVal) : rawRelief,
        bevelEnabled: letterFilletEnabled,
        bevelSize: letterFilletVal,
        bevelThickness: letterFilletVal,
        bevelOffset: -letterFilletVal,
        bevelSegments: 5,
        curveSegments: 16,
      });

      textGeom.translate(textShiftX, textShiftY, baseThickness);
      textGeom.computeVertexNormals();

      if (config.csgSolidUnion && canCSG) {
        try {
          const baseBrush = new Brush(baseGeom);
          baseBrush.updateMatrixWorld();

          const overlapTextGeom = textGeom.clone();
          overlapTextGeom.translate(0, 0, -0.05);
          const textBrush = new Brush(overlapTextGeom);
          textBrush.updateMatrixWorld();

          const result = evaluator.evaluate(baseBrush, textBrush, ADDITION);
          exportGeometry = result.geometry;
        } catch {
          exportGeometry = combineGeometries(THREE, baseGeom, textGeom);
        }
      } else {
        exportGeometry = combineGeometries(THREE, baseGeom, textGeom);
      }
    } else if (config.tagStyle === 'debossed' && canCSG) {
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
      } catch {
        exportGeometry = baseGeom.clone();
      }
    } else if (config.tagStyle === 'cutout' && canCSG) {
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

      const stencilGap = Math.max(minTextThickness, Math.min(10.0, config.stencilGap || 1.0));
      const bridgesEnabled = config.stencilBridges !== false;

      if (bridgesEnabled && textResult.holeIslands.length > 0) {
        for (const island of textResult.holeIslands) {
          const islandCenterX = island.cx + textShiftX;
          const islandCenterY = island.cy + textShiftY;

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
            // Keep cutting brush if bridge subtraction hits edge case
          }
        }
      }

      try {
        const baseBrush = new Brush(baseGeom);
        baseBrush.updateMatrixWorld();

        const result = evaluator.evaluate(baseBrush, cuttingBrush, SUBTRACTION);
        exportGeometry = result.geometry;
        exportGeometry.computeVertexNormals();
      } catch {
        exportGeometry = baseGeom.clone();
      }
    }
  }

  const analysis = analyzeMeshWatertightness(THREE, exportGeometry);
  const totalHeight = config.tagStyle === 'embossed' ? baseThickness + rawRelief : baseThickness;

  return {
    geometry: exportGeometry,
    baseGeometry: baseGeom,
    textGeometry: textGeom,
    holes: baseResult.holes,
    bounds: baseBounds,
    dimensions: {
      totalLength: Math.round(baseBounds.width * 10) / 10,
      totalWidth: Math.round(baseBounds.height * 10) / 10,
      totalHeight: Math.round(totalHeight * 10) / 10,
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
      estimatedLayers: Math.ceil(totalHeight / 0.2),
      isWatertight: analysis.isWatertight || analysis.boundaryEdges <= 16,
      vertexCount: analysis.vertexCount,
      triangleCount: analysis.triangleCount,
      boundaryEdges: analysis.boundaryEdges,
      nonManifoldEdges: analysis.nonManifoldEdges,
    },
  };
}
