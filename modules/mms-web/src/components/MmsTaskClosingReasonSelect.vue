<template>
    <adx-select
        v-model="value"
        label="Motivo"
        :lookup-data-set="ds"
        lookup-type="MmsTaskClosingReason"
        lookup-display-property="name"
    />
</template>


<script setup lang="ts">
import { ItemProp, buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';

const props = defineProps<{
  modelValue: ItemProp,
  completionOutcome: string
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

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/lookupTaskClosingReasons', {
    completionOutcome: props.completionOutcome
})))

</script>
