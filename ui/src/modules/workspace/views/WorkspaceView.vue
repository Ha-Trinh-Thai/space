<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from '@/modules/workspace/store';
import { useAuthStore } from '@/modules/auth/store';
import { useDocumentStore } from '@/modules/document/store';
import { useCanvasStore } from '@/modules/canvas/store';
import { useMindmapStore } from '@/modules/mindmap/store';
import { useToastStore } from '@/shared/stores/toast';
import { useRouteParam } from '@/shared/composables/useRouteParam';

const router = useRouter();
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

const tab = ref('documents');

// Dialogs
const showRename = ref(false);
const showDelete = ref(false);
const showInvite = ref(false);

// Rename
const renameName = ref('');
const renaming = ref(false);

// Invite
const inviteEmail = ref('');
const inviteRole = ref<'EDITOR' | 'VIEWER'>('EDITOR');
const inviting = ref(false);

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
  const result: { id: string; title: string; icon: string | null }[] = [];
  function flatten(nodes: typeof tree.value) {
    for (const node of nodes) {
      result.push({ id: node.id, title: node.title, icon: node.icon });
      if (node.children.length) flatten(node.children);
    }
  }
  flatten(tree.value);
  return result;
});

onMounted(async () => {
  if (workspaceId.value) {
    await workspaceStore.fetchWorkspace(workspaceId.value);
    await documentStore.fetchTree(workspaceId.value);
    if (ws.value) renameName.value = ws.value.name;
  }
});

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

async function createDoc() {
  if (!workspaceId.value) return;
  const doc = await documentStore.createDocument(workspaceId.value);
  router.push({ name: 'document', params: { workspaceId: workspaceId.value, documentId: doc.id } });
}

async function createCanvas() {
  if (!workspaceId.value) return;
  const c = await canvasStore.createCanvas(workspaceId.value);
  router.push({ name: 'canvas', params: { workspaceId: workspaceId.value, canvasId: c.id } });
}

async function createMindmap() {
  if (!workspaceId.value) return;
  const m = await mindmapStore.createMindmap(workspaceId.value);
  router.push({ name: 'mindmap', params: { workspaceId: workspaceId.value, mindmapId: m.id } });
}

function roleColor(role: string) {
  return role === 'OWNER' ? 'primary' : role === 'EDITOR' ? 'success' : 'grey';
}
</script>

<template>
  <div v-if="ws" class="workspace-view pa-6 pa-md-8">
    <!-- Header -->
    <div class="workspace-header mb-6 pa-6 pa-md-8 rounded-xl">
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
          <v-btn
            v-if="canEdit"
            size="small"
            color="primary"
            prepend-icon="mdi-plus"
            @click="createDoc"
          >
            New Document
          </v-btn>
        </div>
        <v-card v-if="flatDocs.length">
          <v-list>
            <v-list-item
              v-for="doc in flatDocs"
              :key="doc.id"
              :title="doc.title || 'Untitled'"
              :prepend-icon="doc.icon || 'mdi-file-document-outline'"
              rounded="lg"
              class="mx-2 my-1"
              @click="
                router.push({
                  name: 'document',
                  params: { workspaceId: workspaceId, documentId: doc.id },
                })
              "
            >
              <template #append>
                <v-icon icon="mdi-chevron-right" size="18" class="text-medium-emphasis" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        <v-card v-else variant="outlined" class="pa-8 text-center">
          <v-icon
            icon="mdi-file-document-outline"
            size="48"
            color="primary"
            class="mb-4 opacity-50"
          />
          <p class="text-body-1 text-medium-emphasis mb-4">No documents yet</p>
          <v-btn v-if="canEdit" color="primary" prepend-icon="mdi-plus" @click="createDoc">
            Create First Document
          </v-btn>
        </v-card>
      </v-tabs-window-item>

      <!-- Canvases Tab -->
      <v-tabs-window-item value="canvases">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Canvases</h2>
          <v-btn
            v-if="canEdit"
            size="small"
            color="primary"
            prepend-icon="mdi-plus"
            @click="createCanvas"
          >
            New Canvas
          </v-btn>
        </div>
        <v-row v-if="canvases.length">
          <v-col v-for="c in canvases" :key="c.id" cols="12" sm="6" md="4">
            <v-card
              class="canvas-card"
              hover
              @click="
                router.push({
                  name: 'canvas',
                  params: { workspaceId: workspaceId, canvasId: c.id },
                })
              "
            >
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
          <v-btn v-if="canEdit" color="primary" prepend-icon="mdi-plus" @click="createCanvas">
            Create First Canvas
          </v-btn>
        </v-card>
      </v-tabs-window-item>

      <!-- Mindmaps Tab -->
      <v-tabs-window-item value="mindmaps">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Mindmaps</h2>
          <v-btn
            v-if="canEdit"
            size="small"
            color="primary"
            prepend-icon="mdi-plus"
            @click="createMindmap"
          >
            New Mindmap
          </v-btn>
        </div>
        <v-row v-if="mindmaps.length">
          <v-col v-for="m in mindmaps" :key="m.id" cols="12" sm="6" md="4">
            <v-card
              class="mindmap-card"
              hover
              @click="
                router.push({
                  name: 'mindmap',
                  params: { workspaceId: workspaceId, mindmapId: m.id },
                })
              "
            >
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
          <v-btn v-if="canEdit" color="primary" prepend-icon="mdi-plus" @click="createMindmap">
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
                    style="width: 130px"
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
    <v-dialog v-model="showDelete" max-width="440">
      <v-card class="pa-2">
        <v-card-title class="font-weight-bold">Delete Workspace</v-card-title>
        <v-card-text>
          <v-alert type="warning" variant="tonal" class="mb-4">
            This action cannot be undone. All documents, canvases, and mindmaps will be permanently
            deleted.
          </v-alert>
          Are you sure you want to delete <strong>{{ ws.name }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="secondary" @click="showDelete = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="handleDelete">Delete Workspace</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

  <div v-else class="d-flex flex-column justify-center align-center" style="height: 50vh">
    <v-progress-circular indeterminate color="primary" size="40" />
    <p class="text-body-2 text-medium-emphasis mt-4">Loading workspace...</p>
  </div>
</template>

<style scoped>
.workspace-header {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.04) 100%);
  border: 1px solid rgba(249, 115, 22, 0.12);
}
</style>
