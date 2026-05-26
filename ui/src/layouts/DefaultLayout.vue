<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
</script>

<template>
  <v-app>
    <v-layout>
      <AppSidebar />
      <v-main>
        <div class="h-screen">
          <RouterView />
        </div>
      </v-main>
    </v-layout>
  </v-app>
</template>

<style scoped>
.main-toolbar {
  min-height: 48px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgb(var(--v-theme-surface));
}
</style>
