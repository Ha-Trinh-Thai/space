import { describe, expect, it } from 'vitest';
import {
  ellipseCenterFromTopLeft,
  ellipseTopLeftFromCenter,
  computeLineDelta,
  computeBoundingBox,
  resolveTransformSize,
  canvasPointToScreen,
  computePannedCamera,
  scalePoints,
} from './coordinates';

describe('ellipseCenterFromTopLeft / ellipseTopLeftFromCenter', () => {
  it('converts top-left to center using half width/height', () => {
    expect(ellipseCenterFromTopLeft(10, 20, 100, 40)).toEqual({ x: 60, y: 40 });
  });

  it('round-trips center back to the original top-left after a drag', () => {
    const topLeft = { x: 10, y: 20 };
    const width = 100;
    const height = 40;

    const center = ellipseCenterFromTopLeft(topLeft.x, topLeft.y, width, height);
    // Simulate Konva reporting the dragged node's (center-based) position.
    const draggedCenter = { x: center.x + 30, y: center.y - 15 };

    const newTopLeft = ellipseTopLeftFromCenter(draggedCenter.x, draggedCenter.y, width, height);

    expect(newTopLeft).toEqual({ x: topLeft.x + 30, y: topLeft.y - 15 });
  });
});

describe('computeLineDelta', () => {
  it('keeps the sign of the drag when dragging down-right', () => {
    expect(computeLineDelta({ x: 0, y: 0 }, { x: 80, y: 50 })).toEqual({ dx: 80, dy: 50 });
  });

  it('keeps the sign of the drag when dragging up-left', () => {
    expect(computeLineDelta({ x: 100, y: 100 }, { x: 20, y: 40 })).toEqual({ dx: -80, dy: -60 });
  });

  it('keeps the sign of the drag when dragging up-right', () => {
    expect(computeLineDelta({ x: 20, y: 100 }, { x: 90, y: 30 })).toEqual({ dx: 70, dy: -70 });
  });

  it('keeps the sign of the drag when dragging down-left', () => {
    expect(computeLineDelta({ x: 100, y: 20 }, { x: 40, y: 90 })).toEqual({ dx: -60, dy: 70 });
  });
});

describe('computeBoundingBox', () => {
  it('anchors at start and grows down-right when dragging down-right', () => {
    expect(computeBoundingBox({ x: 10, y: 10 }, { x: 90, y: 60 })).toEqual({
      x: 10,
      y: 10,
      width: 80,
      height: 50,
    });
  });

  it('anchors at the current position when dragging up-left', () => {
    expect(computeBoundingBox({ x: 90, y: 60 }, { x: 10, y: 10 })).toEqual({
      x: 10,
      y: 10,
      width: 80,
      height: 50,
    });
  });
});

describe('resolveTransformSize', () => {
  it('bakes the drag scale factor into absolute width/height and resets scale to 1', () => {
    expect(resolveTransformSize(120, 80, 1.5, 2)).toEqual({
      width: 180,
      height: 160,
      scaleX: 1,
      scaleY: 1,
    });
  });

  it('does not compound on a second resize starting from the resolved size', () => {
    const first = resolveTransformSize(120, 80, 1.5, 1.5);
    const second = resolveTransformSize(first.width, first.height, 1.2, 1.2);
    expect(second).toEqual({ width: 216, height: 144, scaleX: 1, scaleY: 1 });
  });
});

describe('canvasPointToScreen', () => {
  it('applies camera pan and zoom on top of the stage container offset', () => {
    const point = { x: 100, y: 50 };
    const containerOffset = { x: 260, y: 48 };
    const camera = { x: 20, y: -10, scale: 2 };

    expect(canvasPointToScreen(point, containerOffset, camera)).toEqual({
      x: 260 + 20 + 100 * 2,
      y: 48 - 10 + 50 * 2,
    });
  });

  it('is a no-op offset/shift at default camera (no pan, scale 1)', () => {
    const point = { x: 30, y: 40 };
    const containerOffset = { x: 0, y: 0 };
    const camera = { x: 0, y: 0, scale: 1 };

    expect(canvasPointToScreen(point, containerOffset, camera)).toEqual({ x: 30, y: 40 });
  });
});

describe('computePannedCamera', () => {
  it('moves the camera by exactly the raw pointer delta since pan started', () => {
    const cameraAtPanStart = { x: 10, y: 5, scale: 1.5 };
    const panStart = { x: 100, y: 100 };
    const currentPointer = { x: 180, y: 150 };

    expect(computePannedCamera(cameraAtPanStart, panStart, currentPointer)).toEqual({
      x: 10 + 80,
      y: 5 + 50,
      scale: 1.5,
    });
  });

  it('does not compound across two separate pan gestures starting from the resolved camera', () => {
    const start1 = { x: 0, y: 0, scale: 1 };
    const afterFirstPan = computePannedCamera(start1, { x: 0, y: 0 }, { x: 80, y: 50 });

    const afterSecondPan = computePannedCamera(
      afterFirstPan,
      { x: 500, y: 400 },
      { x: 580, y: 450 },
    );

    expect(afterSecondPan).toEqual({ x: 160, y: 100, scale: 1 });
  });
});

describe('scalePoints', () => {
  it('scales each x by scaleX and each y by scaleY independently', () => {
    expect(scalePoints([0, 0, 120, 40], 1.5, 2)).toEqual([0, 0, 180, 80]);
  });

  it('scales a multi-point freehand path (pencil stroke)', () => {
    expect(scalePoints([10, 20, 30, 40, 50, 60], 2, 0.5)).toEqual([20, 10, 60, 20, 100, 30]);
  });

  it('is a no-op at scale 1', () => {
    expect(scalePoints([5, 10, 15, 20], 1, 1)).toEqual([5, 10, 15, 20]);
  });
});
