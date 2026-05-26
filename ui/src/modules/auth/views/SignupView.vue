<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';

const router = useRouter();
const auth = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

async function handleSignup() {
  error.value = '';
  loading.value = true;
  try {
    await auth.signup(name.value, email.value, password.value);
    router.push({ name: 'home' });
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Signup failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h2 class="text-h4 font-weight-black mb-1">Create account</h2>
    <p class="text-body-2 text-medium-emphasis mb-8">Get started with your free workspace</p>

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

    <v-form @submit.prevent="handleSignup">
      <div class="mb-5">
        <v-text-field
          v-model="name"
          placeholder="John Doe"
          prepend-inner-icon="mdi-account-outline"
          :rules="[(v: string) => !!v || 'Name is required']"
          hide-details="auto"
          density="comfortable"
          variant="outlined"
          bg-color="white"
        />
      </div>

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
        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Minimum 8 characters"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :rules="[(v: string) => v.length >= 8 || 'Min 8 characters']"
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
        Create Account
        <v-icon end icon="mdi-arrow-right" size="18" />
      </v-btn>
    </v-form>

    <v-divider class="my-6">
      <span class="text-caption text-medium-emphasis px-4">or</span>
    </v-divider>

    <p class="text-center text-body-2 text-medium-emphasis">
      Already have an account?
      <RouterLink to="/auth/login" class="text-primary font-weight-bold text-decoration-none">
        Sign in
      </RouterLink>
    </p>
  </div>
</template>

<style lang="scss" src="../style.scss" />
