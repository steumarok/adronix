<template>
    <adx-dialog ref="dialog" title="Dati attività" style="min-width: 80vw" :loading="!task">

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
            <q-tab name="partUsage" label="Materiali" />
            <q-tab name="serviceProvision" label="Servizi" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated style="min-height: 400px">
            <q-tab-panel name="general">

                <adx-d horizontal fit justify="evenly" content="center">
                    <adx-d vertical padding="xs">
                        <adx-data-input
                            v-model="taskCode"
                            label="Nome/codice"
                            />
                    </adx-d>
                    <adx-d vertical padding="xs">
                        <mms-task-model-select
                            v-model="task.model"
                            />
                    </adx-d>
                </adx-d>

            </q-tab-panel>

            <q-tab-panel name="serviceProvision">

                <adx-data-table
                    :data-bindings="serviceProvisionDataTable.bind(ds)"
                    flat
                    dense
                    >
                    <template #top-left>
                        <q-btn @click="onInsertLastTaskInfo" color="primary" outline>Inserisci riga</q-btn>
                    </template>
                    <template #actions="{ row }">
                        <q-btn icon="delete" flat size="sm" @click="onDeleteLastTaskInfo(row)"/>
                    </template>

                    <template #service="{ row }">
                        <mms-service-select
                            v-model="row.service"
                            label=""
                            dense
                            />
                    </template>
                    <template #componentModel="{ row }">
                        <mms-asset-component-model-select
                            v-model="row.workPlan.assetComponentModel"
                            label=""
                            dense
                            />
                    </template>
                    <template #expectedQuantity="{ row }">
                        <adx-data-input
                            v-model="row.expectedQuantity"
                            dense
                            clearable="false"
                            :suffix="row.service.measurementUnit?.name"
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
import MmsAssetComponentModelSelect from '../components/MmsAssetComponentModelSelect.vue'
import MmsClientAutocomplete from '../components/MmsClientAutocomplete.vue'
import MmsClientLocationSelect from '../components/MmsClientLocationSelect.vue'
import MmsAreaSelect from '../components/MmsAreaSelect.vue'
import MmsAssetAttributeSelect from '../components/MmsAssetAttributeSelect.vue'
import MmsTaskModelSelect from '../components/MmsTaskModelSelect.vue'
import MmsServiceSelect from '../components/MmsServiceSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editTask', { id: props.id}))

const task = ds.ref('MmsTask')

const serviceProvisionDataTable = $adx.dataTable(
  'MmsServiceProvision',
  {
    actions:            { label: 'Azioni', width: "40px" },
    service:            { label: 'Servizio', width: "50%" },
    componentModel:     { label: 'Modello componente', width: "50%" },
    expectedQuantity:   { label: 'Quantità'},
  })

function onDeleteLastTaskInfo(lti: Item) {
    ds.delete(lti)
}

function onInsertLastTaskInfo() {
    ds.insert('MmsLastTaskInfo', { asset: unref(task) })
}

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)

const taskCode = computed(() => task.value.codePrefix + task.value.code + task.value.codeSuffix)

const tab = ref('general')
</script>
