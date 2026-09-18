<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue';
import type { CanvasObjectData } from '@/modules/canvas/store';
import {
  ellipseCenterFromTopLeft,
  ellipseTopLeftFromCenter,
  resolveTransformSize,
  canvasPointToScreen,
  scalePoints,
} from '@/modules/canvas/utils/coordinates';

const props = defineProps<{
  object: CanvasObjectData;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  select: [multi: boolean];
  transform: [data: Partial<CanvasObjectData>];
}>();

const canvas = inject<any>('canvas');

const transformerRef = ref<any>(null);
const shapeRef = ref<any>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const EDITABLE_TEXT_TYPES = ['TEXT', 'STICKY_NOTE'];
const isEditingText = ref(false);
const editValue = ref('');

const textAreaBounds = computed(() => {
  const o = props.object;
  const inset = o.type === 'STICKY_NOTE' ? 8 : 0;
  const stage = shapeRef.value?.getNode()?.getStage();
  const containerRect = stage?.container().getBoundingClientRect() ?? { left: 0, top: 0 };
  const topLeft = canvasPointToScreen(
    { x: o.x + inset, y: o.y + inset },
    { x: containerRect.left, y: containerRect.top },
    canvas.camera.value,
  );
  const scale = canvas.camera.value.scale;
  return {
    left: topLeft.x,
    top: topLeft.y,
    width: (o.width - inset * 2) * scale,
    height: (o.height - inset * 2) * scale,
    fontSize: (o.props.fontSize ?? (o.type === 'STICKY_NOTE' ? 14 : 18)) * scale,
  };
});

function startEditText() {
  if (!EDITABLE_TEXT_TYPES.includes(props.object.type)) return;
  editValue.value = props.object.props.text ?? '';
  isEditingText.value = true;
  nextTick(() => textareaRef.value?.focus());
}

function commitEditText() {
  if (!isEditingText.value) return;
  isEditingText.value = false;
  emit('transform', { props: { ...props.object.props, text: editValue.value } });
}

function cancelEditText() {
  isEditingText.value = false;
}

function handleTextareaKeydown(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') cancelEditText();
}

watch(
  () => props.isSelected,
  async (selected) => {
    if (!selected) return;
    await nextTick();
    const transformerNode = transformerRef.value?.getNode();
    const shapeNode = shapeRef.value?.getNode();
    if (!transformerNode || !shapeNode) return;
    transformerNode.nodes([shapeNode]);
    transformerNode.getLayer()?.batchDraw();
  },
  { immediate: true },
);

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
        fill: o.props.fill ?? 'transparent',
        stroke: o.props.stroke ?? '#1976d2',
        strokeWidth: o.props.strokeWidth ?? 2,
        cornerRadius: o.props.cornerRadius ?? 0,
      };
    case 'ELLIPSE': {
      const center = ellipseCenterFromTopLeft(o.x, o.y, o.width, o.height);
      return {
        ...base,
        x: center.x,
        y: center.y,
        radiusX: o.width / 2,
        radiusY: o.height / 2,
        fill: o.props.fill ?? 'transparent',
        stroke: o.props.stroke ?? '#7b1fa2',
        strokeWidth: o.props.strokeWidth ?? 2,
      };
    }
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
        opacity: isEditingText.value ? 0 : 1,
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

function topLeftFromNode(node: any): { x: number; y: number } {
  if (props.object.type === 'ELLIPSE') {
    return ellipseTopLeftFromCenter(node.x(), node.y(), props.object.width, props.object.height);
  }
  return { x: node.x(), y: node.y() };
}

function handleDragEnd(e: any) {
  const node = e.target;
  emit('transform', topLeftFromNode(node));
}

const POINTS_TYPES = ['ARROW', 'LINE', 'PENCIL'];

function handleTransformEnd(e: any) {
  const node = e.target;
  const resolved = resolveTransformSize(node.width(), node.height(), node.scaleX(), node.scaleY());

  let extraProps: Record<string, any> | undefined;
  if (POINTS_TYPES.includes(props.object.type)) {
    extraProps = {
      ...props.object.props,
      points: scalePoints(node.points(), node.scaleX(), node.scaleY()),
    };
  } else if (props.object.type === 'TEXT') {
    extraProps = {
      ...props.object.props,
      fontSize: (props.object.props.fontSize ?? 18) * node.scaleY(),
    };
  }

  const topLeft =
    props.object.type === 'ELLIPSE'
      ? ellipseTopLeftFromCenter(node.x(), node.y(), resolved.width, resolved.height)
      : { x: node.x(), y: node.y() };
  emit('transform', {
    x: topLeft.x,
    y: topLeft.y,
    rotation: node.rotation(),
    scaleX: resolved.scaleX,
    scaleY: resolved.scaleY,
    width: resolved.width,
    height: resolved.height,
    ...(extraProps ? { props: extraProps } : {}),
  });
  // Reset the live node's scale too, so it doesn't render doubled before the next re-render.
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
    @dblclick="startEditText"
    @dragend="handleDragEnd"
    @transformend="handleTransformEnd"
  />
  <!-- Sticky note text overlay -->
  <v-text
    v-if="object.type === 'STICKY_NOTE' && object.props.text && !isEditingText"
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
  <Teleport to="body">
    <textarea
      v-if="isEditingText"
      ref="textareaRef"
      v-model="editValue"
      class="canvas-text-editor"
      :style="{
        position: 'fixed',
        left: `${textAreaBounds.left}px`,
        top: `${textAreaBounds.top}px`,
        width: `${textAreaBounds.width}px`,
        height: `${textAreaBounds.height}px`,
        fontSize: `${textAreaBounds.fontSize}px`,
      }"
      @blur="commitEditText"
      @keydown="handleTextareaKeydown"
    />
  </Teleport>
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

<style scoped>
.canvas-text-editor {
  z-index: 1000;
  padding: 0;
  margin: 0;
  border: 1px solid #1976d2;
  outline: none;
  resize: none;
  overflow: hidden;
  background: #ffffff;
  font-family: inherit;
  line-height: 1.2;
}
</style>
