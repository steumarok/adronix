<template>
    <adx-dialog ref="dialog">

        <adx-data-input
            v-if="client"
            v-model="client.name"
            label="Name"
            outlined
            :errors="client.errors.name"
            />

    </adx-dialog>
</template>


<script setup lang="ts">
import { useAdronix } from '@adronix/vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const url = $adx.urlComposer('/api/mms/editClient')({ id: props.id})
const ds = $adx.dataSet(url)

const client = ds.ref('MmsClient')

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)
</script>
