<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Modelli" to="/models" />
            <q-breadcrumbs-el>Motivi chiusura attività</q-breadcrumbs-el>
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
                :data-bindings="dataBindings"
                flat
                bordered
            >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci motivo</q-btn>
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
import TaskClosingReasonEdit from './TaskClosingReasonEdit.vue'
import { computed } from 'vue';

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsTaskClosingReason',
  {
    actions:            { label: 'Azioni', width: "100px" },
    name:               { label: 'Nome', width: "100%", sortable: true, field: (row: Item) => row.name },
    completionOutcome:  { label: 'Esito attività', width: "100%", sortable: true, field: (row: Item) => row.completionOutcome },
    assignedAttributes: { label: 'Attributi assegnati', width: "100%", sortable: true, field: (row: Item) => row.assignedAttributes.map(a => a.name).join(', ') },
  },
  { sortBy: "name" })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listTaskClosingReasons', dataTable.params)))

function onInsert() {
    $adx.openDialog(TaskClosingReasonEdit)
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsTaskClosingReason", key, () => ds.commit())
}

function onEdit(id: string) {
    $adx.openDialog(TaskClosingReasonEdit, { id })
}

const dataBindings = dataTable.bind(ds)
</script>
