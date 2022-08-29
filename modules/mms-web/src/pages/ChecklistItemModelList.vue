<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Modelli" to="/models" />
            <q-breadcrumbs-el>Modelli di elementi di checklist</q-breadcrumbs-el>
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
                :data-bindings="dataBindings"
                flat
                bordered
            >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci modello di elemento</q-btn>
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
import ChecklistItemModelEdit from './ChecklistItemModelEdit.vue'
import { computed } from 'vue';

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsChecklistItemModel',
  {
    actions:            { label: 'Azioni', width: "100px" },
    name:               { label: 'Nome', width: "100%", sortable: true, field: (row: Item) => row.text },
  },
  { sortBy: "text" })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listChecklistItemModels', dataTable.params)))

function onInsert() {
    $adx.openDialog(ChecklistItemModelEdit)
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsChecklistItemModel", key, () => ds.commit())
}

function onEdit(id: string) {
    $adx.openDialog(ChecklistItemModelEdit, { id })
}

const dataBindings = dataTable.bind(ds)
</script>
