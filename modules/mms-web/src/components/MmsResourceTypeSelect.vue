<template>
    <adx-select
        v-model="value"
        label="Tipo di risorsa"
        :lookup-data-set="dsResourceType"
        lookup-type="MmsResourceType"
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

const dsResourceType = $adx.dataSet('/api/mms/lookupResourceTypes')

</script>
