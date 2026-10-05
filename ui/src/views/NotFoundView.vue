<script setup lang="ts"></script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-gradient mb-4 text-[8rem] font-black leading-none tracking-[-4px]">
          404
        </div>
        <h2 class="text-h5 font-weight-bold mb-2">Page not found</h2>
        <p class="text-body-1 text-medium-emphasis mb-6 max-w-[400px]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <v-btn color="primary" size="large" prepend-icon="mdi-home" to="/"> Back to Home </v-btn>
      </div>
    </v-main>
  </v-app>
</template>
