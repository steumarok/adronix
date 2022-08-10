<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Assets" to="/assets" />
            <q-breadcrumbs-el>Componenti asset</q-breadcrumbs-el>
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
                :data-bindings="dataTable.bind(ds)"
                flat
                bordered
            >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci componente</q-btn>
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
import AssetComponentEdit from './AssetComponentEdit.vue'
import { computed } from 'vue';

const props = defineProps({
  assetId: Number
})

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsAssetComponent',
  {
    actions:      { label: 'Azioni', width: "100px" },
    nome:         { label: 'Nome', width: "30%", sortable: true, field: (row: Item) => row.name },
    model:        { label: 'Modello', width: "30%", sortable: true, field: (row: Item) => row.ref('model').name },
    area:         { label: 'Posizione', width: "30%", sortable: true, field: (row: Item) => row.ref('area').name },
  },
  { sortBy: "model.name" })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listAssetComponents', {
    assetId: props.assetId,
    ...dataTable.params})))

function onInsert() {
    $adx.openDialog(AssetComponentEdit)
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsAssetComponent", key, () => ds.commit())
}

function onEdit(key: string) {
    $adx.openDialog(AssetComponentEdit, { id: key })
}

</script>
