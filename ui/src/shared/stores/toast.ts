import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function add(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID();
    toasts.value.push({ ...toast, id });

    const duration = toast.duration ?? 4000;
    setTimeout(() => remove(id), duration);
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function success(message: string) {
    add({ message, type: 'success' });
  }

  function error(message: string) {
    add({ message, type: 'error' });
  }

  function warning(message: string) {
    add({ message, type: 'warning' });
  }

  function info(message: string) {
    add({ message, type: 'info' });
  }

  return { toasts, add, remove, success, error, warning, info };
});
