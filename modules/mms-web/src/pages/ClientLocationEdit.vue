<template>
    <adx-dialog ref="dialog" title="Dati sede" :loading="!clientLocation" style="min-width: 80vw">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="clientLocation.address"
                label="Indirizzo"
                :errors="clientLocation.errors.name"
                />

            <adx-autocomplete
                v-model="clientLocation.locality"
                label="Località"
                lookup-data-set-url="/api/cmn/lookupLocalities"
                lookup-type="CmnLocality"
                lookup-display-property="name"
                clearable
                />

        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-asset-model-select
                    v-model="clientLocation.assetModel"
                    />
            </adx-d>
            <adx-d vertical padding="xs">
                <q-checkbox
                    v-if="clientLocation.assetModel?.assetType == 'composite'"
                    v-model="clientLocation.createAsset"
                    label="Crea asset"
                    />
            </adx-d>
        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { ref, watch } from 'vue'
import MmsAssetModelSelect from '../components/MmsAssetModelSelect.vue'

const props = defineProps({
  id: Number,
  clientId: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editClientLocation', { id: props.id, clientId: props.clientId }))

const clientLocation = ds.ref('MmsClientLocation')

/*
const createSelfAsset = ref(false)
const assetModel = ref()

watch([createSelfAsset, assetModel], ([ create, model ]) => {
    const location = clientLocation.value
    if (create && model) {
        ds.insert('MmsAsset', {
            model,
            location,
            client: location.client,
            assetType: 'location'
        })
    }
    else {
        const asset = ds.findItem('MmsAsset', () => true)
        if (asset) {
            ds.delete(asset)
        }
    }
})*/

const { dialog } = $adx.dialog(() => ds.commit())
</script>
