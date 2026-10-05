<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from '@/modules/workspace/store';
import { useAuthStore } from '@/modules/auth/store';
import { CARD_GRADIENTS, CARD_COLORS } from '@/constants';

const router = useRouter();
const workspaceStore = useWorkspaceStore();
const { workspaces, loading } = storeToRefs(workspaceStore);
const { fetchWorkspaces, createWorkspace } = workspaceStore;
const auth = useAuthStore();

const showCreate = ref(false);
const newName = ref('');
const creating = ref(false);

onMounted(async () => {
  await fetchWorkspaces();
});

async function handleCreateWorkspace() {
  if (!newName.value.trim()) return;
  creating.value = true;
  try {
    const ws = await createWorkspace(newName.value.trim());
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
  <div class="pa-6 pa-md-10">
    <!-- Welcome Hero -->
    <div
      class="mb-10 pa-md-5 rounded-xl relative overflow-hidden bg-[linear-gradient(135deg,#1c1917_0%,#0c0a09_50%,#1a0f00_100%)] border border-[color-mix(in_srgb,var(--color-brand)_15%,transparent)] before:content-[''] before:absolute before:-top-[60%] before:-right-[15%] before:w-[450px] before:h-[450px] before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand)_15%,transparent)_0%,transparent_70%)] before:pointer-events-none after:content-[''] after:absolute after:-bottom-[40%] after:left-[5%] after:w-[300px] after:h-[300px] after:rounded-full after:bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-light)_8%,transparent)_0%,transparent_70%)] after:pointer-events-none"
    >
      <v-row class="align-center">
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
          <p class="text-body-1 text-white opacity-80">
            Pick up where you left off or create a new workspace to start collaborating.
          </p>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-md-end">
          <v-btn
            size="large"
            prepend-icon="mdi-plus"
            class="bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-hover))]! text-white! font-bold shadow-[0_4px_14px_color-mix(in_srgb,var(--color-brand)_35%,transparent)]! hover:shadow-[0_6px_20px_color-mix(in_srgb,var(--color-brand)_50%,transparent)]! hover:-translate-y-px"
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

    <v-row v-else class="h-[calc(100vh-350px)] overflow-auto">
      <v-col
        v-for="(workspace, i) in workspaces"
        :key="workspace.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="h-50" hover @click="openWorkspace(workspace.id)">
          <div
            class="h-1 w-full"
            :style="{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }"
          />
          <v-card-item class="pt-8">
            <template #prepend>
              <v-avatar :color="CARD_COLORS[i % CARD_COLORS.length]" size="40" class="mr-3">
                <v-icon icon="mdi-folder-outline" color="white" size="20" />
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-1 font-weight-bold">{{
              workspace.name
            }}</v-card-title>
            <v-card-subtitle>
              {{ workspace._count?.members || workspace.members?.length || 0 }} member(s)
            </v-card-subtitle>
          </v-card-item>
          <v-card-text class="pt-0 d-flex align-center justify-space-between">
            <span class="text-caption text-medium-emphasis">
              Updated {{ new Date(workspace.updatedAt).toLocaleDateString() }}
            </span>
            <v-icon icon="mdi-arrow-right" size="16" class="text-medium-emphasis" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="workspaces.length === 0" cols="12">
        <div class="text-center py-16">
          <div
            class="d-inline-flex align-center justify-center mb-4 w-20 h-20 rounded-3xl bg-[color-mix(in_srgb,var(--color-brand)_8%,transparent)]"
          >
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
            @keyup.enter="handleCreateWorkspace"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="secondary" @click="showCreate = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="creating"
            :disabled="!newName.trim()"
            @click="handleCreateWorkspace"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
