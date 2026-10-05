<script setup lang="ts">
import AppLogo from '@/shared/components/AppLogo.vue';
</script>

<template>
  <v-app>
    <v-main class="min-h-screen bg-stone-50">
      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">
          <!-- Left: Branding panel -->
          <v-col
            cols="12"
            md="5"
            lg="5"
            class="d-none d-md-flex flex-column relative overflow-hidden bg-[linear-gradient(160deg,#1c1917_0%,#0c0a09_40%,#1a0f00_100%)] before:content-[''] before:absolute before:top-[-30%] before:right-[-30%] before:w-125 before:h-125 before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand)_15%,transparent)_0%,transparent_70%)] before:pointer-events-none after:content-[''] after:absolute after:bottom-[-20%] after:left-[-20%] after:w-100 after:h-100 after:rounded-full after:bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-light)_10%,transparent)_0%,transparent_70%)] after:pointer-events-none"
          >
            <div class="d-flex flex-column justify-center align-center grow pa-12">
              <AppLogo size="xl" class="mb-6" />
              <h1 class="text-h3 font-weight-black text-white mb-3">Space</h1>
              <p class="text-body-1 text-center max-w-[320px] leading-[1.7] text-white/70">
                Your visual collaboration workspace for organizing ideas, building mind maps, and
                creating together.
              </p>
              <div class="mt-10 py-5 px-6 rounded-2xl bg-white/5 border border-white/8">
                <div
                  v-for="feature in ['Connected Notes', 'Visual Thinking', 'Limitless Workspace']"
                  :key="feature"
                  class="d-flex align-center mb-3"
                >
                  <v-icon icon="mdi-check-circle" size="18" color="primary" class="mr-3" />
                  <span class="text-body-2 text-white/80">{{ feature }}</span>
                </div>
              </div>
            </div>
            <div class="pa-6 text-center">
              <span class="text-caption text-white/40">&copy; 2026 Space</span>
            </div>
          </v-col>

          <!-- Right: Form panel -->
          <v-col
            cols="12"
            md="7"
            lg="7"
            class="d-flex align-center justify-center bg-stone-50 p-12 max-md:p-8 max-md:min-h-screen"
          >
            <div
              class="w-full max-w-105 p-8 max-md:p-5 bg-white rounded-[20px] border border-black/6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
            >
              <!-- Mobile logo -->
              <div class="d-md-none text-center mb-8">
                <AppLogo size="md" class="mb-3" />
                <h2 class="text-h5 font-weight-bold">Space</h2>
              </div>
              <RouterView />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
