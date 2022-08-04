<script setup lang="ts">
import { Item, ItemProp, ServerError } from '@adronix/client';
import { VueDataSet } from '@adronix/vue';
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: ItemProp;
  lookupType: string,
  lookupDataSet: VueDataSet;
  lookupDisplayProperty: string;
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

const options = props.lookupDataSet.list(props.lookupType)
const errorMessage = computed(() => props.errors ? props.errors.map(error => error.message).join(', ') : '')
</script>

<template>
  <q-select
    v-model="value"
    :option-label="props.lookupDisplayProperty"
    :options="options"
    :error-message="errorMessage"
    :error="!!errorMessage.length">
    <template v-for="(_, name) in $slots" v-slot:[name]="slotData"><slot :name="name" v-bind="slotData" /></template>
  </q-select>
</template>