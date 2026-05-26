import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/shared/lib/api';

export interface MindmapNodeData {
  id: string;
  label: string;
  color: string;
  icon: string | null;
  collapsed: boolean;
  position: number;
  parentId: string | null;
  children: MindmapNodeData[];
}

export interface Mindmap {
  id: string;
  title: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  tree: MindmapNodeData[];
}

export interface MindmapListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: { nodes: number };
}

export const useMindmapStore = defineStore('mindmap', () => {
  const mindmaps = ref<MindmapListItem[]>([]);
  const currentMindmap = ref<Mindmap | null>(null);
  const loading = ref(false);

  async function fetchMindmaps(workspaceId: string) {
    const res = await api.get<MindmapListItem[]>(`/mindmaps/workspace/${workspaceId}`);
    mindmaps.value = res.data;
  }

  async function fetchMindmap(id: string) {
    loading.value = true;
    try {
      const res = await api.get<Mindmap>(`/mindmaps/${id}`);
      currentMindmap.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function createMindmap(workspaceId: string, title?: string) {
    const res = await api.post<Mindmap>('/mindmaps', { workspaceId, title });
    mindmaps.value.unshift({ ...res.data, _count: { nodes: 1 } });
    return res.data;
  }

  async function updateMindmap(id: string, data: { title?: string }) {
    const res = await api.patch<Mindmap>(`/mindmaps/${id}`, data);
    if (currentMindmap.value?.id === id) {
      currentMindmap.value = { ...currentMindmap.value, ...res.data };
    }
    const idx = mindmaps.value.findIndex((m) => m.id === id);
    if (idx !== -1) mindmaps.value[idx] = { ...mindmaps.value[idx], ...res.data };
    return res.data;
  }

  async function deleteMindmap(id: string) {
    await api.delete(`/mindmaps/${id}`);
    mindmaps.value = mindmaps.value.filter((m) => m.id !== id);
    if (currentMindmap.value?.id === id) currentMindmap.value = null;
  }

  async function addNode(
    mindmapId: string,
    data: { label?: string; color?: string; parentId?: string },
  ) {
    const res = await api.post<MindmapNodeData>(`/mindmaps/${mindmapId}/nodes`, data);
    // Reload tree to get updated structure
    await fetchMindmap(mindmapId);
    return res.data;
  }

  async function updateNode(nodeId: string, data: Partial<MindmapNodeData>) {
    await api.patch(`/mindmaps/nodes/${nodeId}`, data);
    if (currentMindmap.value) {
      updateNodeInTree(currentMindmap.value.tree, nodeId, data);
    }
  }

  async function deleteNode(nodeId: string) {
    await api.delete(`/mindmaps/nodes/${nodeId}`);
    if (currentMindmap.value) {
      await fetchMindmap(currentMindmap.value.id);
    }
  }

  function updateNodeInTree(nodes: MindmapNodeData[], id: string, data: Partial<MindmapNodeData>) {
    for (const node of nodes) {
      if (node.id === id) {
        Object.assign(node, data);
        return true;
      }
      if (node.children.length && updateNodeInTree(node.children, id, data)) return true;
    }
    return false;
  }

  return {
    mindmaps,
    currentMindmap,
    loading,
    fetchMindmaps,
    fetchMindmap,
    createMindmap,
    updateMindmap,
    deleteMindmap,
    addNode,
    updateNode,
    deleteNode,
  };
});
