<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useTheme } from 'vuetify';
import { useWorkspaceStore } from '@/modules/workspace/store';
import { useAuthStore } from '@/modules/auth/store';
import { useCanvasStore } from '@/modules/canvas/store';
import { useMindmapStore } from '@/modules/mindmap/store';
import DocumentTree from '@/modules/document/components/DocumentTree.vue';
import AppLogo from '@/shared/components/AppLogo.vue';

const drawer = ref(true);
const sideBarCollapsed = ref(false);

const router = useRouter();
const route = useRoute();
const theme = useTheme();
const workspaceStore = useWorkspaceStore();
const auth = useAuthStore();
const canvasStore = useCanvasStore();
const mindmapStore = useMindmapStore();

const { workspaces } = storeToRefs(workspaceStore);
const { user, isAuthenticated } = storeToRefs(auth);
const { canvases } = storeToRefs(canvasStore);
const { mindmaps } = storeToRefs(mindmapStore);

const currentWorkspaceId = computed(() => (route.params.workspaceId as string) || null);
const currentWorkspaceName = computed(() => {
  if (!currentWorkspaceId.value) return null;
  return workspaces.value.find((w) => w.id === currentWorkspaceId.value)?.name ?? 'Workspace';
});

const isDark = computed(() => theme.global.name.value === 'dark');
function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark';
}

// Collapsible sections
const showCanvases = ref(true);
const showMindmaps = ref(true);

onMounted(() => {
  if (isAuthenticated.value) {
    auth.fetchUser();
    workspaceStore.fetchWorkspaces();
  }
});

watch(
  currentWorkspaceId,
  (id) => {
    if (id) {
      canvasStore.fetchCanvases(id);
      mindmapStore.fetchMindmaps(id);
    }
  },
  { immediate: true },
);

function goToWorkspace(id: string) {
  router.push({ name: 'workspace', params: { workspaceId: id } });
}

function openCanvas(id: string) {
  router.push({ name: 'canvas', params: { workspaceId: currentWorkspaceId.value, canvasId: id } });
}

async function createCanvas() {
  if (!currentWorkspaceId.value) return;
  const c = await canvasStore.createCanvas(currentWorkspaceId.value);
  openCanvas(c.id);
}

function openMindmap(id: string) {
  router.push({
    name: 'mindmap',
    params: { workspaceId: currentWorkspaceId.value, mindmapId: id },
  });
}

