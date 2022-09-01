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

        <adx-d horizontal>
            <adx-d vertical padding="xs">
                <adx-field-group title="Dati attività">
                    <adx-d horizontal fit justify="evenly" content="center">
                        <adx-d vertical padding="xs">
                            <adx-data-input
                                v-model="taskCode"
                                label="Nome/codice"
                                />
                        </adx-d>
                        <adx-d vertical padding="xs"  v-if="task.workOrder">
                            <adx-data-input
                                v-model="task.workOrder.code"
                                label="Ordine di lavoro"
                                />
                        </adx-d>
                    </adx-d>
                    <adx-d horizontal fit justify="evenly" content="center">
                        <adx-d vertical padding="xs">
                            <mms-task-model-select
                                v-model="task.model"
                                />
                        </adx-d>
                        <adx-d vertical padding="xs">
                            <mms-resource-select
                                v-model="task.resources"
                                label="Risorse coinvolte"
                                :errors="task.errors.resources"
                                multiple
                                />
                        </adx-d>

                    </adx-d>
                    <adx-d horizontal fit justify="evenly" content="center">
                        <adx-d vertical padding="xs">
                            <mms-state-attribute-select
                                v-model="task.stateAttributes"
                                :use-filter="true"
                                :for-task="true"
                                :with-work-order="task.workOrder"
                                multiple
                                />
                        </adx-d>
                    </adx-d>
                </adx-field-group>
            </adx-d>
            <adx-d vertical padding="xs">
                <adx-field-group title="Date">
                    <adx-d horizontal fit justify="evenly" content="center">
                        <adx-d vertical padding="xs">
                            <adx-data-input
                                v-model="task.scheduledDate"
                                data-type="datetime"
                                label="Data pianificata"
                                :errors="task.errors.scheduledDate"
                                />
                        </adx-d>
                        <adx-d vertical padding="xs">
                            <adx-data-input
                                v-model="task.executionDate"
                                data-type="datetime"
                                label="Data di esecuzione"
                                :errors="task.errors.executionDate"
                                />
                        </adx-d>
                        <adx-d vertical padding="xs">
                            <adx-data-input
                                v-model="task.completeDate"
                                data-type="datetime"
                                label="Data di completamento"
                                :errors="task.errors.completeDate"
                                />
                        </adx-d>
                    </adx-d>
                </adx-field-group>
<!--
                <adx-field-group title="Chiusura" class="q-mt-sm">
                    <adx-d horizontal fit justify="evenly" content="center">
                        <adx-d vertical padding="xs">
                            <mms-task-completion-outcome-select
                                label="Esito"
                                v-model="task.completionOutcome"
                                />
                        </adx-d>
                        <adx-d vertical padding="xs">
                            <mms-task-closing-reason-select
                                label="Motivo"
                                v-model="task.closingReason"
                                :completion-outcome="task.completionOutcome"
                                clearable
                                />
                        </adx-d>
                    </adx-d>
                    <adx-d horizontal fit justify="evenly" content="center">
                        <adx-d vertical padding="xs">
                            <adx-data-input
                                v-model="task.completionNotes"
                                label="Note"
                                :errors="task.errors.completionNotes"
                                />
                        </adx-d>
                    </adx-d>
                </adx-field-group>
-->
            </adx-d>
        </adx-d>



            </q-tab-panel>

            <q-tab-panel name="serviceProvision">

                <adx-data-table
                    :data-bindings="spBinding"
                    flat
                    dense
                    >
                    <template #top-left>
                        <q-btn @click="onInsertServiceProvision" color="primary" outline>Inserisci riga</q-btn>
                    </template>
                    <template #actions="{ row }">
                        <q-btn icon="delete" flat size="sm" @click="onDeleteServiceProvision(row)"/>
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
                            v-model="row.assetComponentModel"
                            label=""
                            dense
                            />
                    </template>
                    <template #expectedQuantity="{ row }">
                        <adx-data-input
                            v-if="row.service?.measurementUnit"
                            v-model="row.expectedQuantity"
                            dense
                            clearable="false"
                            :suffix="row.service?.measurementUnit?.name"
                            />
                    </template>
                    <template #actualQuantity="{ row }">
                        <adx-data-input
                            v-if="row.service?.measurementUnit"
                            v-model="row.expectedQuantity"
                            dense
                            input-class="text-right"
                            clearable="false"
                            :suffix="row.service?.measurementUnit?.name"
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
import MmsResourceSelect from '../components/MmsResourceSelect.vue'
import MmsStateAttributeSelect from '../components/MmsStateAttributeSelect.vue'
import MmsTaskCompletionOutcomeSelect from '../components/MmsTaskCompletionOutcomeSelect.vue'
import MmsTaskClosingReasonSelect from '../components/MmsTaskClosingReasonSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editTask', { id: props.id}))

const task = ds.ref('MmsTask')


function onDeleteServiceProvision(sp: Item) {
    if (sp.inserted) {
        ds.delete(sp)
    } else {
        ds.update(sp, { removed: true })
    }
}

function onInsertServiceProvision() {
    ds.insert('MmsServiceProvision', { task: unref(task) })
}

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)

const taskCode = computed(() => task.value.codePrefix + task.value.code + task.value.codeSuffix)
const manageExpected = computed(() => !task.workOrder)
const manageActual = computed(() => task.workOrder)

const tab = ref('general')

const spBinding = computed(() => {
    if (!task.value) {
        return
    }

    const quantityColName = task.value.workOrder ? 'actualQuantity' : 'expectedQuantity'

    const serviceProvisionDataTable = $adx.dataTable(
        'MmsServiceProvision',
        {
            actions:            { label: 'Azioni', width: "40px" },
            service:            { label: 'Servizio', width: "40%" },
            componentModel:     { label: 'Modello componente', width: "40%" },
            [quantityColName]:  { label: 'Q.tà', width: '20%'},
        })

    return serviceProvisionDataTable.bind(ds, (item) => !item.removed)
})
</script>
