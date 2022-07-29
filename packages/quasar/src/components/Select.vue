<script setup lang="ts">
import { Item, ItemProp } from '@adronix/client';
import { VueDataSet } from '@adronix/vue';
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: ItemProp;
  lookupType: string,
  lookupDataSet: VueDataSet;
  lookupDisplayProperty: string;
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
</script>

<template>
  <q-select
    v-model="value"
    :option-label="props.lookupDisplayProperty"
    :options="options" />
</template>