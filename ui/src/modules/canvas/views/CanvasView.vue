<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue';
import { useCanvas } from '@/modules/canvas/composables/useCanvas';
import { useCanvasStore } from '@/modules/canvas/store';
import CanvasToolbar from '@/modules/canvas/components/CanvasToolbar.vue';
import CanvasStage from '@/modules/canvas/components/CanvasStage.vue';
import CanvasZoomControls from '@/modules/canvas/components/CanvasZoomControls.vue';

const canvas = useCanvas();
const canvasStore = useCanvasStore();
provide('canvas', canvas);

const editingTitle = ref(false);
const titleInput = ref('');

function startEditTitle() {
  titleInput.value = canvas.currentCanvas.value?.title || '';
  editingTitle.value = true;
}

async function saveTitle() {
  editingTitle.value = false;
  if (canvas.currentCanvas.value && titleInput.value !== canvas.currentCanvas.value.title) {
    await canvasStore.updateCanvas(canvas.currentCanvas.value.id, { title: titleInput.value });
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (editingTitle.value) return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    canvas.deleteSelected();
  }
  if (e.key === 'Escape') {
    canvas.deselectAll();
    canvas.activeTool.value = 'select';
  }
  if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    canvas.selectAll();
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div v-if="canvas.currentCanvas.value" class="canvas-page d-flex flex-column h-100">
    <!-- Header -->
    <div class="canvas-header d-flex align-center px-4 py-2 border-b">
      <div v-if="!editingTitle" class="cursor-pointer" @click="startEditTitle">
        <span class="text-h6 font-weight-medium">
          {{ canvas.currentCanvas.value.title }}
        </span>
      </div>
      <v-text-field
        v-else
        v-model="titleInput"
        variant="plain"
        density="compact"
        hide-details
        autofocus
        class="text-h6"
        @blur="saveTitle"
        @keyup.enter="saveTitle"
      />
    </div>

    <!-- Toolbar -->
    <CanvasToolbar />

    <!-- Canvas -->
    <div class="canvas-container flex-grow-1 position-relative overflow-hidden">
      <CanvasStage />
      <CanvasZoomControls />
    </div>
  </div>

  <div
    v-else-if="canvas.loading.value"
    class="d-flex justify-center align-center"
    style="height: 50vh"
  >
    <v-progress-circular indeterminate color="primary" />
  </div>

  <div v-else class="d-flex justify-center align-center flex-column" style="height: 50vh">
    <v-icon icon="mdi-draw" size="64" color="grey" />
    <p class="text-body-1 text-medium-emphasis mt-4">Select a canvas to start drawing</p>
  </div>
</template>

<style scoped>
.canvas-page {
  height: 100vh;
}
.canvas-header {
  min-height: 48px;
}
.canvas-container {
  background: #f5f5f5;
}
</style>
