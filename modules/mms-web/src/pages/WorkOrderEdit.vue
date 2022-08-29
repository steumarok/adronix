<template>
    <adx-dialog ref="dialog" title="Ordine di lavoro" :loading="!workOrder">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="workOrder.code"
                label="Name"
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
const ds = $adx.dataSet(buildUrl('/api/mms/editWorkOrder', { id: props.id }))

const workOrder = ds.ref('MmsWorkOrder')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(workOrder)
    })
)
</script>
