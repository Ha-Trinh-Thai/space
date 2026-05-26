import { computed } from 'vue';
import { useRoute } from 'vue-router';

export function useRouteParam(name: string) {
  const route = useRoute();
  return computed(() => route.params[name] as string | undefined);
}
