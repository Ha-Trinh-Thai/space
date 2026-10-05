<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from '@/modules/workspace/store';
import { useAuthStore } from '@/modules/auth/store';
import { useDocumentStore } from '@/modules/document/store';
import { useCanvasStore } from '@/modules/canvas/store';
import { useMindmapStore } from '@/modules/mindmap/store';
import { useToastStore } from '@/shared/stores/toast';
import { useRouteParam } from '@/shared/composables/useRouteParam';
import { ConfirmModal } from '@/components/ui';

const router = useRouter();
const route = useRoute();
const workspaceStore = useWorkspaceStore();
const auth = useAuthStore();
const documentStore = useDocumentStore();
const canvasStore = useCanvasStore();
const mindmapStore = useMindmapStore();
const toast = useToastStore();

const workspaceId = useRouteParam('workspaceId');
const { currentWorkspace } = storeToRefs(workspaceStore);
const { tree } = storeToRefs(documentStore);
const { canvases } = storeToRefs(canvasStore);
const { mindmaps } = storeToRefs(mindmapStore);

const VALID_TABS = ['documents', 'canvases', 'mindmaps', 'members'];

function resolveInitialTab(): string {
  const queryTab = route.query.tab;
  return typeof queryTab === 'string' && VALID_TABS.includes(queryTab) ? queryTab : 'documents';
}

const tab = ref(resolveInitialTab());

// Layout preference per tab
const docLayout = ref<'list' | 'card'>('list');
const canvasLayout = ref<'list' | 'card'>('list');
const mindmapLayout = ref<'list' | 'card'>('list');

// Dialogs
const showRename = ref(false);
const showDelete = ref(false);
const showInvite = ref(false);
const showDeleteDoc = ref(false);
const docToDelete = ref<{ id: string; title: string } | null>(null);
const showDeleteCanvas = ref(false);
const canvasToDelete = ref<{ id: string; title: string } | null>(null);
const showDeleteMindmap = ref(false);
const mindmapToDelete = ref<{ id: string; title: string } | null>(null);

// Rename
const renameName = ref('');
const renaming = ref(false);

// Invite
const inviteEmail = ref('');
const inviteRole = ref<'EDITOR' | 'VIEWER'>('EDITOR');
const inviting = ref(false);

// Create
const creatingDoc = ref(false);
const creatingCanvas = ref(false);
const creatingMindmap = ref(false);

const ws = currentWorkspace;
const myRole = computed(() => {
  if (!ws.value || !auth.user) return null;
  const member = ws.value.members.find((m) => m.userId === auth.user!.id);
  return member?.role ?? null;
});
const isOwner = computed(() => myRole.value === 'OWNER');
const canEdit = computed(() => myRole.value === 'OWNER' || myRole.value === 'EDITOR');

// Flatten document tree for display
const flatDocs = computed(() => {
  const result: { id: string; title: string; icon: string | null; createdAt: string }[] = [];
  function flatten(nodes: typeof tree.value) {
    for (const node of nodes) {
      result.push({ id: node.id, title: node.title, icon: node.icon, createdAt: node.createdAt });
      if (node.children.length) flatten(node.children);
    }
  }
  flatten(tree.value);
  return result;
});

watch(
  workspaceId,
  async (id) => {
    if (!id) return;
    await Promise.all([
      workspaceStore.fetchWorkspace(id),
      documentStore.fetchTree(id),
      canvasStore.fetchCanvases(id),
      mindmapStore.fetchMindmaps(id),
    ]);
    if (ws.value) renameName.value = ws.value.name;
  },
  { immediate: true },
);

async function handleRename() {
  if (!renameName.value.trim() || !workspaceId.value) return;
  renaming.value = true;
  try {
    await workspaceStore.renameWorkspace(workspaceId.value, renameName.value.trim());
    showRename.value = false;
    toast.success('Workspace renamed');
  } finally {
    renaming.value = false;
  }
}

async function handleDelete() {
  if (!workspaceId.value) return;
  await workspaceStore.deleteWorkspace(workspaceId.value);
  toast.success('Workspace deleted');
  router.push({ name: 'home' });
}

