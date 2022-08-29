<template>
    <adx-dialog ref="dialog" title="Modello di checklist" :loading="!checklistModel">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="checklistModel.name"
                label="Name"
                :errors="checklistModel.errors.name"
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
const ds = $adx.dataSet(buildUrl('/api/mms/editChecklistModel', { id: props.id }))

const checklistModel = ds.ref('MmsChecklistModel')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(checklistModel)
    })
)
</script>
