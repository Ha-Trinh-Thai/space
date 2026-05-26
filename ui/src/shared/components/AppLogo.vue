<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  { size: 'md' },
);

const sizeClasses = {
  sm: 'w-10 h-10 rounded-xl',
  md: 'w-14 h-14 rounded-2xl',
  lg: 'w-[72px] h-[72px] rounded-[20px]',
  xl: 'w-[88px] h-[88px] rounded-3xl',
};

const iconSizes = {
  sm: 20,
  md: 28,
  lg: 36,
  xl: 44,
};
</script>

<template>
  <div
    :class="[
      sizeClasses[size],
      'inline-flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_8px_24px_rgba(249,115,22,0.3)]',
    ]"
  >
    <img
      src="/icons/logo.svg"
      alt="Space"
      :width="iconSizes[size]"
      :height="iconSizes[size]"
      class="invert"
    />
  </div>
</template>
