<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from '@/modules/workspace/store';
import { useAuthStore } from '@/modules/auth/store';

const router = useRouter();
const workspaceStore = useWorkspaceStore();
const auth = useAuthStore();

const { workspaces, loading } = storeToRefs(workspaceStore);

const showCreate = ref(false);
const newName = ref('');
const creating = ref(false);

const cardGradients = [
  'linear-gradient(135deg, #f97316, #ea580c)',
  'linear-gradient(135deg, #1c1917, #292524)',
  'linear-gradient(135deg, #fb923c, #f97316)',
  'linear-gradient(135deg, #292524, #1c1917)',
  'linear-gradient(135deg, #ea580c, #c2410c)',
  'linear-gradient(135deg, #fdba74, #fb923c)',
];

const cardColors = ['#f97316', '#1c1917', '#fb923c', '#292524', '#ea580c', '#fdba74'];

onMounted(async () => {
  await workspaceStore.fetchWorkspaces();
});

async function createWorkspace() {
  if (!newName.value.trim()) return;
  creating.value = true;
  try {
    const ws = await workspaceStore.createWorkspace(newName.value.trim());
    showCreate.value = false;
    newName.value = '';
    router.push({ name: 'workspace', params: { workspaceId: ws.id } });
  } finally {
    creating.value = false;
  }
}

function openWorkspace(id: string) {
  router.push({ name: 'workspace', params: { workspaceId: id } });
}
</script>

<template>
  <div class="home-view pa-6 pa-md-10">
    <!-- Welcome Hero -->
    <div class="welcome-hero mb-10 pa-8 pa-md-10 rounded-xl">
      <v-row align="center">
        <v-col cols="12" md="8">
          <div class="d-flex align-center mb-3">
            <v-avatar color="rgba(255,255,255,0.15)" size="48" class="mr-4">
              <v-icon icon="mdi-hand-wave" size="24" color="white" />
            </v-avatar>
            <div>
              <h1 class="text-h4 text-md-h3 font-weight-bold text-white">
                Welcome back{{ auth.user ? ', ' + auth.user.name : '' }}
              </h1>
            </div>
          </div>
          <p class="text-body-1 text-white ml-16" style="opacity: 0.8">
            Pick up where you left off or create a new workspace to start collaborating.
          </p>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-md-end">
          <v-btn
            size="large"
            prepend-icon="mdi-plus"
            class="hero-btn font-weight-bold"
            @click="showCreate = true"
          >
            New Workspace
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- Section title -->
    <div class="d-flex align-center mb-5">
      <v-icon icon="mdi-folder-multiple-outline" size="20" class="mr-2 text-medium-emphasis" />
      <span class="text-subtitle-1 font-weight-bold">Your Workspaces</span>
      <v-chip size="small" variant="tonal" color="primary" class="ml-2">{{
        workspaces.length
      }}</v-chip>
    </div>

    <v-row v-if="loading">
      <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card" class="rounded-xl" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="(ws, i) in workspaces" :key="ws.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="workspace-card h-100" hover @click="openWorkspace(ws.id)">
          <div
            class="workspace-card-accent"
            :style="{ background: cardGradients[i % cardGradients.length] }"
          />
          <v-card-item class="pt-8">
            <template #prepend>
              <v-avatar :color="cardColors[i % cardColors.length]" size="40" class="mr-3">
                <v-icon icon="mdi-folder-outline" color="white" size="20" />
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-1 font-weight-bold">{{ ws.name }}</v-card-title>
            <v-card-subtitle>
              {{ ws._count?.members || ws.members?.length || 0 }} member(s)
            </v-card-subtitle>
          </v-card-item>
          <v-card-text class="pt-0 d-flex align-center justify-space-between">
            <span class="text-caption text-medium-emphasis">
              Updated {{ new Date(ws.updatedAt).toLocaleDateString() }}
            </span>
            <v-icon icon="mdi-arrow-right" size="16" class="text-medium-emphasis" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="workspaces.length === 0" cols="12">
        <div class="empty-state text-center py-16">
          <div class="empty-icon-wrapper d-inline-flex align-center justify-center mb-4">
            <v-icon icon="mdi-folder-plus-outline" size="48" color="primary" />
          </div>
          <h3 class="text-h6 font-weight-bold mb-2">No workspaces yet</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Create your first workspace to start collaborating with your team.
          </p>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="showCreate = true">
            Create Workspace
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Create Workspace Dialog -->
    <v-dialog v-model="showCreate" max-width="440">
      <v-card class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">Create Workspace</v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Give your workspace a name. You can always change it later.
          </p>
          <v-text-field
            v-model="newName"
            label="Workspace name"
            placeholder="e.g. Marketing Team"
            autofocus
            @keyup.enter="createWorkspace"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="secondary" @click="showCreate = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="creating"
            :disabled="!newName.trim()"
            @click="createWorkspace"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.welcome-hero {
  background: linear-gradient(135deg, #1c1917 0%, #0c0a09 50%, #1a0f00 100%);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(249, 115, 22, 0.15);
}
.welcome-hero::before {
  content: '';
  position: absolute;
  top: -60%;
  right: -15%;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
  pointer-events: none;
}
.welcome-hero::after {
  content: '';
  position: absolute;
  bottom: -40%;
  left: 5%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.workspace-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.workspace-card-accent {
  height: 4px;
  width: 100%;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: rgba(249, 115, 22, 0.08);
}

.hero-btn {
  background: linear-gradient(135deg, #f97316, #ea580c) !important;
  color: #fff !important;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35) !important;
}
.hero-btn:hover {
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5) !important;
  transform: translateY(-1px);
}
</style>
