<script setup lang="ts">
import { ServerError } from '@adronix/client';
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: any,
  errors: ServerError[]
}>()
const emit = defineEmits(['update:modelValue'])

const value = props.modelValue === undefined
  ? computed({
      get() {
        return props.modelValue as string
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })
  : ref()

</script>

<template>
  <adx-input
    v-model="value"
    :errors="props.errors"/>
</template>