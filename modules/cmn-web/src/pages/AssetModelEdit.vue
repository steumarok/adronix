<template>
    <adx-dialog ref="dialog" title="Modello di asset" :loading="!assetModel">

        <adx-data-input
            v-model="assetModel.name"
            label="Name"
            outlined
            :errors="assetModel.errors.name"
            />

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editAssetModel', { id: props.id }))

const assetModel = ds.ref('MmsAssetModel')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(assetModel)
    })
)
</script>
