import { ref, watch, type Ref } from 'vue';

export function useDebouncedRef<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>;
  let timeout: ReturnType<typeof setTimeout>;

  watch(source, (val) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debounced.value = val;
    }, delay);
  });

  return debounced;
}

export function useDebounceFn<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timeout: ReturnType<typeof setTimeout>;

  function debounced(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }

  function cancel() {
    clearTimeout(timeout);
  }

  return { debounced, cancel };
}
