<script setup lang="ts">
import { useToastStore } from '@/shared/stores/toast';

const toastStore = useToastStore();

function toastBgClass(type: string) {
  switch (type) {
    case 'success':
      return 'bg-[var(--color-success)]';
    case 'error':
      return 'bg-[var(--color-error)]';
    case 'warning':
      return 'bg-[var(--color-warning)]';
    default:
      return 'bg-[var(--color-primary)]';
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-[var(--spacing-md)] right-[var(--spacing-md)] z-[9999] flex flex-col gap-[var(--spacing-sm)]"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="d-flex align-center gap-[var(--spacing-sm)] py-[var(--spacing-sm)] px-[var(--spacing-md)] rounded-[var(--radius-md)] text-white text-sm shadow-[var(--shadow-md)] min-w-[280px]"
          :class="toastBgClass(toast.type)"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button
            class="text-white text-xl leading-none opacity-80 hover:opacity-100"
            @click="toastStore.remove(toast.id)"
          >
            &times;
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
