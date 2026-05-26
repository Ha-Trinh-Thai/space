<script setup lang="ts">
import { useToastStore } from '@/shared/stores/toast';

const toastStore = useToastStore();
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" @click="toastStore.remove(toast.id)">&times;</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  color: #fff;
  font-size: 0.875rem;
  box-shadow: var(--shadow-md);
  min-width: 280px;

  &--success {
    background: var(--color-success);
  }
  &--error {
    background: var(--color-error);
  }
  &--warning {
    background: var(--color-warning);
  }
  &--info {
    background: var(--color-primary);
  }

  &__message {
    flex: 1;
  }

  &__close {
    color: #fff;
    font-size: 1.25rem;
    line-height: 1;
    opacity: 0.8;
    &:hover {
      opacity: 1;
    }
  }
}

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
