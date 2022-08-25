<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <nav-assets>
            <q-breadcrumbs-el>Componenti di {{asset?.name}}</q-breadcrumbs-el>
        </nav-assets>

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
import NavAssets from './NavAssets.vue'

const props = defineProps({
  assetId: Number
})

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsAssetComponent',
  {
    actions:      { label: 'Azioni', width: "100px" },
    name:         { label: 'Nome', width: "30%", sortable: true, field: (row: Item) => row.name },
    quantity:     { label: 'Quantità', width: "100px", sortable: true, field: (row: Item) => `${row.quantity} ${row.model.measurementUnit.name}` },
    model:        { label: 'Modello', width: "30%", sortable: true, field: (row: Item) => row.ref('model')?.name },
    area:         { label: 'Posizione', width: "30%", sortable: true, field: (row: Item) => row.ref('area')?.name },
  },
  { sortBy: "model.name", page: 1, limit: 10 })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listAssetComponents', {
    assetId: props.assetId,
    ...dataTable.params})))

const asset = ds.ref("MmsAsset")

function onInsert() {
    $adx.openDialog(AssetComponentEdit, { assetId: props.assetId })
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsAssetComponent", key, () => ds.commit())
}

function onEdit(key: string) {
    $adx.openDialog(AssetComponentEdit, { id: key })
}

</script>
