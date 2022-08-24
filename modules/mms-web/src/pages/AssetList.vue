<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <nav-assets />

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
                    <AssetListFilter v-bind="$props" :data-set="ds" />
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
                    <q-btn v-if="row.model.assetType == 'composite'" color="secondary" flat :to="`/assetComponents/${row.id}`" size="sm">Componenti</q-btn>
                </template>
            </adx-data-table>
        </adx-d>

    </adx-d>

  </q-page>
</template>

<script setup lang="ts">
import { useAdronix } from '@adronix/vue';
import { Item, DataSetUtils, buildUrl } from '@adronix/client';
import ClientEdit from './ClientEdit.vue'
import AssetEdit from './AssetEdit.vue'
import { useAdronixStore } from '../store/adronix'
import { computed } from 'vue'
import NavAssets from './NavAssets.vue'
import AssetListFilter from './AssetListFilter.vue'
import { useNavigationStore } from '../store/navigation'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router';

const props = defineProps({
  clientId: Number,
  clientLocationId: Number
})

const route = useRoute();
const navStore = useNavigationStore()

if (route.name == 'assets') {
    if (props.clientId) {
        navStore.assetFilter.client = { id: props.clientId }
        navStore.clearAssetFilter('clientLocation')
    }
    else if (props.clientLocationId) {
        navStore.assetFilter.clientLocation = { id: props.clientLocationId }
        navStore.clearAssetFilter('client')
    }
    else {
        navStore.clearAssetFilter('clientLocation')
        navStore.clearAssetFilter('client')
    }
}


const $adx = useAdronix()

const store = useAdronixStore()

const dataTable = $adx.dataTable(
  'MmsAsset',
  {
    actions:      { label: 'Azioni' },
    name:         { label: 'Nome', width: "50px", sortable: true, field: (row: Item) => row.name },
    model:        { label: 'Modello', width: "20%", sortable: true, field: (row: Item) => (row.model as Item).name },
    client:       { label: 'Cliente', width: "20%", sortable: true },
    address:      { label: 'Indirizzo', width: "20%", sortable: true },
    locality:     { label: 'Località', width: "20%", sortable: true },
    nextTask:     { label: 'Prossima attività', width: "20%", sortable: true },
    links:        { label: 'Collegamenti' }
  },
  store.getTableParams('assets', 'name'))


const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listAssets', {
    clientId: navStore.assetFilter.client.id,
    clientLocationId: navStore.assetFilter.clientLocation.id,
    ...dataTable.params
})))

if (navStore.assetFilter.client.id) {
    navStore.assetFilter.client.ref = ds.ref('MmsClient', navStore.assetFilter.client.id)
}

if (navStore.assetFilter.clientLocation.id) {
    navStore.assetFilter.clientLocation.ref = ds.ref('MmsClientLocation', navStore.assetFilter.clientLocation.id)
}


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
