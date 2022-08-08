<template>
    <adx-dialog ref="dialog" title="Dati asset" style="min-width: 80vw" :loading="!asset">

        <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
            >
            <q-tab name="general" label="Generale" />
            <q-tab name="lastTaskInfo" label="Ultime attività" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated style="min-height: 400px">
          <q-tab-panel name="general">

                <adx-d horizontal fit justify="evenly" content="center">
                    <adx-d vertical padding="xs">
                        <adx-data-input
                            v-model="asset.serialNumber"
                            label="Matricola"
                            :errors="asset?.errors.serialNumber"
                            />
                    </adx-d>
                    <adx-d vertical padding="xs">
                        <mms-asset-model-select
                            v-model="asset.model"
                            />
                    </adx-d>
                </adx-d>

                <adx-d horizontal fit justify="evenly">
                    <adx-d vertical padding="xs">
                        <mms-client-autocomplete
                            v-model="asset.client"
                            :show-insertion-button="asset?.inserted"
                            @client-inserted="onClientInserted"
                            :errors="asset?.errors.client"
                        />
                    </adx-d>
                    <adx-d vertical padding="xs">
                        <mms-client-location-select
                            v-model="asset.location"
                            :client-id="asset.ref('client')?.id"
                            :errors="asset?.errors.location"
                            />
                    </adx-d>
                </adx-d>

                <adx-d horizontal fit justify="evenly">
                    <adx-d vertical padding="xs">

                    </adx-d>
                    <adx-d vertical padding="xs">
                        <mms-area-select
                            v-model="asset.area"
                            :client-location-id="asset.ref('location')?.id"
                            clearable
                            />
                    </adx-d>
                </adx-d>

                <adx-d horizontal fit justify="evenly">
                    <adx-d vertical padding="xs">
                        <mms-asset-attribute-select
                            v-model="asset.attributes"
                            :excluded="getIncompatibleAttributes(asset.attributes)"
                            multiple
                            clearable
                            />
                    </adx-d>
                </adx-d>
            </q-tab-panel>

            <q-tab-panel name="lastTaskInfo">

                <adx-data-table
                    :data-bindings="ltiDataTable.bind(ds)"
                    flat
                    dense
                    >
                    <template #top-left>
                        <q-btn @click="onInsertLastTaskInfo" color="primary" outline>Inserisci riga</q-btn>
                    </template>
                    <template #actions="{ row }">
                        <q-btn icon="delete" flat size="sm" @click="onDeleteLastTaskInfo(row)"/>
                    </template>

                    <template #model="{ row }">
                        <mms-task-model-select
                            v-model="row.taskModel"
                            :excluded="getExcludedLtiTaskModels(row)"
                            label=""
                            dense
                            />
                    </template>
                    <template #executionDate="{ row }">
                        <adx-data-input
                            v-model="row.executionDate"
                            dense
                            type="date"
                            clearable="false"
                            />
                    </template>
                </adx-data-table>

            </q-tab-panel>
        </q-tab-panels>
    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl, Item } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch, ref, unref, reactive } from 'vue';
import MmsAssetModelSelect from '../components/MmsAssetModelSelect.vue'
import MmsClientAutocomplete from '../components/MmsClientAutocomplete.vue'
import MmsClientLocationSelect from '../components/MmsClientLocationSelect.vue'
import MmsAreaSelect from '../components/MmsAreaSelect.vue'
import MmsAssetAttributeSelect from '../components/MmsAssetAttributeSelect.vue'
import MmsTaskModelSelect from '../components/MmsTaskModelSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editAsset', { id: props.id}))

const asset = ds.ref('MmsAsset')

function getExcludedLtiTaskModels(lti: Item) {
    return ds.list("MmsLastTaskInfo", item => item.id != lti.id)
        .filter(item => item.taskModel)
        .map(item => item.taskModel)
}

const ltiDataTable = $adx.dataTable(
  'MmsLastTaskInfo',
  {
    actions:        { label: 'Azioni', width: "40px" },
    model:          { label: 'Modello di attività', width: "100%" },
    executionDate:  { label: 'Data di esecuzione'},
  })

watch(() => asset.value?.client, (newValue, oldValue) => {
    if (oldValue && newValue != oldValue) {
        asset.value.location = null
    }
})

watch(() => asset.value?.location, (newValue, oldValue) => {
    if (oldValue && newValue != oldValue) {
        asset.value.area = null
    }
})

function onDeleteLastTaskInfo(lti: Item) {
    ds.delete(lti)
}

function onInsertLastTaskInfo() {
    ds.insert('MmsLastTaskInfo', { asset: unref(asset) })
}

function onClientInserted(client: Item) {
    asset.value.client = client
}

function getIncompatibleAttributes(attributes) {
    attributes = attributes || []
    return attributes
        .filter(a => a.incompatibleAttributes)
        .flatMap(a => a.incompatibleAttributes)

}

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)

const tab = ref('general')
</script>
