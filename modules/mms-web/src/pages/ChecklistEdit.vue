<template>
    <adx-dialog ref="dialog" title="Checklist" :loading="!checklist" style="min-width: 70vw">

        <adx-d vertical y-spacing="sm">

            <adx-d horizontal fit justify="evenly" content="center">
                <adx-d vertical padding="xs">
                    <adx-data-input
                        v-model="checklist.compilationDate"
                        data-type="date"
                        label="Data compilazione"
                        :errors="checklist.errors.compilationDate"
                        />
                </adx-d>
                <adx-d vertical padding="xs">
                    <mms-checklist-model-select
                        v-model="checklist.model"
                        />
                </adx-d>
            </adx-d>

            <adx-data-table
                v-if="checklist.model"
                :data-bindings="dataTable.bind(ds, (item) => !item.assetComponent)"
                flat
                bordered
                dense
            >
                <template #desc="{ row }">
                    {{row.itemModel.text}}
                </template>

                <template #value="{ row }">
                    <adx-select
                        v-model="row.option"
                        :lookup-data-set="ds"
                        :lookup-filter="(option) => option.model.id == row.itemModel.id"
                        lookup-type="MmsChecklistItemOption"
                        lookup-display-property="desc"
                        dense
                        />
                </template>

            </adx-data-table>

            <adx-pivot-table
                :data-set="ds"
                item-type="MmsChecklistItem"
                :item-filter="(item) => item.assetComponent"
                row-property="assetComponent"
                column-property="itemModel"
                flat
                bordered
                dense
                >
                <template #column="{ column }">
                    {{column.item?.text}}
                </template>

                <template #row="{ row }">
                    {{row.item?.name}}
                </template>

                <template #pivot="{ pivot }">
                    <adx-select
                        v-if="pivot.id"
                        v-model="pivot.option"
                        :lookup-data-set="ds"
                        :lookup-filter="(option) => option.model.id == pivot.itemModel.id"
                        lookup-type="MmsChecklistItemOption"
                        lookup-display-property="desc"
                        dense
                        />
                </template>
            </adx-pivot-table>

        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref, ref, computed, watch } from 'vue';
import MmsChecklistModelSelect from '../components/MmsChecklistModelSelect.vue'

const props = defineProps({
  id: Number,
  assetId: Number
})

const checklistModelId = ref()

const $adx = useAdronix()
const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/editChecklist', {
    id: props.id,
    assetId: props.assetId,
    checklistModelId: unref(checklistModelId)
})))

const checklist = ds.ref('MmsChecklist', props.id)

watch(() => checklist.value?.model, (newValue, oldValue) =>  {
    if (oldValue === undefined) {
        return
    }
    if (newValue) {
        checklistModelId.value = newValue.id
    }
})

const dataTable = $adx.dataTable(
  'MmsChecklistItem',
  {
    desc:               { label: 'Elemento', width: "70%" },
    value:              { label: 'Valore', width: "30%"},
  }
)


const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(checklist)
    })
)
</script>
