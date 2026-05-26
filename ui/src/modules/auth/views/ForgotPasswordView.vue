<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/modules/auth/store';

const auth = useAuthStore();

const email = ref('');
const loading = ref(false);
const sent = ref(false);

async function handleSubmit() {
  loading.value = true;
  try {
    await auth.forgotPassword(email.value);
    sent.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h2 class="text-h4 font-weight-black mb-1">Reset password</h2>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Enter your email and we'll send you a link to reset your password.
    </p>

    <v-alert v-if="sent" type="success" variant="tonal" class="mb-6" rounded="lg">
      <div class="d-flex align-center">
        <span>If an account with that email exists, a reset link has been sent.</span>
      </div>
    </v-alert>

    <v-form v-if="!sent" @submit.prevent="handleSubmit">
      <div class="mb-5">
        <v-text-field
          v-model="email"
          type="email"
          placeholder="you@example.com"
          prepend-inner-icon="mdi-email-outline"
          :rules="[(v: string) => !!v || 'Email is required']"
          hide-details="auto"
          density="comfortable"
          variant="outlined"
          bg-color="white"
        />
      </div>

      <v-btn
        type="submit"
        block
        size="x-large"
        :loading="loading"
        class="auth-submit-btn mt-8 mb-6"
        rounded="lg"
      >
        Send Reset Link
        <v-icon end icon="mdi-email-fast-outline" size="18" />
      </v-btn>
    </v-form>

    <v-divider class="my-6">
      <span class="text-caption text-medium-emphasis px-4">or</span>
    </v-divider>

    <p class="text-center text-body-2 text-medium-emphasis">
      Remember your password?
      <RouterLink to="/auth/login" class="text-primary font-weight-bold text-decoration-none">
        Sign in
      </RouterLink>
    </p>
  </div>
</template>

<style lang="scss" src="../style.scss" />
