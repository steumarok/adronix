<template>
    <adx-select
        v-model="value"
        label="Attributi"
        :lookup-data-set="ds"
        lookup-type="MmsStateAttribute"
        lookup-display-property="name"
    />
</template>


<script setup lang="ts">
import { ItemProp, buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';

const props = defineProps<{
  modelValue: ItemProp,
  forAsset: Boolean,
  forAssetComponent: Boolean,
  forTask: Boolean,
  forWorkOrder: Boolean
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

const ds = $adx.dataSet(buildUrl('/api/mms/lookupStateAttributes', {
    forAsset: props.forAsset,
    forAssetComponent: props.forAssetComponent,
    forTask: props.forTask,
    forWorkOrder: props.forWorkOrder
}))

</script>
