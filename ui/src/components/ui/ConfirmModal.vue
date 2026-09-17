<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message?: string;
    warning?: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    loading?: boolean;
  }>(),
  {
    message: undefined,
    warning: undefined,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'primary',
    loading: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="440"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-2">
      <v-card-title class="font-weight-bold">{{ title }}</v-card-title>
      <v-card-text>
        <v-alert v-if="warning" type="warning" variant="tonal" class="mb-4">
          {{ warning }}
        </v-alert>
        <slot>{{ message }}</slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="handleCancel">{{ cancelText }}</v-btn>
        <v-btn :color="confirmColor" variant="tonal" :loading="loading" @click="emit('confirm')">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
