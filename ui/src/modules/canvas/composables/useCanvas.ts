import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import {
  useCanvasStore,
  type CanvasObjectData,
  type CanvasObjectType,
} from '@/modules/canvas/store';
import { useRouteParam } from '@/shared/composables/useRouteParam';
import { useDebounceFn } from '@/shared/composables/useDebounce';

export type CanvasTool =
  | 'select'
  | 'pan'
  | 'rectangle'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'text'
  | 'sticky_note'
  | 'pencil';

export interface CameraState {
  x: number;
  y: number;
  scale: number;
}

export function useCanvas() {
  const canvasStore = useCanvasStore();
  const { objects, currentCanvas, loading } = storeToRefs(canvasStore);

  const canvasId = useRouteParam('canvasId');
  const workspaceId = useRouteParam('workspaceId');

  // Tool state
  const activeTool = ref<CanvasTool>('select');
  const selectedIds = ref<Set<string>>(new Set());

  // Camera state
  const camera = ref<CameraState>({ x: 0, y: 0, scale: 1 });

  // Grid
  const showGrid = ref(true);
  const snapToGrid = ref(false);
  const gridSize = 20;

  // Load canvas on route change
  watch(
    canvasId,
    (id) => {
      if (id) {
        canvasStore.fetchCanvas(id);
        selectedIds.value.clear();
      }
    },
    { immediate: true },
  );

  const selectedObjects = computed(() => objects.value.filter((o) => selectedIds.value.has(o.id)));

  // ─── Selection ────────────────────────────────────────

  function select(id: string, multi = false) {
    if (multi) {
      if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id);
      } else {
        selectedIds.value.add(id);
      }
    } else {
      selectedIds.value = new Set([id]);
    }
  }

  function selectAll() {
    selectedIds.value = new Set(objects.value.map((o) => o.id));
  }

  function deselectAll() {
    selectedIds.value = new Set();
  }

  // ─── Camera ───────────────────────────────────────────

  function zoomIn() {
    camera.value.scale = Math.min(camera.value.scale * 1.2, 5);
  }

  function zoomOut() {
    camera.value.scale = Math.max(camera.value.scale / 1.2, 0.1);
  }

  function resetZoom() {
    camera.value = { x: 0, y: 0, scale: 1 };
  }

  // ─── Object Creation ──────────────────────────────────

  function getToolObjectType(tool: CanvasTool): CanvasObjectType | null {
    const map: Partial<Record<CanvasTool, CanvasObjectType>> = {
      rectangle: 'RECTANGLE',
      ellipse: 'ELLIPSE',
      arrow: 'ARROW',
      line: 'LINE',
      text: 'TEXT',
      sticky_note: 'STICKY_NOTE',
      pencil: 'PENCIL',
    };
    return map[tool] ?? null;
  }

  async function createObject(
    type: CanvasObjectType,
    x: number,
    y: number,
    extra: Partial<CanvasObjectData> = {},
  ) {
    if (!canvasId.value) return null;
    const maxZ = objects.value.reduce((max, o) => Math.max(max, o.zIndex), 0);
    const obj = await canvasStore.addObject(canvasId.value, {
      type,
      x,
      y,
      width: extra.width ?? getDefaultWidth(type),
      height: extra.height ?? getDefaultHeight(type),
      props: extra.props ?? getDefaultProps(type),
      zIndex: maxZ + 1,
    });
    if (obj) {
      selectedIds.value = new Set([obj.id]);
      activeTool.value = 'select';
    }
    return obj;
  }

  // ─── Object Manipulation ──────────────────────────────

  const { debounced: persistObject } = useDebounceFn(
    (id: string, data: Partial<CanvasObjectData>) => {
      canvasStore.updateObject(id, data);
    },
    300,
  );

  function moveObject(id: string, x: number, y: number) {
    canvasStore.updateObjectLocal(id, { x, y });
    persistObject(id, { x, y });
  }

  function resizeObject(id: string, width: number, height: number) {
    canvasStore.updateObjectLocal(id, { width, height });
    persistObject(id, { width, height });
  }

  function rotateObject(id: string, rotation: number) {
    canvasStore.updateObjectLocal(id, { rotation });
    persistObject(id, { rotation });
  }

  function transformObject(id: string, data: Partial<CanvasObjectData>) {
    canvasStore.updateObjectLocal(id, data);
    persistObject(id, data);
  }

  async function deleteSelected() {
    if (!canvasId.value || selectedIds.value.size === 0) return;
    const ids = [...selectedIds.value];
    await canvasStore.deleteObjects(canvasId.value, ids);
    selectedIds.value = new Set();
  }

  // ─── Z-Index ──────────────────────────────────────────

  async function bringToFront(id: string) {
    const maxZ = objects.value.reduce((max, o) => Math.max(max, o.zIndex), 0);
    await canvasStore.updateObject(id, { zIndex: maxZ + 1 });
  }

  async function sendToBack(id: string) {
    const minZ = objects.value.reduce((min, o) => Math.min(min, o.zIndex), 0);
    await canvasStore.updateObject(id, { zIndex: minZ - 1 });
  }

  // ─── Defaults ─────────────────────────────────────────

  function getDefaultWidth(type: CanvasObjectType): number {
    switch (type) {
      case 'TEXT':
        return 200;
      case 'STICKY_NOTE':
        return 200;
      case 'ARROW':
      case 'LINE':
        return 150;
      default:
        return 120;
    }
  }

  function getDefaultHeight(type: CanvasObjectType): number {
    switch (type) {
      case 'TEXT':
        return 40;
      case 'STICKY_NOTE':
        return 200;
      case 'ARROW':
      case 'LINE':
        return 0;
      default:
        return 120;
    }
  }

  function getDefaultProps(type: CanvasObjectType): Record<string, any> {
    switch (type) {
      case 'RECTANGLE':
        return { fill: '#e3f2fd', stroke: '#1976d2', strokeWidth: 2, cornerRadius: 8 };
      case 'ELLIPSE':
        return { fill: '#f3e5f5', stroke: '#7b1fa2', strokeWidth: 2 };
      case 'ARROW':
        return { stroke: '#424242', strokeWidth: 2, points: [0, 0, 150, 0] };
      case 'LINE':
        return { stroke: '#424242', strokeWidth: 2, points: [0, 0, 150, 0] };
      case 'TEXT':
        return { text: 'Text', fontSize: 18, fill: '#212121', fontFamily: 'Inter' };
      case 'STICKY_NOTE':
        return { fill: '#fff9c4', stroke: '#f9a825', strokeWidth: 1, text: '', fontSize: 14 };
      case 'PENCIL':
        return { stroke: '#212121', strokeWidth: 2, points: [] };
      default:
        return {};
    }
  }

  return {
    // State
    canvasId,
    workspaceId,
    currentCanvas,
    objects,
    loading,
    activeTool,
    selectedIds,
    selectedObjects,
    camera,
    showGrid,
    snapToGrid,
    gridSize,
    // Selection
    select,
    selectAll,
    deselectAll,
    // Camera
    zoomIn,
    zoomOut,
    resetZoom,
    // Objects
    getToolObjectType,
    createObject,
    moveObject,
    resizeObject,
    rotateObject,
    transformObject,
    deleteSelected,
    bringToFront,
    sendToBack,
  };
}
