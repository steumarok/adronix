<script setup lang="ts">
import { ItemId, ItemFilter, Item, ItemProp, ServerError } from '@adronix/client';
import { VueDataSet } from '@adronix/vue';
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: ItemProp;
  lookupType: string,
  lookupDataSet: VueDataSet;
  lookupFilter: ItemId | ItemFilter;
  lookupDisplayProperty: string;
  excluded: Item[],
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

const options = computed(() => {
  const items = props.lookupDataSet.list(props.lookupType, props.lookupFilter || (() => true))
  return items.filter(item => (props.excluded || []).map(excl => excl.id).indexOf(item.id) == -1)
})
const errorMessage = computed(() => props.errors ? props.errors.map(error => error.message).join(', ') : '')
</script>

<template>
  <q-select
    v-model="value"
    option-value="id"
    :option-label="props.lookupDisplayProperty"
    :options="options"
    map-options
    :hide-bottom-space="errorMessage.length == 0"
    :error-message="errorMessage"
    :error="!!errorMessage.length">
    <slot v-for="(_, name) in $slots" :name="name" :slot="name" />
  </q-select>
</template>