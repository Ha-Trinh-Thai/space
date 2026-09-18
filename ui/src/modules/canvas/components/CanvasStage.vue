<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import type { CanvasTool } from '@/modules/canvas/composables/useCanvas';
import CanvasObject from './CanvasObject.vue';
import {
  computeBoundingBox,
  computeLineDelta,
  computePannedCamera,
} from '@/modules/canvas/utils/coordinates';

const canvas = inject<any>('canvas');

const containerRef = ref<HTMLDivElement | null>(null);
const stageWidth = ref(800);
const stageHeight = ref(600);

// Drawing state
const isDrawing = ref(false);
const drawStart = ref({ x: 0, y: 0 });
const drawingPreview = ref<{ x: number; y: number; width: number; height: number } | null>(null);
const lineDelta = ref({ dx: 0, dy: 0 });
const pencilPoints = ref<number[]>([]);

// Panning state
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });
const cameraAtPanStart = ref({ x: 0, y: 0, scale: 1 });
const isHoveringEmptyArea = ref(false);

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    stageWidth.value = rect.width;
    stageHeight.value = rect.height;

    resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      stageWidth.value = width;
      stageHeight.value = height;
    });
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

const stageConfig = computed(() => ({
  width: stageWidth.value,
  height: stageHeight.value,
}));

const cursorStyle = computed(() => {
  if (canvas.activeTool.value !== 'select') return 'crosshair';
  if (isPanning.value) return 'grabbing';
  return isHoveringEmptyArea.value ? 'grab' : 'default';
});

const gridLines = computed(() => {
  const size = canvas.gridSize;
  const scale = canvas.camera.value.scale;
  const offsetX = canvas.camera.value.x % (size * scale);
  const offsetY = canvas.camera.value.y % (size * scale);

  const lines: any[] = [];
  const w = stageWidth.value;
  const h = stageHeight.value;
  const step = size * scale;

  for (let x = offsetX; x < w; x += step) {
    lines.push({ points: [x, 0, x, h], stroke: '#e0e0e0', strokeWidth: 0.5 });
  }
  for (let y = offsetY; y < h; y += step) {
    lines.push({ points: [0, y, w, y], stroke: '#e0e0e0', strokeWidth: 0.5 });
  }
  return lines;
});

// ─── Event Handlers ─────────────────────────────────────

function getPointerPos(e: any) {
  const stage = e.target.getStage();
  const pos = stage.getPointerPosition();
  const scale = canvas.camera.value.scale;
  return {
    x: (pos.x - canvas.camera.value.x) / scale,
    y: (pos.y - canvas.camera.value.y) / scale,
  };
}

function handleStageMouseDown(e: any) {
  const tool: CanvasTool = canvas.activeTool.value;

  // Drag from empty area with Select active = deselect, then pan
  if (tool === 'select' && e.target === e.target.getStage()) {
    canvas.deselectAll();
    isPanning.value = true;
    panStart.value = e.target.getStage().getPointerPosition();
    cameraAtPanStart.value = { ...canvas.camera.value };
    return;
  }

  const objectType = canvas.getToolObjectType(tool);
  if (!objectType) return;

  const pos = getPointerPos(e);
  isDrawing.value = true;
  drawStart.value = pos;
  lineDelta.value = { dx: 0, dy: 0 };

  if (tool === 'pencil') {
    pencilPoints.value = [pos.x, pos.y];
  } else {
    drawingPreview.value = { x: pos.x, y: pos.y, width: 0, height: 0 };
  }
}

function handleStageMouseMove(e: any) {
  if (isPanning.value) {
    const pointer = e.target.getStage().getPointerPosition();
    canvas.camera.value = computePannedCamera(cameraAtPanStart.value, panStart.value, pointer);
    return;
  }

  if (!isDrawing.value) {
    isHoveringEmptyArea.value = e.target === e.target.getStage();
    return;
  }
  const pos = getPointerPos(e);
  const tool: CanvasTool = canvas.activeTool.value;

  if (tool === 'pencil') {
    pencilPoints.value = [...pencilPoints.value, pos.x, pos.y];
  } else if (drawingPreview.value) {
    drawingPreview.value = computeBoundingBox(drawStart.value, pos);
    lineDelta.value = computeLineDelta(drawStart.value, pos);
  }
}

