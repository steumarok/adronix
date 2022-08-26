<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Pianificazione" to="/planning" />
            <q-breadcrumbs-el>Piani di lavoro</q-breadcrumbs-el>
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
                :data-bindings="dataBindings"
                flat
                bordered
            >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci piano di lavoro</q-btn>
                </template>
                <template #actions="{ row }">
                    <q-btn icon="edit" flat size="sm" @click="onEdit(row.id)"/>
                    <q-btn icon="delete" flat size="sm" @click="onDelete(row.id)"/>
                </template>
                <template #taskModel="{ row }">
                    {{row.taskModel.name}}
                </template>
                <template #assetModel="{ row }">
                    {{row.assetModel?.name}}
                </template>
                <template #assetComponentModel="{ row }">
                    {{row.assetComponentModel?.name}}
                </template>
                <template #service="{ row }">
                    {{row.service.name}}
                </template>
                <template #quantity="{ row }">
                    {{row.quantity}}
                </template>
                <template #measurementUnit="{ row }">
                    {{row.service.measurementUnit?.name}}
                </template>
                <template #assetAttributes="{ row }">
                    {{row.assetAttributes?.map(a => a.name).join(", ")}}
                </template>

            </adx-data-table>
        </adx-d>

    </adx-d>

  </q-page>
</template>

<script setup lang="ts">
import { useAdronix } from '@adronix/vue';
import { Item, DataSetUtils, buildUrl } from '@adronix/client';
import WorkPlanEdit from './WorkPlanEdit.vue'
import { computed } from 'vue';

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsWorkPlan',
  {
    actions:      { label: 'Azioni', width: "100px" },
    taskModel:    { label: 'Modello attività', width: "20%", sortable: true },
    assetModel:   { label: 'Modello asset', width: "20%", sortable: true },
    assetComponentModel:   { label: 'Modello componente', width: "20%", sortable: true },
    assetAttributes: { label: 'Attributi', width: "20%", sortable: true },
    service:         { label: 'Servizio', width: "20%", sortable: true },
    quantity:     { label: 'Quantità', align: 'right', sortable: true },
    measurementUnit: { label: 'U.m.', sortable: true },
  },
  { sortBy: "taskModel.name" })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listWorkPlans', dataTable.params)))

function onInsert() {
    $adx.openDialog(WorkPlanEdit)
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsWorkPlan", key, () => ds.commit())
}

function onEdit(key: string) {
    $adx.openDialog(WorkPlanEdit, { id: key })
}

const dataBindings = dataTable.bind(ds)


</script>
