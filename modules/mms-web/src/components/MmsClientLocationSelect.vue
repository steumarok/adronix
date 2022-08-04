<template>
    <adx-select
        v-model="value"
        label="Sede"
        :lookup-data-set="dsClientLocation"
        lookup-type="MmsClientLocation"
        lookup-display-property="displayName"
        />
</template>


<script setup lang="ts">
import { buildUrl, ItemProp, ServerError } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';

const props = defineProps<{
  modelValue: ItemProp,
  clientId: string,
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

const dsClientLocation = $adx.dataSet(computed(() => {
  if (props.clientId) {
    return buildUrl('/api/mms/lookupClientLocations', { clientId: props.clientId })
  }
}))


</script>
