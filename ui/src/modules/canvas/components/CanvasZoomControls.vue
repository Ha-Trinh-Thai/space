<script setup lang="ts">
import { inject } from 'vue';

const canvas = inject<any>('canvas');

const zoomPercent = () => Math.round(canvas.camera.value.scale * 100);
</script>

<template>
  <div
    class="canvas-zoom-controls position-absolute d-flex align-center ga-1 pa-1 rounded-lg bg-surface elevation-2"
  >
    <v-btn icon="mdi-minus" size="x-small" variant="text" @click="canvas.zoomOut()" />
    <span class="text-caption mx-1" style="min-width: 36px; text-align: center">
      {{ zoomPercent() }}%
    </span>
    <v-btn icon="mdi-plus" size="x-small" variant="text" @click="canvas.zoomIn()" />
    <v-btn size="x-small" variant="text" @click="canvas.resetZoom()">
      <span class="text-caption">Fit</span>
    </v-btn>
  </div>
</template>

<style scoped>
.canvas-zoom-controls {
  bottom: 16px;
  right: 16px;
  z-index: 10;
}
</style>
