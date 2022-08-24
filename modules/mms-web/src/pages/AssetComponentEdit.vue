<template>
    <adx-dialog ref="dialog" title="Componente" :loading="!assetComponent">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="assetComponent.name"
                label="Name"
                :errors="assetComponent.errors.name"
                />

            <adx-data-input
                v-model.number="assetComponent.quantity"
                type="number"
                label="Quantità"
                input-class="text-right"
                :suffix="assetComponent.model?.measurementUnit.name"/>

            <mms-asset-component-model-select
                v-model="assetComponent.model"
                />

            <mms-area-select
                v-model="assetComponent.area"
                :clientLocationId="assetComponent.asset.location.id"
                />

        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';
import MmsAssetComponentModelSelect from '../components/MmsAssetComponentModelSelect.vue'
import MmsAreaSelect from '../components/MmsAreaSelect.vue'

const props = defineProps({
  id: Number,
  assetId: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editAssetComponent', { id: props.id, assetId: props.assetId }))

const assetComponent = ds.ref('MmsAssetComponent', props.id)

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(assetComponent)
    })
)
</script>
