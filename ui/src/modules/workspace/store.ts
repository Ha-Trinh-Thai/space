import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/shared/lib/api';
import { useAuthStore } from '@/modules/auth/store';

export interface WorkspaceMember {
  id: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  userId: string;
  user: { id: string; name: string; email: string };
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
  _count?: { members: number };
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<Workspace[]>([]);
  const currentWorkspace = ref<Workspace | null>(null);
  const loading = ref(false);

  const currentUserRole = computed(() => {
    if (!currentWorkspace.value) return null;
    const auth = useAuthStore();
    const userId = auth.user?.id;
    if (!userId) return null;
    const member = currentWorkspace.value.members.find((m) => m.userId === userId);
    return member?.role ?? null;
  });

  async function fetchWorkspaces() {
    loading.value = true;
    try {
      const res = await api.get<Workspace[]>('/workspaces');
      workspaces.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchWorkspace(id: string) {
    const res = await api.get<Workspace>(`/workspaces/${id}`);
    currentWorkspace.value = res.data;
  }

  async function createWorkspace(name: string) {
    const res = await api.post<Workspace>('/workspaces', { name });
    workspaces.value.unshift(res.data);
    return res.data;
  }

  async function renameWorkspace(id: string, name: string) {
    const res = await api.patch<Workspace>(`/workspaces/${id}`, { name });
    const idx = workspaces.value.findIndex((w) => w.id === id);
    if (idx !== -1) workspaces.value[idx] = { ...workspaces.value[idx], ...res.data };
    if (currentWorkspace.value?.id === id) {
      currentWorkspace.value = { ...currentWorkspace.value, ...res.data };
    }
    return res.data;
  }

  async function deleteWorkspace(id: string) {
    await api.delete(`/workspaces/${id}`);
    workspaces.value = workspaces.value.filter((w) => w.id !== id);
    if (currentWorkspace.value?.id === id) {
      currentWorkspace.value = null;
    }
  }

  async function inviteMember(workspaceId: string, email: string, role: string) {
    const res = await api.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, {
      email,
      role,
    });
    if (currentWorkspace.value?.id === workspaceId) {
      currentWorkspace.value.members.push(res.data);
    }
    return res.data;
  }

  async function removeMember(workspaceId: string, memberId: string) {
    await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    if (currentWorkspace.value?.id === workspaceId) {
      currentWorkspace.value.members = currentWorkspace.value.members.filter(
        (m) => m.id !== memberId,
      );
    }
  }

  async function updateMemberRole(workspaceId: string, memberId: string, role: string) {
    const res = await api.patch<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${memberId}/role`,
      { role },
    );
    if (currentWorkspace.value?.id === workspaceId) {
      const idx = currentWorkspace.value.members.findIndex((m) => m.id === memberId);
      if (idx !== -1) currentWorkspace.value.members[idx] = res.data;
    }
    return res.data;
  }

  return {
    workspaces,
    currentWorkspace,
    currentUserRole,
    loading,
    fetchWorkspaces,
    fetchWorkspace,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    inviteMember,
    removeMember,
    updateMemberRole,
  };
});
