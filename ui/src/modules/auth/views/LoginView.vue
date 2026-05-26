<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push({ name: 'home' });
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="text-h1 font-weight-black mb-1">Welcome back</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">Sign in to your account to continue</p>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-6"
      rounded="lg"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-form @submit.prevent="handleLogin">
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

      <div class="mb-5">
        <div class="d-flex align-center justify-space-between mb-2">
          <RouterLink
            to="/auth/forgot-password"
            class="text-caption text-primary text-decoration-none"
          >
            Forgot password?
          </RouterLink>
        </div>
        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter your password"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :rules="[(v: string) => !!v || 'Password is required']"
          hide-details="auto"
          density="comfortable"
          variant="outlined"
          bg-color="white"
          @click:append-inner="showPassword = !showPassword"
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
        Sign In
        <v-icon end icon="mdi-arrow-right" size="18" />
      </v-btn>
    </v-form>

    <v-divider class="my-6">
      <span class="text-caption text-medium-emphasis px-4">or</span>
    </v-divider>

    <p class="text-center text-body-2 text-medium-emphasis">
      Don't have an account?
      <RouterLink to="/auth/signup" class="text-primary font-weight-bold text-decoration-none">
        Create account
      </RouterLink>
    </p>
  </div>
</template>
