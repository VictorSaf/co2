<template>
  <button
    :style="buttonStyle"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="onClick"
  >
    {{ text }}
  </button>
</template>

<script setup lang="ts">
/**
 * Button Component Example - Vue
 * 
 * This example demonstrates how to use the CO2 Trading Platform Design System Theme
 * in a Vue component. The Button component uses theme tokens for consistent styling.
 */

import { ref, computed } from 'vue';
import { theme } from '../../tokens/theme';

interface Props {
  text: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
});

const emit = defineEmits<{
  click: [];
}>();

const isHovered = ref(false);

const onClick = () => {
  emit('click');
};

// Get styles based on variant
const getVariantStyles = () => {
  switch (props.variant) {
    case 'primary':
      return {
        backgroundColor: theme.colors.primary[600],
        color: 'white',
        border: 'none',
      };
    case 'secondary':
      return {
        backgroundColor: theme.colors.secondary[600],
        color: 'white',
        border: 'none',
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        color: theme.colors.primary[600],
        border: `${theme.borders.width[1]} ${theme.borders.style.solid} ${theme.colors.primary[600]}`,
      };
    default:
      return {};
  }
};

// Get padding based on size
const getPadding = () => {
  return theme.spacing.component.button[props.size];
};

const buttonStyle = computed(() => {
  const baseStyle = {
    ...getVariantStyles(),
    padding: getPadding(),
    borderRadius: theme.borders.radius.md,
    fontSize: theme.typography.fontSize.base[0],
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: theme.transitions.preset.colors,
    boxShadow: theme.shadows.standard.sm,
  };

  if (isHovered.value) {
    return {
      ...baseStyle,
      backgroundColor: props.variant === 'outline' 
        ? theme.colors.primary[50] 
        : props.variant === 'primary'
        ? theme.colors.primary[700]
        : theme.colors.secondary[700],
      boxShadow: theme.shadows.standard.md,
    };
  }

  return baseStyle;
});
</script>

<!--
Usage example:
<Button 
  text="Click me" 
  variant="primary" 
  size="md" 
  @click="handleClick"
/>
-->

