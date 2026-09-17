<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useTheme } from 'vuetify';
import { useWorkspaceStore } from '@/modules/workspace/store';
import { useAuthStore } from '@/modules/auth/store';
import AppLogo from '@/shared/components/AppLogo.vue';

const drawer = ref(true);
const sideBarCollapsed = ref(false);

const router = useRouter();
const route = useRoute();
const theme = useTheme();
const workspaceStore = useWorkspaceStore();
const auth = useAuthStore();

const { workspaces } = storeToRefs(workspaceStore);
const { user, isAuthenticated } = storeToRefs(auth);

const currentWorkspaceId = computed(() => (route.params.workspaceId as string) || null);

const isDark = computed(() => theme.global.name.value === 'dark');
function toggleTheme() {
  const next = isDark.value ? 'light' : 'dark';
  theme.global.name.value = next;
  localStorage.setItem('theme', next);
}

onMounted(() => {
  if (isAuthenticated.value) {
    auth.fetchUser();
    workspaceStore.fetchWorkspaces();
  }
});

function goToWorkspace(id: string) {
  router.push({ name: 'workspace', params: { workspaceId: id } });
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

    <!-- Workspace list -->
    <template v-if="!sideBarCollapsed">
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
          :active="currentWorkspaceId === workspace.id"
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

.section-header {
  min-height: 32px;
}

.letter-spacing-1 {
  letter-spacing: 0.05em;
}
</style>
