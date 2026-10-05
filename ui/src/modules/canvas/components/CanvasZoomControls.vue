<script setup lang="ts">
import { inject } from 'vue';

const canvas = inject<any>('canvas');

const zoomPercent = () => Math.round(canvas.camera.value.scale * 100);
</script>

<template>
  <div
    class="position-absolute d-flex align-center ga-1 pa-1 rounded-lg bg-surface elevation-2 bottom-4 right-4 z-10"
  >
    <v-btn icon="mdi-minus" size="x-small" variant="text" @click="canvas.zoomOut()" />
    <span class="text-caption mx-1 min-w-[36px] text-center"> {{ zoomPercent() }}% </span>
    <v-btn icon="mdi-plus" size="x-small" variant="text" @click="canvas.zoomIn()" />
    <v-btn size="x-small" variant="text" @click="canvas.resetZoom()">
      <span class="text-caption">Fit</span>
    </v-btn>
  </div>
</template>
