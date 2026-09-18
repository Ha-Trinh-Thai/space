import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/shared/lib/api';

export interface DocTreeNode {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  position: number;
  children: DocTreeNode[];
}

export interface Document {
  id: string;
  title: string;
  content: any;
  icon: string | null;
  parentId: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export const useDocumentStore = defineStore('document', () => {
  const tree = ref<DocTreeNode[]>([]);
  const currentDocument = ref<Document | null>(null);
  const loading = ref(false);

  async function fetchTree(workspaceId: string) {
    const res = await api.get<DocTreeNode[]>(`/documents/tree/${workspaceId}`);
    tree.value = res.data;
  }

  async function fetchDocument(id: string) {
    loading.value = true;
    try {
      const res = await api.get<Document>(`/documents/${id}`);
      currentDocument.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function createDocument(workspaceId: string, parentId?: string) {
    const res = await api.post<Document>('/documents', { workspaceId, parentId });
    await fetchTree(workspaceId);
    return res.data;
  }

  async function updateDocument(id: string, data: Partial<Document>) {
    const res = await api.patch<Document>(`/documents/${id}`, data);
    if (currentDocument.value?.id === id) {
      currentDocument.value = { ...currentDocument.value, ...res.data };
    }
    // Update tree title if changed
    if (data.title !== undefined) {
      updateTreeNode(tree.value, id, data);
    }
    return res.data;
  }

  async function moveDocument(id: string, parentId: string | null, position: number) {
    await api.patch(`/documents/${id}/move`, { parentId, position });
    if (currentDocument.value?.workspaceId) {
      await fetchTree(currentDocument.value.workspaceId);
    }
  }

  async function deleteDocument(id: string, workspaceId: string) {
    await api.delete(`/documents/${id}`);
    if (currentDocument.value?.id === id) {
      currentDocument.value = null;
    }
    await fetchTree(workspaceId);
  }

  async function searchDocuments(workspaceId: string, query: string) {
    const res = await api.get(`/documents/search/${workspaceId}`, { params: { q: query } });
    return res.data;
  }

  function updateTreeNode(nodes: DocTreeNode[], id: string, data: Partial<Document>) {
    for (const node of nodes) {
      if (node.id === id) {
        if (data.title !== undefined) node.title = data.title;
        return;
      }
      if (node.children.length) updateTreeNode(node.children, id, data);
    }
  }

  return {
    tree,
    currentDocument,
    loading,
    fetchTree,
    fetchDocument,
    createDocument,
    updateDocument,
    moveDocument,
    deleteDocument,
    searchDocuments,
  };
});
