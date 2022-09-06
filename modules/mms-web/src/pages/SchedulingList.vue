<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Pianificazione" to="/planning" />
            <q-breadcrumbs-el>Schedulazioni</q-breadcrumbs-el>
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
                :data-bindings="dataTable.bind(ds)"
                flat
                bordered
            >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci schedulazione</q-btn>
                </template>
                <template #actions="{ row }">
                    <q-btn icon="edit" flat size="sm" @click="onEdit(row.id)"/>
                    <q-btn icon="delete" flat size="sm" @click="onDelete(row.id)"/>
                </template>
                <template #taskModel="{ row }">
                    {{row.taskModel.name}}
                </template>
                <template #recurrence="{ row }">
                    Ogni {{row.every}} {{row.unit}}
                </template>
                <template #assetModels="{ row }">
                    {{row.assetModels?.map(a => a.name).join(", ")}}
                </template>
                 <template #assetAttributes="{ row }">
                    {{row.assetAttributes?.map(a => a.name).join(", ")}}
                </template>
                <template #startFromLasts="{ row }">
                    {{row.startFromLasts?.map(a => a.name).join(", ")}}
                </template>

            </adx-data-table>
        </adx-d>

    </adx-d>

  </q-page>
</template>

<script setup lang="ts">
import { useAdronix } from '@adronix/vue';
import { Item, DataSetUtils, buildUrl } from '@adronix/client';
import SchedulingEdit from './SchedulingEdit.vue'
import { computed } from 'vue';

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsScheduling',
  {
    actions:            { label: 'Azioni', width: "100px" },
    type:               { label: 'Tipologia', width: "20%", sortable: true, field: row => row.schedulingType },
    taskModel:          { label: 'Modello attività', width: "20%", sortable: true },
    assetModels:        { label: 'Modelli asset', width: "20%", sortable: true },
    assetAttributes:    { label: 'Attributi', width: "20%", sortable: true },
    recurrence:         { label: 'Ricorrenza', width: "20%", sortable: true },
    startFromLasts:     { label: 'Dopo', width: "20%", sortable: true },
  },
  { sortBy: "taskModel.name" })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listSchedulings', dataTable.params)))

function onInsert() {
    $adx.openDialog(SchedulingEdit)
}

function onDelete(id: string) {
    DataSetUtils.deleteItem(ds, "MmsScheduling", id, () => ds.commit())
}

function onEdit(id: string) {
    $adx.openDialog(SchedulingEdit, { id })
}
</script>
