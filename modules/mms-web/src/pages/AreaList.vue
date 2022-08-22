<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Clienti" to="/clients" />
            <q-breadcrumbs-el :to="`/clientLocations/${client?.id}`">Sedi di {{client?.name}}</q-breadcrumbs-el>
            <q-breadcrumbs-el>Aree di {{clientLocation?.address}} {{(clientLocation?.locality as Item)?.name}}</q-breadcrumbs-el>
        </adx-breadcrumbs>

        <adx-d>
            <adx-data-table
            :data-bindings="dataBindings"
            flat
            bordered
            >
                <template #top-left>
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci area</q-btn>
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
import { computed } from 'vue';
import { Item, DataSetUtils, buildUrl } from '@adronix/client';
import AreaEdit from './AreaEdit.vue'

const props = defineProps({
  clientLocationId: Number
})

const $adx = useAdronix()

const dataTable = $adx.dataTable(
  'MmsArea',
  {
    actions:      { label: 'Azioni', width: "100px" },
    name:         { label: 'Nome', width: "40%", sortable: true, field: (row: Item) => row.name },
    models:       { label: 'Modelli', width: "60%",
                    field: (row: Item) => (row.modelAttributions as Item[]).map(attribution => (attribution.model as Item).name).join(', ') },
  })

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listAreas', {
    locationId: props.clientLocationId,
    ...dataTable.params})))

const client = ds.ref("MmsClient")
const clientLocation = ds.ref("MmsClientLocation")

function onInsert() {
    $adx.openDialog(AreaEdit, { clientId: props.clientLocationId })
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsArea", key, () => ds.commit())
}

function onEdit(id: string) {
    $adx.openDialog(AreaEdit, { id })
}

const dataBindings = dataTable.bind(ds)


</script>
