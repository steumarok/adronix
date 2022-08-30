<template>
    <adx-dialog ref="dialog" title="Modello di elemento di checklist" style="min-width: 70vw" :loading="!checklistItemModel">

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

        <adx-d>
            <adx-data-table
                :data-bindings="dataTable.bind(ds)"
                flat
                bordered
                dense
            >
                <template #top-left>
                    <q-btn @click="onInsertOption" color="primary" unelevated>Inserisci opzione</q-btn>
                </template>
                <template #actions="{ row }">
                    <q-btn icon="delete" flat size="sm" @click="onDeleteOption(row.id)"/>
                </template>

                <template #desc="{ row }">
                    <adx-data-input
                        v-model="row.desc"
                        label=""
                        dense
                        />
                </template>

                <template #assetAttributes="{ row }">
                    <mms-state-attribute-select
                        v-model="row.stateAttributes"
                        :for-asset="true"
                        :for-asset-component="true"
                        dense
                        label=""
                        multiple
                        clearable
                        />
                </template>

            </adx-data-table>
        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref, watch } from 'vue';
import MmsChecklistItemTypeSelect from '../components/MmsChecklistItemTypeSelect.vue'
import MmsStateAttributeSelect from '../components/MmsStateAttributeSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editChecklistItemModel', { id: props.id }))

const checklistItemModel = ds.ref('MmsChecklistItemModel')

const dataTable = $adx.dataTable(
  'MmsChecklistItemOption',
  {
    actions:            { label: 'Azioni', width: "100px" },
    value:              { label: 'Valore', width: "100px", field: (row: Item) => row.value },
    desc:               { label: 'Descrizione', width: "50%"},
    assetAttributes:    { label: 'Attributi assegnati all\'asset', width: "50%"},
  },
  { sortBy: "seq" }
)

watch(() => checklistItemModel.value?.dataType, (newValue, oldValue) => {
    if (oldValue == undefined) {
        return
    }

    ds.filterItems('MmsChecklistItemOption').forEach(item => ds.delete(item))

    if (checklistItemModel.value.dataType == 'bool') {
        ds.insert('MmsChecklistItemOption', {
            model: checklistItemModel.value,
            value: "true",
            desc: "Sì",
            seq: 1
        })
        ds.insert('MmsChecklistItemOption', {
            model: checklistItemModel.value,
            value: "false",
            desc: "No",
            seq: 2
        })
    }
})

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(checklistItemModel)
    })
)
</script>
