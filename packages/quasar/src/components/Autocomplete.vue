<script setup lang="ts">
import { Item, ItemProp, ServerError } from '@adronix/client';
import { useAdronix, VueDataSet } from '@adronix/vue';
import { computed, reactive, ref } from 'vue'

const $adx = useAdronix()

const props = defineProps<{
  modelValue: ItemProp;
  lookupType: string,
  lookupDataSetUrl: string;
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

const params = reactive({
  search: ''
})

function onFilter(val, update) {
  update(() => {
    params.search = val
  })
}

const urlComposer = $adx.urlComposer(props.lookupDataSetUrl)
const lookupDataSet = $adx.dataSet(urlComposer(params))

const options = lookupDataSet.list(props.lookupType)
const errorMessage = computed(() => props.errors ? props.errors.map(error => error.message).join(', ') : '')

</script>

<template>
  <q-select
    v-model="value"
    :option-label="props.lookupDisplayProperty"
    @filter="onFilter"
    use-input
    hide-dropdown-icon
    :options="options"
    :error-message="errorMessage"
    :error="!!errorMessage.length">
    <template v-for="(_, name) in $slots" :slot="name">
      <slot :name="name"/>
    </template>

  </q-select>
</template>