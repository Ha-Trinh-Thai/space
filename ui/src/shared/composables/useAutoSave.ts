import { ref, onUnmounted } from 'vue';

export function useAutoSave<T = any>(saveFn: (data: T) => Promise<void>, delay = 1000) {
  const saving = ref(false);
  let timeout: ReturnType<typeof setTimeout>;
  let pendingData: T | undefined;
  let hasPending = false;

  function trigger(data: T) {
    pendingData = data;
    hasPending = true;
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      hasPending = false;
      saving.value = true;
      try {
        await saveFn(data);
      } finally {
        saving.value = false;
      }
    }, delay);
  }

  async function flush() {
    clearTimeout(timeout);
    if (hasPending && pendingData !== undefined) {
      hasPending = false;
      saving.value = true;
      try {
        await saveFn(pendingData);
      } finally {
        saving.value = false;
      }
    }
  }

  onUnmounted(flush);

  return { saving, trigger, flush };
}
