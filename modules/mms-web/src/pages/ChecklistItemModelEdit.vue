<template>
    <adx-dialog ref="dialog" title="Modello di elemento di checklist" :loading="!checklistItemModel">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="checklistItemModel.text"
                label="Testo"
                :errors="checklistItemModel.errors.text"
                />

        </adx-d>

        <mms-checklist-item-type-select
            label="Tipo di dato"
            v-model="checklistItemModel.dataType"
            :errors="checklistItemModel.errors.dataType"
            />

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';
import MmsChecklistItemTypeSelect from '../components/MmsChecklistItemTypeSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editChecklistItemModel', { id: props.id }))

const checklistItemModel = ds.ref('MmsChecklistItemModel')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(checklistItemModel)
    })
)
</script>
