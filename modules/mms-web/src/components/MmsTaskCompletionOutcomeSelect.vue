<template>
    <q-select
        v-model="value"
        :options="options"
        :hide-bottom-space="errorMessage.length == 0"
        :error-message="errorMessage"
        :error="!!errorMessage.length"
        emit-value
        map-options
        />
</template>


<script setup lang="ts">
import { ItemProp } from '@adronix/client';
import { computed } from 'vue';

const props = defineProps<{
  modelValue: ItemProp,
  errors: ServerError[]
}>()
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue as ItemProp
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const errorMessage = computed(() => props.errors ? props.errors.map(error => error.message).join(', ') : '')

const options = [
    {
        label: "Completato",
        value: "completed"
    },
    {
        label: "Non completato",
        value: "not_completed"
    },
    {
        label: "Parzialmente completato",
        value: "partially_completed"
    }
]

</script>
