<template>
    <adx-select
        v-model="value"
        label="Attributi di stato"
        :lookup-data-set="ds"
        lookup-type="MmsStateAttribute"
        lookup-display-property="name"
        :lookup-filter="getFilter(value)"
    />
</template>


<script setup lang="ts">
import { ItemProp, buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';

const props = defineProps<{
  modelValue: ItemProp,
  useFilter: Boolean,
  forAsset: Boolean,
  forAssetComponent: Boolean,
  forTask: Boolean,
  forWorkOrder: Boolean
}>()
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    const value = []
    if (props.modelValue) {
        for (const attribute of props.modelValue) {
            const a = ds.findItem('MmsStateAttribute', item => item.id == attribute.id)
            if (!a) {
                value.push(attribute)
            }
            else {
                if (a.containers.length == 0 ||
                    a.containers.some(a => props.modelValue.map(a => a.id).includes(a.id))) {
                    value.push(a)
                }
            }
        }
    }
    return value //props.modelValue as ItemProp
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const $adx = useAdronix()

function getFilter(attributes) {
    return (attribute) => {
        if (!props.useFilter) {
            return true
        }

        attributes = attributes.map(a => ds.findItem('MmsStateAttribute', item => item.id == a.id))
        const incompatibleAttributes = attributes
            .flatMap(a => a.incompatibleAttributes)
        const containers = attributes
            .flatMap(a => a.containers)

        if (attributes.length == 0) {
            return attribute.containers.length == 0
        }
        else {
            return !attribute.incompatibleAttributes.some(a => attributes.map(a => a.id).includes(a.id)) &&
                (attributes.map(a => a.id).includes(attribute.id) ||
                 attribute.containers.some(a => attributes.map(a => a.id).includes(a.id)))
        }
    }
}

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/lookupStateAttributes', {
    forAsset: props.forAsset,
    forAssetComponent: props.forAssetComponent,
    forTask: props.forTask,
    forWorkOrder: props.forWorkOrder
})))

</script>
