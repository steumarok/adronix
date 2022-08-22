<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Assets" />
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
                :data-bindings="dataBindings"
                :filtering="true"
                flat
                bordered
                dense
                >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci asset</q-btn>
                </template>
                <template #actions="{ row }">
                    <q-btn icon="edit" flat size="sm" @click="onEdit(row.id)"/>
                    <q-btn icon="delete" flat size="sm" @click="onDelete(row.id)"/>
                </template>

                <template #client="{ row }">
                    <span class="adx-reference" @click="onOpenCliente(row.client.id)">{{row.client.name}}</span>
                </template>

                <template #address="{ row }">
                    {{row.location.address}}
                </template>

                <template #locality="{ row }">
                    {{row.location.locality?.name}}
                </template>

                 <template #nextTask="{ row }">
                    {{row.nextTaskModel?.name}}
                    <br />
                    <span class="text-caption">{{row.nextTaskDate}}</span>
                </template>

                <template #links="{ row }">
                    <q-btn color="secondary" flat :to="`/assetComponents/${row.id}`" size="sm">Componenti</q-btn>
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
import AssetEdit from './AssetEdit.vue'
import { useAdronixStore } from '../store/adronix'

const $adx = useAdronix()

const store = useAdronixStore()

const urlComposer = $adx.urlComposer('/api/mms/listAssets')
const dataTable = $adx.dataTable(
  'MmsAsset',
  {
    actions:      { label: 'Azioni' },
    serialNumber: { label: 'Matricola', width: "100px", sortable: true, field: (row: Item) => row.serialNumber },
    model:        { label: 'Modello', width: "20%", sortable: true, field: (row: Item) => (row.model as Item).name },
    client:       { label: 'Cliente', width: "20%", sortable: true },
    address:      { label: 'Indirizzo', width: "20%", sortable: true },
    locality:     { label: 'Località', width: "20%", sortable: true },
    nextTask:     { label: 'Prossima attività', width: "20%", sortable: true },
    links:        { label: 'Collegamenti' }
  },
  store.getTableParams('assets', 'serialNumber'))

const ds = $adx.dataSet(urlComposer(dataTable.params));

function onOpenCliente(clientId: string) {
    $adx.openDialog(ClientEdit, { id: clientId })
}

function onInsert() {
    $adx.openDialog(AssetEdit)
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsAsset", key, () => ds.commit())
}

function onEdit(key: string) {
    $adx.openDialog(AssetEdit, { id: key })
}

const dataBindings = dataTable.bind(ds)

</script>
