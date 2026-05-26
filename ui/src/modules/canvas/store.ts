import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/shared/lib/api';

export type CanvasObjectType =
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'ARROW'
  | 'LINE'
  | 'TEXT'
  | 'STICKY_NOTE'
  | 'IMAGE'
  | 'PENCIL'
  | 'GROUP';

export interface CanvasObjectData {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  props: Record<string, any>;
  zIndex: number;
  groupId: string | null;
  canvasId: string;
}

export interface Canvas {
  id: string;
  title: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  objects?: CanvasObjectData[];
}

export interface CanvasListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: { objects: number };
}

export const useCanvasStore = defineStore('canvas', () => {
  const canvases = ref<CanvasListItem[]>([]);
  const currentCanvas = ref<Canvas | null>(null);
  const objects = ref<CanvasObjectData[]>([]);
  const loading = ref(false);

  async function fetchCanvases(workspaceId: string) {
    const res = await api.get<CanvasListItem[]>(`/canvas/workspace/${workspaceId}`);
    canvases.value = res.data;
  }

  async function fetchCanvas(id: string) {
    loading.value = true;
    try {
      const res = await api.get<Canvas>(`/canvas/${id}`);
      currentCanvas.value = res.data;
      objects.value = res.data.objects ?? [];
    } finally {
      loading.value = false;
    }
  }

  async function createCanvas(workspaceId: string, title?: string) {
    const res = await api.post<Canvas>('/canvas', { workspaceId, title });
    canvases.value.unshift({
      ...res.data,
      _count: { objects: 0 },
    });
    return res.data;
  }

  async function updateCanvas(id: string, data: { title?: string }) {
    const res = await api.patch<Canvas>(`/canvas/${id}`, data);
    if (currentCanvas.value?.id === id) {
      currentCanvas.value = { ...currentCanvas.value, ...res.data };
    }
    const idx = canvases.value.findIndex((c) => c.id === id);
    if (idx !== -1) canvases.value[idx] = { ...canvases.value[idx], ...res.data };
    return res.data;
  }

  async function deleteCanvas(id: string) {
    await api.delete(`/canvas/${id}`);
    canvases.value = canvases.value.filter((c) => c.id !== id);
    if (currentCanvas.value?.id === id) currentCanvas.value = null;
  }

  async function addObject(canvasId: string, obj: Partial<CanvasObjectData>) {
    const res = await api.post<CanvasObjectData>(`/canvas/${canvasId}/objects`, obj);
    objects.value.push(res.data);
    return res.data;
  }

  async function updateObject(objectId: string, data: Partial<CanvasObjectData>) {
    const res = await api.patch<CanvasObjectData>(`/canvas/objects/${objectId}`, data);
    const idx = objects.value.findIndex((o) => o.id === objectId);
    if (idx !== -1) objects.value[idx] = { ...objects.value[idx], ...res.data };
    return res.data;
  }

  async function bulkUpdateObjects(
    canvasId: string,
    updates: { id: string; [key: string]: any }[],
  ) {
    const res = await api.post<CanvasObjectData[]>(`/canvas/${canvasId}/objects/bulk-update`, {
      updates,
    });
    for (const updated of res.data) {
      const idx = objects.value.findIndex((o) => o.id === updated.id);
      if (idx !== -1) objects.value[idx] = { ...objects.value[idx], ...updated };
    }
  }

  async function deleteObject(objectId: string) {
    await api.delete(`/canvas/objects/${objectId}`);
    objects.value = objects.value.filter((o) => o.id !== objectId);
  }

  async function deleteObjects(canvasId: string, objectIds: string[]) {
    await api.post(`/canvas/${canvasId}/objects/bulk-delete`, { objectIds });
    objects.value = objects.value.filter((o) => !objectIds.includes(o.id));
  }

  // Local-only mutations for optimistic updates during interaction
  function updateObjectLocal(objectId: string, data: Partial<CanvasObjectData>) {
    const idx = objects.value.findIndex((o) => o.id === objectId);
    if (idx !== -1) objects.value[idx] = { ...objects.value[idx], ...data };
  }

  return {
    canvases,
    currentCanvas,
    objects,
    loading,
    fetchCanvases,
    fetchCanvas,
    createCanvas,
    updateCanvas,
    deleteCanvas,
    addObject,
    updateObject,
    bulkUpdateObjects,
    deleteObject,
    deleteObjects,
    updateObjectLocal,
  };
});
