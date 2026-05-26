<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppSearch from '@/components/layout/AppSearch.vue';
</script>

<template>
  <v-app>
    <v-layout>
      <AppSidebar />
      <v-main>
        <div class="main-toolbar d-flex align-center px-4 py-2">
          <AppSearch />
          <v-spacer />
        </div>
        <RouterView />
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
