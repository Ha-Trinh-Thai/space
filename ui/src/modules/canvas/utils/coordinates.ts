export interface Point {
  x: number;
  y: number;
}

export function ellipseCenterFromTopLeft(
  x: number,
  y: number,
  width: number,
  height: number,
): Point {
  return { x: x + width / 2, y: y + height / 2 };
}

export function ellipseTopLeftFromCenter(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
): Point {
  return { x: centerX - width / 2, y: centerY - height / 2 };
}

export function computeLineDelta(start: Point, current: Point): { dx: number; dy: number } {
  return { dx: current.x - start.x, dy: current.y - start.y };
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeBoundingBox(start: Point, current: Point): BoundingBox {
  const { dx, dy } = computeLineDelta(start, current);
  return {
    x: dx >= 0 ? start.x : current.x,
    y: dy >= 0 ? start.y : current.y,
    width: Math.abs(dx),
    height: Math.abs(dy),
  };
}

export interface ResolvedTransformSize {
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
}

export function resolveTransformSize(
  rawWidth: number,
  rawHeight: number,
  scaleX: number,
  scaleY: number,
): ResolvedTransformSize {
  return {
    width: rawWidth * scaleX,
    height: rawHeight * scaleY,
    scaleX: 1,
    scaleY: 1,
  };
}

export interface Camera {
  x: number;
  y: number;
  scale: number;
}

export function canvasPointToScreen(point: Point, containerOffset: Point, camera: Camera): Point {
  return {
    x: containerOffset.x + camera.x + point.x * camera.scale,
    y: containerOffset.y + camera.y + point.y * camera.scale,
  };
}

export function computePannedCamera(
  cameraAtPanStart: Camera,
  panStart: Point,
  currentPointer: Point,
): Camera {
  return {
    x: cameraAtPanStart.x + (currentPointer.x - panStart.x),
    y: cameraAtPanStart.y + (currentPointer.y - panStart.y),
    scale: cameraAtPanStart.scale,
  };
}

export function scalePoints(points: number[], scaleX: number, scaleY: number): number[] {
  return points.map((value, i) => (i % 2 === 0 ? value * scaleX : value * scaleY));
}
