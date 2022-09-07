<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <nav-tasks />

        <adx-d>
            <adx-data-table
                :data-bindings="dataBindings"
                :filtering="true"
                flat
                bordered
                dense
                >
                <template #top-left v-if="topLeftShown">
                    <q-btn @click="onInsert" color="primary" unelevated>Inserisci attività</q-btn>
                    <q-btn @click="onCreateWorkOrder" color="secondary" unelevated class="q-ml-xs">Apri Ordine di Lavoro</q-btn>
                    <TaskListFilter v-bind="$props" :data-set="ds" />
                </template>
                <template #actions="{ row }">
                    <q-btn icon="edit" flat size="sm" @click="onEdit(row.id)"/>
                </template>

                <template #wo="{ row }">
                    <q-checkbox
                        v-if="!row.workOrder"
                        v-model="woSelection"
                        :val="row.id"
                        keep-color
                        color="secondary"
                        :false-value="null"
                        dense
                        />
                </template>

                <template #client="{ row }">
                    <span class="adx-reference" @click="onOpenCliente(row.asset.client.id)">{{row.asset.client.name}}</span>
                </template>

                <template #attributes="{ row }">
                    <q-chip size="sm" v-for="attribute in row.stateAttributes" dense :label="attribute.name" />
                </template>

                <template #address="{ row }">
                    {{row.asset.location?.address}}
                </template>

                <template #assetModel="{ row }">
                    {{row.asset.model.name}}
                </template>

                <template #locality="{ row }">
                    {{row.asset.location?.locality?.name}}
                </template>

                 <template #nextTask="{ row }">
                    {{row.nextTaskModel?.name}}
                    <br />
                    <span class="text-caption">{{row.nextTaskDate}}</span>
                </template>

                <template #links="{ row }">
                    <q-btn v-if="row.model.assetType == 'composite'" color="secondary" flat :to="`/assetComponents/${row.id}`" size="sm">Componenti</q-btn>
                </template>
                <template #links2="{ row }">
                    <q-btn color="secondary" flat :to="`/assetComponents/${row.id}`" size="sm">Attività</q-btn>
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
import TaskEdit from './TaskEdit.vue'
import { useAdronixStore } from '../store/adronix'
import { computed, ref, watch } from 'vue'
import NavTasks from './NavTasks.vue'
import TaskListFilter from './TaskListFilter.vue'
import { useNavigationStore } from '../store/navigation'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router';

const props = defineProps({
    workOrderId: Number,
    clientId: Number
})

const route = useRoute();
const navStore = useNavigationStore()

if (route.name == 'tasks') {
    if (props.workOrderId) {
        navStore.taskFilter.workOrder = { id: props.workOrderId }
        navStore.clearTaskFilter('client')
    }
    else if (props.clientId) {
        navStore.taskFilter.client = { id: props.clientId }
        navStore.clearTaskFilter('workOrder')
    }
    else {
        navStore.clearTaskFilter('client')
        navStore.clearTaskFilter('workOrder')
    }
}


const $adx = useAdronix()

const store = useAdronixStore()

const dataTable = $adx.dataTable(
  'MmsTask',
  {
    actions:        { label: '' },
    wo:             { label: 'OdL' },
    code:           { label: 'Codice', width: "50px", sortable: true, field: (row: Item) => `${row.codePrefix || ''}${row.code}${row.codeSuffix || ''}` },
    attributes:     { label: 'Attributi' },
    model:          { label: 'Modello attività', width: "20%", sortable: true, field: (row: Item) => (row.model as Item).name },
    assetModel:     { label: 'Modello asset', width: "20%", sortable: true },
    client:         { label: 'Cliente', width: "20%", sortable: true },
    address:        { label: 'Indirizzo', width: "20%", sortable: true },
    locality:       { label: 'Località', width: "20%", sortable: true },
    scheduledDate:  { label: 'Data prevista', width: "20%", sortable: true, field: (row: Item) => row.scheduledDate },
  },
  store.getTableParams('tasks', 'code'))

const woTaskId = ref()

const ds = $adx.dataSet(computed(() => buildUrl('/api/mms/listTasks', {
    clientId: navStore.taskFilter.client.id,
    workOrderId: navStore.taskFilter.workOrder.id,
    workOrderTaskId: woTaskId.value,
    ...dataTable.params
})))

if (navStore.taskFilter.workOrder.id) {
    navStore.taskFilter.workOrder.ref = ds.ref('MmsWorkOrder', navStore.taskFilter.workOrder.id)
}

if (navStore.taskFilter.client.id) {
    navStore.taskFilter.client.ref = ds.ref('MmsClient', navStore.taskFilter.client.id)
}

if (navStore.assetFilter.clientLocation.id) {
    navStore.assetFilter.clientLocation.ref = ds.ref('MmsClientLocation', navStore.assetFilter.clientLocation.id)
}


function onOpenCliente(clientId: string) {
    $adx.openDialog(ClientEdit, { id: clientId })
}

function onInsert() {
    $adx.openDialog(TaskEdit)
}

function onDelete(key: string) {
    DataSetUtils.deleteItem(ds, "MmsAsset", key, () => ds.commit())
}

function onEdit(id: string) {
    $adx.openDialog(TaskEdit, { id })
}

function onCreateWorkOrder() {
    const workOrder = ds.insert("MmsWorkOrder")
    const firstTask = ds.ref("MmsTask", woSelection.value[0])
    workOrder.client = firstTask.value.asset.client
    workOrder.location = firstTask.value.asset.location
    for (const taskId of woSelection.value) {
        const task = ds.findItem("MmsTask", (item) => item.id == taskId)
        ds.update(task, { workOrder })
    }
    ds.commit()
}

const dataBindings = dataTable.bind(ds)

const woSelection = ref([])

watch(woSelection, () => {
    if (woSelection.value.length == 0) {
        woTaskId.value = null
    }
    else if (woSelection.value.length == 1) {
        woTaskId.value = woSelection.value[0]
    }
})

const topLeftShown = computed(() => !navStore.taskFilter.workOrder.id)

</script>
