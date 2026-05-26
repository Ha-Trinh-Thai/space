<script setup lang="ts"></script>

<template>
  <v-app>
    <v-main class="auth-layout">
      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">
          <!-- Left: Branding panel -->
          <v-col cols="12" md="5" lg="5" class="auth-brand-panel d-none d-md-flex flex-column">
            <div
              class="auth-brand-content d-flex flex-column justify-center align-center flex-grow-1 pa-12"
            >
              <div class="auth-brand-icon d-flex align-center justify-center mb-6">
                <v-icon icon="mdi-brain" size="48" color="white" />
              </div>
              <h1 class="text-h3 font-weight-black text-white mb-3">Space</h1>
              <p
                class="text-body-1 text-center"
                style="color: rgba(255, 255, 255, 0.7); max-width: 320px; line-height: 1.7"
              >
                Your visual collaboration workspace. Organize ideas, build mindmaps, and create
                together.
              </p>
              <div class="auth-brand-features mt-10">
                <div
                  v-for="feature in [
                    'Real-time collaboration',
                    'Visual mind mapping',
                    'Infinite canvas',
                  ]"
                  :key="feature"
                  class="d-flex align-center mb-3"
                >
                  <v-icon icon="mdi-check-circle" size="18" color="#fb923c" class="mr-3" />
                  <span class="text-body-2" style="color: rgba(255, 255, 255, 0.8)">{{
                    feature
                  }}</span>
                </div>
              </div>
            </div>
            <div class="auth-brand-footer pa-6 text-center">
              <span class="text-caption" style="color: rgba(255, 255, 255, 0.4)"
                >&copy; 2026 Space</span
              >
            </div>
          </v-col>

          <!-- Right: Form panel -->
          <v-col cols="12" md="7" lg="7" class="d-flex align-center justify-center auth-form-panel">
            <div class="auth-form-wrapper">
              <!-- Mobile logo -->
              <div class="d-md-none text-center mb-8">
                <div class="auth-mobile-logo d-inline-flex align-center justify-center mb-3">
                  <v-icon icon="mdi-brain" size="32" color="white" />
                </div>
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

<style scoped>
.auth-layout {
  min-height: 100vh;
  background: #fafaf9;
}

.auth-brand-panel {
  background: linear-gradient(160deg, #1c1917 0%, #0c0a09 40%, #1a0f00 100%);
  position: relative;
  overflow: hidden;
}

.auth-brand-panel::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -30%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.auth-brand-panel::after {
  content: '';
  position: absolute;
  bottom: -20%;
  left: -20%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.auth-brand-icon {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  box-shadow: 0 12px 32px rgba(249, 115, 22, 0.35);
}

.auth-brand-features {
  padding: 20px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.auth-form-panel {
  background: #fafaf9;
  padding: 48px 32px;
}

.auth-form-wrapper {
  width: 100%;
  max-width: 420px;
  padding: 32px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.auth-mobile-logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
}

@media (max-width: 959px) {
  .auth-form-panel {
    min-height: 100vh;
    padding: 32px 20px;
  }
  .auth-form-wrapper {
    padding: 24px 20px;
  }
}
</style>
