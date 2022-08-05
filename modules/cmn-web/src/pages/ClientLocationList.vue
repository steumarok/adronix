<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Clienti" to="/clients" />
            <q-breadcrumbs-el>Sedi di {{client?.name}}</q-breadcrumbs-el>
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
            :data-bindings="dataBindings"
            flat
            bordered
            >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci sede</q-btn>
                </template>
                <template #actions="{ row }">
                    <q-btn icon="edit" flat size="sm" @click="onEdit(row.id)"/>
                    <q-btn icon="delete" flat size="sm" @click="onDelete(row.id)"/>
                </template>
                <template #links="{ row }">
                    <q-btn color="secondary" flat :to="`/areas/${row.id}`">Locali</q-btn>
                </template>

            </adx-data-table>
        </adx-d>

    </adx-d>

  </q-page>
</template>

<script setup lang="ts">
import { useAdronix } from '@adronix/vue';
import { Item, DataSetUtils } from '@adronix/client';
import ClientLocationEdit from './ClientLocationEdit.vue'
import { computed } from 'vue';

const props = defineProps({
  clientId: Number
})

const $adx = useAdronix()

const urlComposer = $adx.urlComposer(`/api/mms/listClientLocations?clientId=${props.clientId}`)
const dataTable = $adx.dataTable(
  'MmsClientLocation',
  {
    actions:      { label: 'Azioni', width: "100px" },
    address:      { label: 'Indirizzo', width: "100%", field: (row: Item) => row.address },
    locality:     { label: 'Località', field: (row: Item) => (row.locality as Item)?.name },
    links:        { label: 'Collegamenti', width: "200px" }
  },
  { sortBy: 'address' })

const ds = $adx.dataSet(urlComposer(dataTable.params));
const client = ds.ref("MmsClient")

function onInsert() {
    $adx.openDialog(ClientLocationEdit, { clientId: props.clientId })
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsClientLocation", key, () => ds.commit())
}

function onEdit(key: string) {
    $adx.openDialog(ClientLocationEdit, { id: key })
}

const dataBindings = dataTable.bind(ds)


</script>
