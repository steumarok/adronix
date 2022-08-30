<template>
    <adx-dialog ref="dialog" title="Checklist" :loading="!checklist">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="checklist.compilationDate"
                data-type="date"
                label="Data compilazione"
                :errors="checklist.errors.compilationDate"
                />

            <mms-checklist-model-select
                v-model="checklist.model"
                />

            <adx-pivot-table
                :data-set="ds"
                item-type="MmsChecklistItem"
                row-property="assetComponent"
                column-property="itemModel"
                flat
                dense
                >
                <template #column="{ column }">
                    {{column.item?.text}}
                </template>

                <template #row="{ row }">
                    {{row.item?.name}}
                </template>

                <template #pivot="{ pivot }">
                    <q-checkbox
                        v-model="pivot.value"
                        :true-value="true"
                        :false-value="false"
                        />
                </template>
            </adx-pivot-table>

        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';
import MmsChecklistModelSelect from '../components/MmsChecklistModelSelect.vue'

const props = defineProps({
  id: Number,
  assetId: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editChecklist', { id: props.id, assetId: props.assetId }))

const checklist = ds.ref('MmsChecklist', props.id)

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(checklist)
    })
)
</script>
