<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/modules/auth/store';
import { useToastStore } from '@/shared/stores/toast';
import { api } from '@/shared/lib/api';

const auth = useAuthStore();
const toast = useToastStore();
const { user } = storeToRefs(auth);

const editName = ref('');
const saving = ref(false);

// Change password
const showPassword = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changingPassword = ref(false);

onMounted(() => {
  if (user.value) {
    editName.value = user.value.name;
  }
});

async function updateProfile() {
  if (!editName.value.trim()) return;
  saving.value = true;
  try {
    await api.patch('/auth/me', { name: editName.value.trim() });
    await auth.fetchUser();
    toast.success('Profile updated');
  } catch {
    toast.error('Failed to update profile');
  } finally {
    saving.value = false;
  }
}

async function changePassword() {
  if (!currentPassword.value || !newPassword.value) return;
  if (newPassword.value !== confirmPassword.value) {
    toast.error('Passwords do not match');
    return;
  }
  if (newPassword.value.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }
  changingPassword.value = true;
  try {
    await api.patch('/auth/me/password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    toast.success('Password changed successfully');
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    showPassword.value = false;
  } catch {
    toast.error('Failed to change password. Check your current password.');
  } finally {
    changingPassword.value = false;
  }
}
</script>

<template>
  <div class="profile-view pa-6 pa-md-10">
    <div class="mb-8">
      <h1 class="text-h4 font-weight-bold mb-2">Profile Settings</h1>
      <p class="text-body-1 text-medium-emphasis">
        Manage your account information and security settings.
      </p>
    </div>

    <!-- Profile Info -->
    <v-card class="mb-6" max-width="600">
      <v-card-item>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-account-outline" size="20" class="mr-2" />
          Account Information
        </v-card-title>
      </v-card-item>
      <v-divider />
      <v-card-text class="pt-6">
        <div class="d-flex align-center mb-6">
          <v-avatar size="64" color="primary" class="mr-4">
            <span class="text-h5 font-weight-bold text-white">
              {{ user?.name.charAt(0).toUpperCase() }}
            </span>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-medium">{{ user?.name }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ user?.email }}</div>
          </div>
        </div>

        <v-text-field v-model="editName" label="Display Name" variant="outlined" class="mb-4" />

        <v-text-field
          :model-value="user?.email"
          label="Email"
          variant="outlined"
          disabled
          hint="Contact support to change your email"
          persistent-hint
        />
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn
          color="primary"
          :loading="saving"
          :disabled="editName.trim() === user?.name"
          @click="updateProfile"
        >
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Change Password -->
    <v-card max-width="600">
      <v-card-item>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-lock-outline" size="20" class="mr-2" />
          Change Password
        </v-card-title>
      </v-card-item>
      <v-divider />
      <v-card-text class="pt-6">
        <v-text-field
          v-model="currentPassword"
          label="Current Password"
          variant="outlined"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          class="mb-4"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-text-field
          v-model="newPassword"
          label="New Password"
          variant="outlined"
          :type="showPassword ? 'text' : 'password'"
          class="mb-4"
        />
        <v-text-field
          v-model="confirmPassword"
          label="Confirm New Password"
          variant="outlined"
          :type="showPassword ? 'text' : 'password'"
          :error-messages="
            confirmPassword && newPassword !== confirmPassword ? ['Passwords do not match'] : []
          "
        />
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn
          color="primary"
          :loading="changingPassword"
          :disabled="!currentPassword || !newPassword || newPassword !== confirmPassword"
          @click="changePassword"
        >
          Change Password
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
