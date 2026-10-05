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
