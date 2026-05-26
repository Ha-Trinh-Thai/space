<script setup lang="ts"></script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
      <div class="text-center">
        <div class="not-found-code text-gradient mb-4">404</div>
        <h2 class="text-h5 font-weight-bold mb-2">Page not found</h2>
        <p class="text-body-1 text-medium-emphasis mb-6" style="max-width: 400px">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <v-btn color="primary" size="large" prepend-icon="mdi-home" to="/"> Back to Home </v-btn>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.not-found-code {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -4px;
}
</style>