async function handleInvite() {
  if (!inviteEmail.value.trim() || !workspaceId.value) return;
  inviting.value = true;
  try {
    await workspaceStore.inviteMember(
      workspaceId.value,
      inviteEmail.value.trim(),
      inviteRole.value,
    );
    showInvite.value = false;
    inviteEmail.value = '';
    toast.success('Member invited');
  } finally {
    inviting.value = false;
  }
}

async function handleRemoveMember(memberId: string) {
  if (!workspaceId.value) return;
  await workspaceStore.removeMember(workspaceId.value, memberId);
  toast.success('Member removed');
}

async function handleRoleChange(memberId: string, role: string) {
  if (!workspaceId.value) return;
  await workspaceStore.updateMemberRole(workspaceId.value, memberId, role);
  toast.success('Role updated');
}

function confirmDeleteDoc(doc: { id: string; title: string }) {
  docToDelete.value = doc;
  showDeleteDoc.value = true;
}

async function handleDeleteDoc() {
  if (!docToDelete.value || !workspaceId.value) return;
  await documentStore.deleteDocument(docToDelete.value.id, workspaceId.value);
  toast.success('Document deleted');
  showDeleteDoc.value = false;
  docToDelete.value = null;
}

function confirmDeleteCanvas(c: { id: string; title: string }) {
  canvasToDelete.value = c;
  showDeleteCanvas.value = true;
}

async function handleDeleteCanvas() {
  if (!canvasToDelete.value) return;
  await canvasStore.deleteCanvas(canvasToDelete.value.id);
  toast.success('Canvas deleted');
  showDeleteCanvas.value = false;
  canvasToDelete.value = null;
}

function confirmDeleteMindmap(m: { id: string; title: string }) {
  mindmapToDelete.value = m;
  showDeleteMindmap.value = true;
}

async function handleDeleteMindmap() {
  if (!mindmapToDelete.value) return;
  await mindmapStore.deleteMindmap(mindmapToDelete.value.id);
  toast.success('Mindmap deleted');
  showDeleteMindmap.value = false;
  mindmapToDelete.value = null;
}

async function createDoc() {
  if (!workspaceId.value || creatingDoc.value) return;
  creatingDoc.value = true;
  try {
    const doc = await documentStore.createDocument(workspaceId.value);
    router.push({
      name: 'document',
      params: { workspaceId: workspaceId.value, documentId: doc.id },
    });
  } finally {
    creatingDoc.value = false;
  }
}

async function createCanvas() {
  if (!workspaceId.value || creatingCanvas.value) return;
  creatingCanvas.value = true;
  try {
    const c = await canvasStore.createCanvas(workspaceId.value);
    router.push({ name: 'canvas', params: { workspaceId: workspaceId.value, canvasId: c.id } });
  } finally {
    creatingCanvas.value = false;
  }
}

async function createMindmap() {
  if (!workspaceId.value || creatingMindmap.value) return;
  creatingMindmap.value = true;
  try {
    const m = await mindmapStore.createMindmap(workspaceId.value);
    router.push({ name: 'mindmap', params: { workspaceId: workspaceId.value, mindmapId: m.id } });
  } finally {
    creatingMindmap.value = false;
  }
}

function roleColor(role: string) {
  return role === 'OWNER' ? 'primary' : role === 'EDITOR' ? 'success' : 'grey';
}
</script>

