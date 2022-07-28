<script setup lang="ts">
import { ItemProp } from '@adronix/client';
import { computed } from 'vue'

const props = defineProps<{
  modelValue: ItemProp
}>()
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue as string
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <q-input v-model="value" />
</template>