<template>
    <adx-select
        v-model="value"
        label="Area"
        :lookup-data-set="dsAreas"
        lookup-type="MmsArea"
        lookup-display-property="name"
        />
</template>


<script setup lang="ts">
import { buildUrl, ItemProp } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';

const props = defineProps<{
  modelValue: ItemProp,
  clientLocationId: string
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

const $adx = useAdronix()

const dsAreas = $adx.dataSet(computed(() => {
  if (props.clientLocationId) {
    return buildUrl('/api/mms/lookupAreas', { clientLocationId: props.clientLocationId })
  }
}))
</script>
