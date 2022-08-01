<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  spacing: String,
  ySpacing: String,
  justify: String,
  content: String,
  width: String,
  horizontal: Boolean,
  vertical: Boolean,
  fit: Boolean,
})

const classes = computed(() => {
  const classes = [] as string[]
  if (props.horizontal !== false) {
    classes.push('row')
  }
  if (props.vertical !== false) {
    classes.push('col')
  }
  if (props.fit !== false) {
    classes.push('fit')
  }
  if (props.spacing) {
    classes.push(`q-gutter-${props.spacing}`)
  }
  if (props.ySpacing) {
    classes.push(`q-gutter-y-${props.ySpacing}`)
  }
  if (props.justify) {
    classes.push(`justify-${props.justify}`)
  }
  if (props.content) {
    classes.push(`content-${props.content}`)
  }
  return classes.join(' ')
})

const styles = computed(() => {
  const styles = [] as string[]
  if (props.width) {
    styles.push(`width: ${props.width}`)
  }
  return styles.join(';')
})
</script>

<template>
  <div :class="classes" :style="styles">
    <slot/>
  </div>
</template>