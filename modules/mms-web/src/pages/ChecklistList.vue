<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <nav-assets>
            <q-breadcrumbs-el>Checklists di {{asset?.name}}</q-breadcrumbs-el>
        </nav-assets>

        <adx-d>
            <adx-data-table
                :data-bindings="dataTable.bind(ds)"
                flat
                bordered
            >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci checklist</q-btn>
                </template>
                <template #actions="{ row }">
                    <q-btn icon="edit" flat size="sm" @click="onEdit(row.id)"/>
                    <q-btn icon="delete" flat size="sm" @click="onDelete(row.id)"/>
                </template>

            </adx-data-table>
        </adx-d>

    </adx-d>

  </q-page>
</template>

<script setup lang="ts">
import { useAdronix } from '@adronix/vue';
import { Item, DataSetUtils, buildUrl } from '@adronix/client';
import ChecklistEdit from './ChecklistEdit.vue'
import { computed } from 'vue';
import NavAssets from './NavAssets.vue'

const props = defineProps({
  assetId: Number
})

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsChecklist',
  {
    actions:      { label: 'Azioni', width: "100px" },
    name:         { label: 'Data compilazione', width: "100%", sortable: true, field: (row: Item) => row.compilationDate },
  },
  { sortBy: "compileDate" })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listChecklists', {
    assetId: props.assetId,
    ...dataTable.params})))

const asset = ds.ref("MmsAsset")

function onInsert() {
    $adx.openDialog(ChecklistEdit, { assetId: props.assetId })
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsChecklist", key, () => ds.commit())
}

function onEdit(key: string) {
    $adx.openDialog(ChecklistEdit, { id: key })
}

</script>
