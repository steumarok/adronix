<script setup lang="ts">
import { Error } from '@adronix/base';
import { ItemProp, ServerError } from '@adronix/client';
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: ItemProp,
  errors: ServerError[]
}>()
const emit = defineEmits(['update:modelValue'])

const value = props.modelValue
  ? computed({
      get() {
        return props.modelValue as string
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })
  : ref()

const errorMessage = computed(() => props.errors ? props.errors.map(error => error.message).join(', ') : '')
</script>

<template>
  <q-input
    v-model="value"
    :hide-bottom-space="true"
    :error-message="errorMessage"
    :error="!!errorMessage.length"/>
</template>