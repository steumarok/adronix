<template>
    <adx-autocomplete
        v-model="value"
        label="Cliente"
        lookup-data-set-url="/api/mms/lookupClients"
        lookup-type="MmsClient"
        lookup-display-property="name"
    >
        <template v-slot:after v-if="showInsertionButton">
            <q-btn round flat dense icon="add" @click="onInsertClient" />
        </template>
    </adx-autocomplete>
</template>


<script setup lang="ts">
import { Item, ItemProp } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';
import ClientEdit from '../pages/ClientEdit.vue';

const props = defineProps<{
  modelValue: ItemProp,
  showInsertionButton?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'clientInserted'])

const value = computed({
  get() {
    return props.modelValue as ItemProp
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const showInsertionButton = props.showInsertionButton

function onInsertClient() {
    $adx.openDialog(ClientEdit)
        .onOk((client: Item) => emit('clientInserted', client))
}
const $adx = useAdronix()

</script>
