<template>
    <adx-dialog ref="dialog" title="Dati cliente" :loading="!client">

        <adx-data-input
            v-model="client.name"
            label="Name"
            outlined
            :errors="client.errors.name"
            />

    </adx-dialog>
</template>


<script setup lang="ts">
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const url = $adx.urlComposer('/api/mms/editClient')({ id: props.id})
const ds = $adx.dataSet(url)

const client = ds.ref('MmsClient')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(client)
    })
)
</script>
