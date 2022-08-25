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
import { buildUrl, ItemProp } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';

const props = defineProps<{
    modelValue: ItemProp,
    errors: ServerError[]
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    if (props.modelValue == null) {
        return [null]
    }
    else {
        return props.modelValue
    }
  },
  set(value) {
    if (value.length > 0) {
        if (value[0] == null) {
            value = value.slice(1)
        }

        if (value[value.length - 1] == null) {
            value = null
        }
    }
    emit('update:modelValue', value)
  }
})


const $adx = useAdronix()

const errorMessage = computed(() => props.errors ? props.errors.map(error => error.message).join(', ') : '')

const options = [
    {
        label: "(Tutti)",
        value: null
    },
    {
        label: "Lunedì",
        value: "mon"
    },
    {
        label: "Martedì",
        value: "tue"
    },
    {
        label: "Mercoledì",
        value: "wed"
    },
    {
        label: "Giovedì",
        value: "thu"
    },
    {
        label: "Venerdì",
        value: "fri"
    },
    {
        label: "Sabato",
        value: "sat"
    },
    {
        label: "Domenica",
        value: "sun"
    },
]

</script>
