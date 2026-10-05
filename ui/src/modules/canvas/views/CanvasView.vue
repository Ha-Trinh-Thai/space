<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import { useCanvas } from '@/modules/canvas/composables/useCanvas';
import { useCanvasStore } from '@/modules/canvas/store';
import CanvasToolbar from '@/modules/canvas/components/CanvasToolbar.vue';
import CanvasStage from '@/modules/canvas/components/CanvasStage.vue';
import CanvasZoomControls from '@/modules/canvas/components/CanvasZoomControls.vue';

const router = useRouter();
const canvas = useCanvas();
const canvasStore = useCanvasStore();
provide('canvas', canvas);

function goBackToWorkspace() {
  router.push({
    name: 'workspace',
    params: { workspaceId: canvas.workspaceId.value },
    query: { tab: 'canvases' },
  });
}

const titleInput = ref('');
const titleFieldFocused = ref(false);

watch(
  () => canvas.currentCanvas.value?.title,
  (title) => {
    if (!titleFieldFocused.value) {
      titleInput.value = title || '';
    }
  },
  { immediate: true },
);

async function handleTitleBlur() {
  titleFieldFocused.value = false;
  if (canvas.currentCanvas.value && titleInput.value !== canvas.currentCanvas.value.title) {
    await canvasStore.updateCanvas(canvas.currentCanvas.value.id, { title: titleInput.value });
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (titleFieldFocused.value) return;
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
  <div v-if="canvas.currentCanvas.value" class="d-flex flex-column h-screen">
    <!-- Header -->
    <div class="d-flex align-center px-4 py-2 border-b min-h-12">
      <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="goBackToWorkspace" />
      <v-text-field
        v-model="titleInput"
        variant="plain"
        density="compact"
        hide-details
        placeholder="Untitled"
        class="text-h6 font-weight-medium [&_.v-field__input]:p-0! [&_.v-field__input]:min-h-0! [&_.v-field__input]:leading-[inherit]! [&_.v-field__input]:[font:inherit]! [&_.v-field__input]:tracking-[inherit]! [&_.v-field__field]:min-h-0!"
        @focus="titleFieldFocused = true"
        @blur="handleTitleBlur"
        @keyup.enter="($event.target as HTMLInputElement)?.blur()"
      />
    </div>

    <!-- Canvas -->
    <div class="flex-grow-1 position-relative overflow-hidden bg-[#f5f5f5]">
      <CanvasStage />
      <CanvasToolbar />
      <CanvasZoomControls />
    </div>
  </div>

  <div v-else-if="canvas.loading.value" class="d-flex justify-center align-center h-[50vh]">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <div v-else class="d-flex justify-center align-center flex-column h-[50vh]">
    <v-icon icon="mdi-draw" size="64" color="grey" />
    <p class="text-body-1 text-medium-emphasis mt-4">Select a canvas to start drawing</p>
  </div>
</template>
