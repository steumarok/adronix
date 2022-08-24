<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Clienti" />
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
                :data-bindings="dataBindings"
                :filtering="true"
                flat
                bordered
                >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci cliente</q-btn>
                </template>
                <template #actions="{ row }">
                    <q-btn icon="edit" flat size="sm" @click="onEdit(row.id)"/>
                    <q-btn icon="delete" flat size="sm" @click="onDelete(row.id)"/>
                </template>

                <template #links="{ row }">
                    <q-btn size="sm" color="secondary" flat :to="`/clientLocations/${row.id}`">Sedi ({{row.locationCount}})</q-btn>
                    <q-btn size="sm" color="secondary" flat :to="{ name: 'assets', params: { clientId: row.id } }">Assets</q-btn>
                </template>
            </adx-data-table>
        </adx-d>

    </adx-d>

  </q-page>
</template>

<script setup lang="ts">
import { useAdronix } from '@adronix/vue';
import { Item, DataSetUtils } from '@adronix/client';
import ClientEdit from './ClientEdit.vue'
import { useAdronixStore } from '../store/adronix'
import { ref } from 'vue';

const $adx = useAdronix()

const store = useAdronixStore()

const urlComposer = $adx.urlComposer('/api/mms/listClients')
const dataTable = $adx.dataTable(
  'MmsClient',
  {
    actions:      { label: 'Azioni', width: "100px" },
    name:         { label: 'Nome', width: "100%", sortable: true, field: (row: Item) => row.name },
    links:        { label: 'Collegamenti', width: "200px" }
  },
  store.getTableParams('clienti', 'name'))

const ds = $adx.dataSet(urlComposer(dataTable.params));

function onInsert() {
    $adx.openDialog(ClientEdit)
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsClient", key, () => ds.commit())
}

function onEdit(key: string) {
    $adx.openDialog(ClientEdit, { id: key })
}

const dataBindings = dataTable.bind(ds)

</script>
