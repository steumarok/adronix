<template>
    <adx-dialog ref="dialog" title="Modello di risorsa" :loading="!assetAttribute">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="assetAttribute.name"
                label="Name"
                :errors="assetAttribute.errors.name"
                />

        </adx-d>

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
const ds = $adx.dataSet(buildUrl('/api/mms/editAssetAttribute', { id: props.id }))

const assetAttribute = ds.ref('MmsAssetAttribute')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(assetAttribute)
    })
)
</script>
