<template>
    <adx-dialog ref="dialog" title="Servizio" :loading="!service">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="service.name"
                label="Name"
                :errors="service.errors.name"
                />

            <cmn-measurement-unit-select
                v-model="service.measurementUnit"
                :errors="service.errors.measurementUnit"
                clearable
                />

            <adx-data-input
                v-model="service.price"
                label="Prezzo"
                :errors="service.errors.price"
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
const ds = $adx.dataSet(buildUrl('/api/mms/editService', { id: props.id }))

const service = ds.ref('MmsService')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(service)
    })
)
</script>