async function createMindmap() {
  if (!currentWorkspaceId.value) return;
  const m = await mindmapStore.createMindmap(currentWorkspaceId.value);
  openMindmap(m.id);
}
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    permanent
    :rail="sideBarCollapsed"
    rail-width="65"
    width="260"
    class="sidebar"
  >
    <div class="h-12.5 pa-4 pb-3 d-flex align-center">
      <AppLogo v-if="!sideBarCollapsed" size="sm" class="mr-3" />

      <span v-if="!sideBarCollapsed" class="text-subtitle-1 font-weight-bold">Space</span>

      <v-spacer v-if="!sideBarCollapsed" />

      <v-btn
        icon
        size="small"
        variant="text"
        density="compact"
        :width="sideBarCollapsed ? '100%' : '32px'"
        @click.stop="sideBarCollapsed = !sideBarCollapsed"
      >
        <v-icon :icon="sideBarCollapsed ? 'mdi-collage' : 'mdi-chevron-left'" />
      </v-btn>
    </div>

    <v-divider class="mx-4 mb-2" />

    <!-- Home link -->
    <v-list nav class="px-3 py-0">
      <v-list-item prepend-icon="mdi-home-outline" title="Home" to="/" exact class="mb-1" />
    </v-list>

    <!-- Inside a workspace -->
    <template v-if="currentWorkspaceId && !sideBarCollapsed">
      <!-- Workspace indicator -->
      <v-sheet
        class="mx-2 my-3 pa-3 rounded-lg d-flex align-center cursor-pointer"
        color="orange-lighten-5"
        @click="goToWorkspace(currentWorkspaceId)"
      >
        <v-icon icon="mdi-folder-open" size="18" class="mr-2 text-primary" />
        <span class="text-body-2 font-weight-medium text-truncate">{{ currentWorkspaceName }}</span>
      </v-sheet>

      <DocumentTree :workspace-id="currentWorkspaceId" />

      <!-- Canvas section -->
      <div class="section-header d-flex align-center px-5 py-2 mt-2">
        <v-btn
          :icon="showCanvases ? 'mdi-chevron-down' : 'mdi-chevron-right'"
          size="x-small"
          variant="text"
          density="compact"
          class="mr-1"
          @click="showCanvases = !showCanvases"
        />
        <span
          class="text-caption text-medium-emphasis text-uppercase font-weight-bold grow letter-spacing-1"
        >
          Canvases
        </span>
        <v-btn
          icon="mdi-plus"
          size="x-small"
          variant="text"
          density="compact"
          @click="createCanvas"
        />
      </div>
      <v-expand-transition>
        <v-list v-show="showCanvases" nav class="py-0 px-3">
          <v-list-item
            v-for="canvas in canvases"
            :key="canvas.id"
            :title="canvas.title"
            prepend-icon="mdi-draw"
            :active="route.params.canvasId === canvas.id"
            rounded="lg"
            @click="openCanvas(canvas.id)"
          />
          <v-list-item v-if="canvases.length === 0" class="text-medium-emphasis" rounded="lg">
            <template #prepend>
              <v-icon icon="mdi-draw" size="18" class="opacity-40" />
            </template>
            <v-list-item-title class="text-body-2 font-italic">No canvases yet</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-expand-transition>

      <!-- Mindmap section -->
      <div class="section-header d-flex align-center px-5 py-2 mt-2">
        <v-btn
          :icon="showMindmaps ? 'mdi-chevron-down' : 'mdi-chevron-right'"
          size="x-small"
          variant="text"
          density="compact"
          class="mr-1"
          @click="showMindmaps = !showMindmaps"
        />
        <span
          class="text-caption text-medium-emphasis text-uppercase font-weight-bold grow letter-spacing-1"
        >
          Mindmaps
        </span>
        <v-btn
          icon="mdi-plus"
          size="x-small"
          variant="text"
          density="compact"
          @click="createMindmap"
        />
      </div>
      <v-expand-transition>
        <v-list v-show="showMindmaps" nav class="py-0 px-3">
          <v-list-item
            v-for="m in mindmaps"
            :key="m.id"
            :title="m.title"
            prepend-icon="mdi-sitemap"
            :active="route.params.mindmapId === m.id"
            rounded="lg"
            @click="openMindmap(m.id)"
          />
          <v-list-item v-if="mindmaps.length === 0" class="text-medium-emphasis" rounded="lg">
            <template #prepend>
              <v-icon icon="mdi-sitemap" size="18" class="opacity-40" />
            </template>
            <v-list-item-title class="text-body-2 font-italic">No mindmaps yet</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-expand-transition>
    </template>

    <!-- Workspace list (home) -->
    <template v-else-if="!currentWorkspaceId && !sideBarCollapsed">
      <div class="section-header d-flex align-center px-5 py-2 mt-2">
        <span
          class="text-caption text-medium-emphasis text-uppercase font-weight-bold letter-spacing-1"
        >
          Workspaces
        </span>
      </div>
      <v-list nav class="px-3">
        <v-list-item
          v-for="workspace in workspaces"
          :key="workspace.id"
          :title="workspace.name"
          prepend-icon="mdi-folder-outline"
          rounded="lg"
          @click="goToWorkspace(workspace.id)"
        />
        <v-list-item
          v-if="workspaces.length === 0"
          disabled
          class="text-medium-emphasis"
          rounded="lg"
        >
          <v-list-item-title class="text-body-2 font-italic">No workspaces</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>

    <!-- Footer -->
    <template #append>
      <v-divider class="mx-4" />
      <div>
        <div v-if="user" class="pa-3 d-flex align-center">
          <v-avatar
            size="32"
            color="primary"
            class="mr-3 cursor-pointer"
            @click.stop="router.push({ name: 'profile' })"
          >
            <span class="text-body-2 font-weight-bold text-white">
              {{ user.name.charAt(0).toUpperCase() }}
            </span>
          </v-avatar>
          <div class="grow overflow-hidden">
            <div class="text-body-2 font-weight-medium text-truncate">{{ user.name }}</div>
          </div>
          <v-btn
            :inert="sideBarCollapsed"
            :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            size="x-small"
            variant="text"
            class="ml-1"
            @click.stop="toggleTheme"
          />
          <v-btn
            :inert="sideBarCollapsed"
            icon="mdi-logout"
            size="x-small"
            variant="text"
            @click.stop="auth.logout()"
          />
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.workspace-indicator {
  background: rgba(249, 115, 22, 0.06);
}

.section-header {
  min-height: 32px;
}

.letter-spacing-1 {
  letter-spacing: 0.05em;
}
</style>
