<script setup lang="ts">
import { ItemError } from '@adronix/base';
import { ItemProp } from '@adronix/client';
import { computed } from 'vue'

const props = defineProps<{
  modelValue: ItemProp,
  errors: ItemError[]
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

const errorMessage = computed(() => props.errors ? props.errors.map(error => error).join(',') : '')
</script>

<template>
  <q-input
    v-model="value"
    :error-message="errorMessage"
    :error="!!errorMessage"/>
</template>