<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el>Ordini di lavoro</q-breadcrumbs-el>
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
                :data-bindings="dataBindings"
                flat
                bordered
            >
                <template #actions="{ row }">
                    <q-btn icon="edit" flat size="sm" @click="onEdit(row.id)"/>
                    <q-btn icon="delete" flat size="sm" @click="onDelete(row.id)"/>
                </template>

                <template #client="{ row }">
                    {{row.client.name}}
                </template>

                <template #address="{ row }">
                    {{row.location?.address}}
                </template>

                <template #locality="{ row }">
                    {{row.location?.locality?.name}}
                </template>

            </adx-data-table>
        </adx-d>

    </adx-d>

  </q-page>
</template>

<script setup lang="ts">
import { useAdronix } from '@adronix/vue';
import { Item, DataSetUtils, buildUrl } from '@adronix/client';
import MmsWorkOrder from './MmsWorkOrder.vue'
import { computed } from 'vue';

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsWorkOrder',
  {
    actions:            { label: 'Azioni', width: "100px" },
    code:               { label: 'Codice', width: "100%", sortable: true, field: (row: Item) => row.code },
    client:             { label: 'Cliente', width: "20%", sortable: true },
    address:            { label: 'Indirizzo', width: "20%", sortable: true },
    locality:           { label: 'Località', width: "20%", sortable: true },
  },
  { sortBy: "code" })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listWorkOrders', dataTable.params)))

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsWorkOrder", key, () => ds.commit())
}

function onEdit(id: string) {
    $adx.openDialog(WorkOrderEdit, { id })
}

const dataBindings = dataTable.bind(ds)
</script>