<template>
  <div v-if="ws" class="workspace-view pa-6 pa-md-8">
    <!-- Header -->
    <div
      class="mb-6 pa-6 pa-md-8 rounded-xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-brand)_8%,transparent)_0%,color-mix(in_srgb,var(--color-brand-hover)_4%,transparent)_100%)] border border-[color-mix(in_srgb,var(--color-brand)_12%,transparent)]"
    >
      <div class="d-flex align-center justify-space-between flex-wrap ga-4">
        <div class="d-flex align-center">
          <v-avatar color="primary" size="56" class="mr-4">
            <v-icon icon="mdi-folder-open" size="28" color="white" />
          </v-avatar>
          <div>
            <h1 class="text-h5 font-weight-bold">{{ ws.name }}</h1>
            <p class="text-body-2 text-medium-emphasis">
              {{ ws.members.length }} member{{ ws.members.length !== 1 ? 's' : '' }} &middot;
              Created {{ new Date(ws.createdAt).toLocaleDateString() }}
            </p>
          </div>
        </div>
        <div class="d-flex ga-3">
          <v-btn
            v-if="canEdit"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-pencil-outline"
            size="small"
            @click="showRename = true"
          >
            Rename
          </v-btn>
          <v-btn
            v-if="isOwner"
            variant="outlined"
            color="error"
            prepend-icon="mdi-delete-outline"
            size="small"
            @click="showDelete = true"
          >
            Delete
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Content Tabs -->
    <v-tabs v-model="tab" color="primary" class="mb-6">
      <v-tab value="documents" prepend-icon="mdi-file-document-outline">
        Documents
        <v-chip size="x-small" variant="tonal" class="ml-2">{{ flatDocs.length }}</v-chip>
      </v-tab>
      <v-tab value="canvases" prepend-icon="mdi-draw">
        Canvases
        <v-chip size="x-small" variant="tonal" class="ml-2">{{ canvases.length }}</v-chip>
      </v-tab>
      <v-tab value="mindmaps" prepend-icon="mdi-sitemap">
        Mindmaps
        <v-chip size="x-small" variant="tonal" class="ml-2">{{ mindmaps.length }}</v-chip>
      </v-tab>
      <v-tab value="members" prepend-icon="mdi-account-group-outline">
        Members
        <v-chip size="x-small" variant="tonal" class="ml-2">{{ ws.members.length }}</v-chip>
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <!-- Documents Tab -->
      <v-tabs-window-item value="documents">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Documents</h2>
          <div class="d-flex align-center ga-4">
            <v-btn-toggle
              v-model="docLayout"
              mandatory
              variant="text"
              class="h-auto! gap-1! rounded-xl! border-none! bg-vt-on-surface/[.045] px-1! [&>.v-btn]:h-11! [&>.v-btn]:w-11! [&>.v-btn]:rounded-[9px]! [&_.v-icon]:text-[22px] [&>.v-btn--active]:bg-vt-primary! [&>.v-btn--active_.v-icon]:text-vt-on-primary!"
            >
              <v-btn value="list" icon="mdi-view-list" />
              <v-btn value="card" icon="mdi-view-grid" />
            </v-btn-toggle>
            <v-btn
              v-if="canEdit"
              size="small"
              class="btn-cta"
              prepend-icon="mdi-plus"
              :loading="creatingDoc"
              @click="createDoc"
            >
              New Document
            </v-btn>
          </div>
        </div>
        <v-card v-if="flatDocs.length && docLayout === 'list'">
          <v-list>
            <v-list-item
              v-for="doc in flatDocs"
              :key="doc.id"
              :title="doc.title || 'Untitled'"
              :prepend-icon="doc.icon || 'mdi-file-document-outline'"
              rounded="lg"
              class="mx-2 my-1 group"
              @click="
                router.push({
                  name: 'document',
                  params: { workspaceId: workspaceId, documentId: doc.id },
                })
              "
            >
              <template #append>
                <v-btn
                  v-if="canEdit"
                  icon="mdi-delete-outline"
                  size="x-small"
                  variant="text"
                  color="error"
                  class="mr-1 opacity-0 group-hover:opacity-100"
                  @click.stop="confirmDeleteDoc(doc)"
                />
                <v-icon icon="mdi-chevron-right" size="18" class="text-medium-emphasis" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        <v-row v-else-if="flatDocs.length">
          <v-col v-for="doc in flatDocs" :key="doc.id" cols="12" sm="6" md="6">
            <v-card
              class="position-relative group"
              hover
              @click="
                router.push({
                  name: 'document',
                  params: { workspaceId: workspaceId, documentId: doc.id },
                })
              "
            >
              <v-btn
                v-if="canEdit"
                icon="mdi-delete-outline"
                size="x-small"
                variant="text"
                color="error"
                class="position-absolute opacity-0 group-hover:opacity-100 top-2 right-2 z-1"
                @click.stop="confirmDeleteDoc(doc)"
              />
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" size="40" variant="tonal">
                    <v-icon :icon="doc.icon || 'mdi-file-document-outline'" />
                  </v-avatar>
                </template>
                <v-card-title class="text-body-1 font-weight-medium">
                  {{ doc.title || 'Untitled' }}
                </v-card-title>
                <v-card-subtitle class="text-caption">
                  {{ new Date(doc.createdAt).toLocaleDateString() }}
                </v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
        <v-card v-else variant="outlined" class="pa-8 text-center">
          <v-icon
            icon="mdi-file-document-outline"
            size="48"
            color="primary"
            class="mb-4 opacity-50"
          />
          <p class="text-body-1 text-medium-emphasis mb-4">No documents yet</p>
          <v-btn
            v-if="canEdit"
            class="btn-cta"
            prepend-icon="mdi-plus"
            :loading="creatingDoc"
            @click="createDoc"
          >
            Create First Document
          </v-btn>
        </v-card>
      </v-tabs-window-item>

      <!-- Canvases Tab -->
      <v-tabs-window-item value="canvases">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Canvases</h2>
          <div class="d-flex align-center ga-4">
            <v-btn-toggle
              v-model="canvasLayout"
              mandatory
              variant="text"
              class="h-auto! gap-1! rounded-xl! border-none! bg-vt-on-surface/[.045] px-1! [&>.v-btn]:h-11! [&>.v-btn]:w-11! [&>.v-btn]:rounded-[9px]! [&_.v-icon]:text-[22px] [&>.v-btn--active]:bg-vt-primary! [&>.v-btn--active_.v-icon]:text-vt-on-primary!"
            >
              <v-btn value="list" icon="mdi-view-list" />
              <v-btn value="card" icon="mdi-view-grid" />
            </v-btn-toggle>
            <v-btn
              v-if="canEdit"
              size="small"
              class="btn-cta"
              prepend-icon="mdi-plus"
              :loading="creatingCanvas"
              @click="createCanvas"
            >
              New Canvas
            </v-btn>
          </div>
        </div>
        <v-card v-if="canvases.length && canvasLayout === 'list'">
          <v-list>
            <v-list-item
              v-for="c in canvases"
              :key="c.id"
              :title="c.title || 'Untitled Canvas'"
              :subtitle="new Date(c.updatedAt).toLocaleDateString()"
              prepend-icon="mdi-draw"
              rounded="lg"
              class="mx-2 my-1 group"
              @click="
                router.push({
                  name: 'canvas',
                  params: { workspaceId: workspaceId, canvasId: c.id },
                })
              "
            >
              <template #append>
                <v-btn
                  v-if="canEdit"
                  icon="mdi-delete-outline"
                  size="x-small"
                  variant="text"
                  color="error"
                  class="mr-1 opacity-0 group-hover:opacity-100"
                  @click.stop="confirmDeleteCanvas(c)"
                />
                <v-icon icon="mdi-chevron-right" size="18" class="text-medium-emphasis" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        <v-row v-else-if="canvases.length">
          <v-col v-for="c in canvases" :key="c.id" cols="12" sm="6" md="6">
            <v-card
              class="position-relative group"
              hover
              @click="
                router.push({
                  name: 'canvas',
                  params: { workspaceId: workspaceId, canvasId: c.id },
                })
              "
            >
              <v-btn
                v-if="canEdit"
                icon="mdi-delete-outline"
                size="x-small"
                variant="text"
                color="error"
                class="position-absolute opacity-0 group-hover:opacity-100 top-2 right-2 z-1"
                @click.stop="confirmDeleteCanvas(c)"
              />
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" size="40" variant="tonal">
                    <v-icon icon="mdi-draw" />
                  </v-avatar>
                </template>
                <v-card-title class="text-body-1 font-weight-medium">
                  {{ c.title || 'Untitled Canvas' }}
                </v-card-title>
                <v-card-subtitle class="text-caption">
                  {{ new Date(c.updatedAt).toLocaleDateString() }}
                </v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
        <v-card v-else variant="outlined" class="pa-8 text-center">
          <v-icon icon="mdi-draw" size="48" color="primary" class="mb-4 opacity-50" />
          <p class="text-body-1 text-medium-emphasis mb-4">No canvases yet</p>
          <v-btn
            v-if="canEdit"
            class="btn-cta"
            prepend-icon="mdi-plus"
            :loading="creatingCanvas"
            @click="createCanvas"
          >
            Create First Canvas
          </v-btn>
        </v-card>
      </v-tabs-window-item>

      <!-- Mindmaps Tab -->
      <v-tabs-window-item value="mindmaps">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Mindmaps</h2>
          <div class="d-flex align-center ga-4">
            <v-btn-toggle
              v-model="mindmapLayout"
              mandatory
              variant="text"
              class="h-auto! gap-1! rounded-xl! border-none! bg-vt-on-surface/[.045] px-1! [&>.v-btn]:h-11! [&>.v-btn]:w-11! [&>.v-btn]:rounded-[9px]! [&_.v-icon]:text-[22px] [&>.v-btn--active]:bg-vt-primary! [&>.v-btn--active_.v-icon]:text-vt-on-primary!"
            >
              <v-btn value="list" icon="mdi-view-list" />
              <v-btn value="card" icon="mdi-view-grid" />
            </v-btn-toggle>
            <v-btn
              v-if="canEdit"
              size="small"
              class="btn-cta"
              prepend-icon="mdi-plus"
              :loading="creatingMindmap"
              @click="createMindmap"
            >
              New Mindmap
            </v-btn>
          </div>
        </div>
        <v-card v-if="mindmaps.length && mindmapLayout === 'list'">
          <v-list>
            <v-list-item
              v-for="m in mindmaps"
              :key="m.id"
              :title="m.title || 'Untitled Mindmap'"
              :subtitle="new Date(m.updatedAt).toLocaleDateString()"
              prepend-icon="mdi-sitemap"
              rounded="lg"
              class="mx-2 my-1 group"
              @click="
                router.push({
                  name: 'mindmap',
                  params: { workspaceId: workspaceId, mindmapId: m.id },
                })
              "
            >
              <template #append>
                <v-btn
                  v-if="canEdit"
                  icon="mdi-delete-outline"
                  size="x-small"
                  variant="text"
                  color="error"
                  class="mr-1 opacity-0 group-hover:opacity-100"
                  @click.stop="confirmDeleteMindmap(m)"
                />
                <v-icon icon="mdi-chevron-right" size="18" class="text-medium-emphasis" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        <v-row v-else-if="mindmaps.length">
          <v-col v-for="m in mindmaps" :key="m.id" cols="12" sm="6" md="6">
            <v-card
              class="position-relative group"
              hover
              @click="
                router.push({
                  name: 'mindmap',
                  params: { workspaceId: workspaceId, mindmapId: m.id },
                })
              "
            >
              <v-btn
                v-if="canEdit"
                icon="mdi-delete-outline"
                size="x-small"
                variant="text"
                color="error"
                class="position-absolute opacity-0 group-hover:opacity-100 top-2 right-2 z-1"
                @click.stop="confirmDeleteMindmap(m)"
              />
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" size="40" variant="tonal">
                    <v-icon icon="mdi-sitemap" />
                  </v-avatar>
                </template>
                <v-card-title class="text-body-1 font-weight-medium">
                  {{ m.title || 'Untitled Mindmap' }}
                </v-card-title>
                <v-card-subtitle class="text-caption">
                  {{ new Date(m.updatedAt).toLocaleDateString() }}
                </v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
        <v-card v-else variant="outlined" class="pa-8 text-center">
          <v-icon icon="mdi-sitemap" size="48" color="primary" class="mb-4 opacity-50" />
          <p class="text-body-1 text-medium-emphasis mb-4">No mindmaps yet</p>
          <v-btn
            v-if="canEdit"
            class="btn-cta"
            prepend-icon="mdi-plus"
            :loading="creatingMindmap"
            @click="createMindmap"
          >
            Create First Mindmap
          </v-btn>
        </v-card>
      </v-tabs-window-item>

      <!-- Members Tab -->
      <v-tabs-window-item value="members">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Members</h2>
          <v-btn
            v-if="canEdit"
            size="small"
            color="primary"
            prepend-icon="mdi-account-plus-outline"
            @click="showInvite = true"
          >
            Invite
          </v-btn>
        </div>
        <v-card>
          <v-list lines="two">
            <v-list-item v-for="member in ws.members" :key="member.id" class="py-3">
              <template #prepend>
                <v-avatar
                  :color="member.userId === auth.user?.id ? 'primary' : 'grey'"
                  size="40"
                  class="mr-3"
                >
                  <span class="text-body-2 font-weight-bold text-white">
                    {{ member.user.name.charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ member.user.name }}
                <v-chip
                  v-if="member.userId === auth.user?.id"
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  class="ml-1"
                  >You</v-chip
                >
              </v-list-item-title>
              <v-list-item-subtitle>{{ member.user.email }}</v-list-item-subtitle>
              <template #append>
                <div class="d-flex align-center ga-2">
                  <v-select
                    v-if="isOwner && member.userId !== auth.user?.id"
                    :model-value="member.role"
                    :items="['OWNER', 'EDITOR', 'VIEWER']"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="w-32.5"
                    @update:model-value="(v: string) => handleRoleChange(member.id, v)"
                  />
                  <v-chip v-else size="small" :color="roleColor(member.role)" variant="tonal">
                    {{ member.role }}
                  </v-chip>
                  <v-btn
                    v-if="isOwner && member.userId !== auth.user?.id"
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="handleRemoveMember(member.id)"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Rename Dialog -->
    <v-dialog v-model="showRename" max-width="440">
      <v-card class="pa-2">
        <v-card-title class="font-weight-bold">Rename Workspace</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="renameName"
            label="New name"
            autofocus
            @keyup.enter="handleRename"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="secondary" @click="showRename = false">Cancel</v-btn>
          <v-btn color="primary" :loading="renaming" @click="handleRename">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <ConfirmModal
      v-model="showDelete"
      title="Delete Workspace"
      warning="This action cannot be undone. All documents, canvases, and mindmaps will be permanently deleted."
      confirm-text="Delete Workspace"
      confirm-color="error"
      @confirm="handleDelete"
    >
      Are you sure you want to delete <strong>{{ ws.name }}</strong
      >?
    </ConfirmModal>

    <!-- Delete Document Dialog -->
    <ConfirmModal
      v-model="showDeleteDoc"
      title="Delete Document"
      warning="This action cannot be undone."
      confirm-text="Delete"
      confirm-color="error"
      @confirm="handleDeleteDoc"
    >
      Are you sure you want to delete <strong>{{ docToDelete?.title || 'Untitled' }}</strong
      >?
    </ConfirmModal>

    <!-- Delete Canvas Dialog -->
    <ConfirmModal
      v-model="showDeleteCanvas"
      title="Delete Canvas"
      warning="This action cannot be undone."
      confirm-text="Delete"
      confirm-color="error"
      @confirm="handleDeleteCanvas"
    >
      Are you sure you want to delete
      <strong>{{ canvasToDelete?.title || 'Untitled Canvas' }}</strong
      >?
    </ConfirmModal>

    <!-- Delete Mindmap Dialog -->
    <ConfirmModal
      v-model="showDeleteMindmap"
      title="Delete Mindmap"
      warning="This action cannot be undone."
      confirm-text="Delete"
      confirm-color="error"
      @confirm="handleDeleteMindmap"
    >
      Are you sure you want to delete
      <strong>{{ mindmapToDelete?.title || 'Untitled Mindmap' }}</strong
      >?
    </ConfirmModal>

    <!-- Invite Dialog -->
    <v-dialog v-model="showInvite" max-width="440">
      <v-card class="pa-2">
        <v-card-title class="font-weight-bold">Invite Member</v-card-title>
        <v-card-text>
          <v-text-field v-model="inviteEmail" label="Email address" type="email" class="mb-3" />
          <v-select v-model="inviteRole" :items="['EDITOR', 'VIEWER']" label="Role" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="secondary" @click="showInvite = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="inviting"
            :disabled="!inviteEmail.trim()"
            @click="handleInvite"
          >
            Send Invite
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <div v-else class="d-flex flex-column justify-center align-center h-[50vh]">
    <v-progress-circular indeterminate color="primary" size="40" />
    <p class="text-body-2 text-medium-emphasis mt-4">Loading workspace...</p>
  </div>
</template>
