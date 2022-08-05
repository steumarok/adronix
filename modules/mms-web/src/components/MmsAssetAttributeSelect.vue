<template>
    <adx-select
        v-model="value"
        label="Attributi"
        :lookup-data-set="dsAssetAttribute"
        lookup-type="MmsAssetAttribute"
        lookup-display-property="name"
    />
</template>


<script setup lang="ts">
import { ItemProp } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';

const props = defineProps<{
  modelValue: ItemProp
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

const dsAssetAttribute = $adx.dataSet('/api/mms/lookupAssetAttributes')

</script>
