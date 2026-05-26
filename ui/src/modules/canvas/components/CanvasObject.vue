<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CanvasObjectData } from '@/modules/canvas/store';

const props = defineProps<{
  object: CanvasObjectData;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  select: [multi: boolean];
  transform: [data: Partial<CanvasObjectData>];
}>();

const transformerRef = ref<any>(null);
const shapeRef = ref<any>(null);

const shapeConfig = computed(() => {
  const o = props.object;
  const base = {
    x: o.x,
    y: o.y,
    rotation: o.rotation,
    scaleX: o.scaleX,
    scaleY: o.scaleY,
    draggable: true,
  };

  switch (o.type) {
    case 'RECTANGLE':
      return {
        ...base,
        width: o.width,
        height: o.height,
        fill: o.props.fill ?? '#e3f2fd',
        stroke: o.props.stroke ?? '#1976d2',
        strokeWidth: o.props.strokeWidth ?? 2,
        cornerRadius: o.props.cornerRadius ?? 0,
      };
    case 'ELLIPSE':
      return {
        ...base,
        x: o.x + o.width / 2,
        y: o.y + o.height / 2,
        radiusX: o.width / 2,
        radiusY: o.height / 2,
        fill: o.props.fill ?? '#f3e5f5',
        stroke: o.props.stroke ?? '#7b1fa2',
        strokeWidth: o.props.strokeWidth ?? 2,
      };
    case 'ARROW':
      return {
        ...base,
        points: o.props.points ?? [0, 0, o.width, 0],
        stroke: o.props.stroke ?? '#424242',
        strokeWidth: o.props.strokeWidth ?? 2,
        pointerLength: 10,
        pointerWidth: 10,
      };
    case 'LINE':
    case 'PENCIL':
      return {
        ...base,
        points: o.props.points ?? [0, 0, o.width, 0],
        stroke: o.props.stroke ?? '#424242',
        strokeWidth: o.props.strokeWidth ?? 2,
        lineCap: 'round',
        lineJoin: 'round',
      };
    case 'TEXT':
      return {
        ...base,
        text: o.props.text ?? 'Text',
        fontSize: o.props.fontSize ?? 18,
        fill: o.props.fill ?? '#212121',
        fontFamily: o.props.fontFamily ?? 'Inter',
        width: o.width,
      };
    case 'STICKY_NOTE':
      return {
        ...base,
        width: o.width,
        height: o.height,
        fill: o.props.fill ?? '#fff9c4',
        stroke: o.props.stroke ?? '#f9a825',
        strokeWidth: o.props.strokeWidth ?? 1,
        cornerRadius: 4,
      };
    case 'IMAGE':
      return {
        ...base,
        width: o.width,
        height: o.height,
      };
    default:
      return {
        ...base,
        width: o.width,
        height: o.height,
        fill: '#e0e0e0',
        stroke: '#9e9e9e',
        strokeWidth: 1,
      };
  }
});

const componentType = computed(() => {
  switch (props.object.type) {
    case 'RECTANGLE':
    case 'STICKY_NOTE':
      return 'v-rect';
    case 'ELLIPSE':
      return 'v-ellipse';
    case 'ARROW':
      return 'v-arrow';
    case 'LINE':
    case 'PENCIL':
      return 'v-line';
    case 'TEXT':
      return 'v-text';
    default:
      return 'v-rect';
  }
});

function handleClick(e: any) {
  emit('select', e.evt.shiftKey);
}

function handleDragEnd(e: any) {
  const node = e.target;
  emit('transform', {
    x: node.x(),
    y: node.y(),
  });
}

function handleTransformEnd(e: any) {
  const node = e.target;
  emit('transform', {
    x: node.x(),
    y: node.y(),
    rotation: node.rotation(),
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
    width: node.width() * node.scaleX(),
    height: node.height() * node.scaleY(),
  });
  // Reset scale after applying to width/height
  node.scaleX(1);
  node.scaleY(1);
}
</script>

<template>
  <component
    :is="componentType"
    ref="shapeRef"
    :config="shapeConfig"
    @click="handleClick"
    @dragend="handleDragEnd"
    @transformend="handleTransformEnd"
  />
  <!-- Sticky note text overlay -->
  <v-text
    v-if="object.type === 'STICKY_NOTE' && object.props.text"
    :config="{
      x: object.x + 8,
      y: object.y + 8,
      width: object.width - 16,
      height: object.height - 16,
      text: object.props.text,
      fontSize: object.props.fontSize ?? 14,
      fill: '#212121',
      listening: false,
    }"
  />
  <v-transformer
    v-if="isSelected"
    ref="transformerRef"
    :config="{
      enabledAnchors: [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'middle-left',
        'middle-right',
        'top-center',
        'bottom-center',
      ],
      rotateEnabled: true,
      borderStroke: '#1976d2',
      borderStrokeWidth: 1,
      anchorFill: '#ffffff',
      anchorStroke: '#1976d2',
      anchorSize: 8,
    }"
  />
</template>
