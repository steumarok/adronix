<template>
    <adx-dialog ref="dialog" title="Modello di risorsa" :loading="!part">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="part.name"
                label="Name"
                :errors="part.errors.name"
                />

            <cmn-measurement-unit-select
                v-model="part.measurementUnit"
                :errors="part?.errors.measurementUnit"
                />

            <adx-data-input
                v-model="part.unitPrice"
                label="Prezzo unitario"
                :errors="part.errors.unitPrice"
                />
        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';
import { CmnMeasurementUnitSelect } from '@adronix/cmn-web'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editPart', { id: props.id }))

const part = ds.ref('MmsPart')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(part)
    })
)
</script>
