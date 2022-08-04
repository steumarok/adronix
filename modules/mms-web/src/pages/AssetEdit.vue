<template>
    <adx-dialog ref="dialog" title="Dati asset" style="width: 700px" :loading="!asset">

        <adx-d horizontal fit justify="evenly" content="center">
            <adx-d vertical padding="xs">
                <adx-data-input
                    v-model="asset.serialNumber"
                    label="Matricola"
                    :errors="asset?.errors.serialNumber"
                    />
            </adx-d>
            <adx-d vertical padding="xs">
                <mms-asset-model-select
                    v-model="asset.model"
                    />
            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-client-autocomplete
                    v-model="asset.client"
                    :show-insertion-button="asset?.inserted"
                    @client-inserted="onClientInserted"
                    :errors="asset?.errors.client"
                />
            </adx-d>
            <adx-d vertical padding="xs">
                <mms-client-location-select
                    v-model="asset.location"
                    :client-id="asset.ref('client')?.id"
                    :errors="asset?.errors.location"
                    />
            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">

            </adx-d>
            <adx-d vertical padding="xs">
                <mms-area-select
                    v-model="asset.area"
                    :client-location-id="asset.ref('location')?.id"
                    clearable
                    />
            </adx-d>
        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl, Item } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';
import MmsAssetModelSelect from '../components/MmsAssetModelSelect.vue'
import MmsClientAutocomplete from '../components/MmsClientAutocomplete.vue'
import MmsClientLocationSelect from '../components/MmsClientLocationSelect.vue'
import MmsAreaSelect from '../components/MmsAreaSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editAsset', { id: props.id}))

const asset = ds.ref('MmsAsset')

watch(() => asset.value?.client, (newValue, oldValue) => {
    if (oldValue && newValue != oldValue) {
        asset.value.location = null
    }
})

watch(() => asset.value?.location, (newValue, oldValue) => {
    if (oldValue && newValue != oldValue) {
        asset.value.area = null
    }
})

function onClientInserted(client: Item) {
    asset.value.client = client
}

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)
</script>
