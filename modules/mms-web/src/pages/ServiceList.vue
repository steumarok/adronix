<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Modelli" to="/models" />
            <q-breadcrumbs-el>Servizi</q-breadcrumbs-el>
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
                :data-bindings="dataBindings"
                flat
                bordered
            >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci servizio</q-btn>
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
import ServiceEdit from './ServiceEdit.vue'
import { computed } from 'vue';

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsService',
  {
    actions:            { label: 'Azioni', width: "100px" },
    name:               { label: 'Nome', width: "100%", sortable: true, field: (row: Item) => row.name },
    measurementUnit:    { label: 'Unità misura', sortable: true, field: (row: Item) => row.ref('measurementUnit')?.name },
  },
  { sortBy: "name" })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listServices', dataTable.params)))

function onInsert() {
    $adx.openDialog(ServiceEdit)
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsService", key, () => ds.commit())
}

function onEdit(id: string) {
    $adx.openDialog(ServiceEdit, { id })
}

const dataBindings = dataTable.bind(ds)
</script>