function handleStageMouseUp() {
  if (isPanning.value) {
    isPanning.value = false;
    return;
  }

  if (!isDrawing.value) return;
  isDrawing.value = false;

  const tool: CanvasTool = canvas.activeTool.value;
  const objectType = canvas.getToolObjectType(tool);
  if (!objectType) return;

  if (tool === 'pencil') {
    if (pencilPoints.value.length > 4) {
      canvas.createObject(objectType, 0, 0, {
        width: 0,
        height: 0,
        props: { stroke: '#212121', strokeWidth: 2, points: pencilPoints.value },
      });
    }
    pencilPoints.value = [];
  } else if (tool === 'arrow' || tool === 'line') {
    const { dx, dy } = lineDelta.value;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      canvas.createObject(objectType, drawStart.value.x, drawStart.value.y, {
        width: dx,
        height: dy,
        props: {
          stroke: '#424242',
          strokeWidth: 2,
          points: [0, 0, dx, dy],
        },
      });
    }
  } else if (
    drawingPreview.value &&
    (drawingPreview.value.width > 5 || drawingPreview.value.height > 5)
  ) {
    canvas.createObject(objectType, drawingPreview.value.x, drawingPreview.value.y, {
      width: drawingPreview.value.width,
      height: drawingPreview.value.height,
    });
  } else {
    // Single click - create at default size
    canvas.createObject(objectType, drawStart.value.x, drawStart.value.y);
  }

  drawingPreview.value = null;
}

function handleWheel(e: any) {
  e.evt.preventDefault();
  const scaleBy = 1.05;
  const stage = e.target.getStage();
  const oldScale = canvas.camera.value.scale;
  const pointer = stage.getPointerPosition();

  const newScale =
    e.evt.deltaY > 0 ? Math.max(oldScale / scaleBy, 0.1) : Math.min(oldScale * scaleBy, 5);

  const mousePointTo = {
    x: (pointer.x - canvas.camera.value.x) / oldScale,
    y: (pointer.y - canvas.camera.value.y) / oldScale,
  };

  canvas.camera.value = {
    scale: newScale,
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
}
</script>

<template>
  <div ref="containerRef" class="canvas-stage-container">
    <v-stage
      :config="stageConfig"
      @mousedown="handleStageMouseDown"
      @mousemove="handleStageMouseMove"
      @mouseup="handleStageMouseUp"
      @wheel="handleWheel"
    >
      <!-- Grid layer -->
      <v-layer>
        <v-line v-for="(line, idx) in gridLines" :key="'grid-' + idx" :config="line" />
      </v-layer>

      <!-- Objects layer -->
      <v-layer
        :config="{
          x: canvas.camera.value.x,
          y: canvas.camera.value.y,
          scaleX: canvas.camera.value.scale,
          scaleY: canvas.camera.value.scale,
        }"
      >
        <CanvasObject
          v-for="obj in canvas.objects.value"
          :key="obj.id"
          :object="obj"
          :is-selected="canvas.selectedIds.value.has(obj.id)"
          @select="canvas.select(obj.id, $event)"
          @transform="canvas.transformObject(obj.id, $event)"
        />
      </v-layer>

      <!-- Drawing preview layer -->
      <v-layer
        v-if="isDrawing"
        :config="{
          x: canvas.camera.value.x,
          y: canvas.camera.value.y,
          scaleX: canvas.camera.value.scale,
          scaleY: canvas.camera.value.scale,
        }"
      >
        <v-rect
          v-if="drawingPreview && canvas.activeTool.value === 'rectangle'"
          :config="{
            x: drawingPreview.x,
            y: drawingPreview.y,
            width: drawingPreview.width,
            height: drawingPreview.height,
            stroke: '#1976d2',
            strokeWidth: 2,
            dash: [6, 3],
          }"
        />
        <v-ellipse
          v-if="drawingPreview && canvas.activeTool.value === 'ellipse'"
          :config="{
            x: drawingPreview.x + drawingPreview.width / 2,
            y: drawingPreview.y + drawingPreview.height / 2,
            radiusX: drawingPreview.width / 2,
            radiusY: drawingPreview.height / 2,
            stroke: '#7b1fa2',
            strokeWidth: 2,
            dash: [6, 3],
          }"
        />
        <v-line
          v-if="pencilPoints.length > 2"
          :config="{
            points: pencilPoints,
            stroke: '#212121',
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
          }"
        />
        <v-line
          v-if="
            drawingPreview &&
            (canvas.activeTool.value === 'arrow' || canvas.activeTool.value === 'line')
          "
          :config="{
            x: drawStart.x,
            y: drawStart.y,
            points: [0, 0, lineDelta.dx, lineDelta.dy],
            stroke: '#424242',
            strokeWidth: 2,
            dash: [6, 3],
          }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<style scoped>
.canvas-stage-container {
  width: 100%;
  height: 100%;
  cursor: v-bind(cursorStyle);
}
</style>
