<template>
    <adx-dialog ref="dialog" title="Schedulazione" style="min-width: 80vw" :loading="!scheduling">

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-scheduling-type-select
                    v-model="scheduling.schedulingType"
                    :errors="scheduling.errors.schedulingType"
                    label="Tipologia"
                />
            </adx-d>
        </adx-d>


        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-task-model-select
                    v-model="scheduling.taskModel"
                    :errors="scheduling?.errors.taskModel"
                />
            </adx-d>
            <adx-d vertical padding="xs">
                <mms-asset-model-select
                    v-model="scheduling.assetModels"
                    :errors="scheduling?.errors.assetModels"
                    label="Modello di componente"
                    clearable
                    multiple
                    />

            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-asset-attribute-select
                    v-model="scheduling.assetAttributes"
                    multiple
                    clearable
                    />
            </adx-d>
            <adx-d vertical padding="xs">
                <mms-area-model-select
                    v-model="scheduling.areaModels"
                    :errors="scheduling?.errors.areaModels"
                    label="Modello di area"
                    clearable
                    multiple
                    />

            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <q-checkbox
                    v-if="isPeriodic"
                    v-model="scheduling.startImmediately"
                    label="Immediatamente"
                    :false-value="null"
                    />

                <adx-data-input
                    v-if="isPeriodic"
                    v-model="scheduling.maxTaskCount"
                    label="Numero massimo di attività"
                    :errors="scheduling.errors.maxTaskCount"
                />

                <adx-data-input
                    v-if="isPeriodic"
                    v-model="scheduling.maxPeriod"
                    label="Periodo massimo"
                    :errors="scheduling.errors.maxPeriod"
                >
                    <template #after>
                        <mms-scheduling-unit-select
                            outline
                            v-model="scheduling.maxPeriodUnit"
                            :errors="scheduling.errors.maxPeriodUnit"
                            />
                    </template>
                </adx-data-input>
            </adx-d>

            <adx-d vertical padding="xs">
                <mms-task-model-select
                    v-model="scheduling.triggerTaskModel"
                    :errors="scheduling.errors.triggerTaskModel"
                    label="Dopo"
                />

                <mms-state-attribute-select
                    v-if="isTriggered"
                    v-model="scheduling.triggerStateAttributes"
                    label="Attributi di stato"
                    :for-task="true"
                    multiple
                    clearable
                    />
            </adx-d>

            <adx-d vertical padding="xs">
                <adx-data-input
                    v-model="scheduling.every"
                    label="Ricorrenza"
                    :errors="scheduling.errors.every"
                    :prefix="isTriggered ? 'Dopo' : 'Ogni'"
                >
                    <template #after>
                        <mms-scheduling-unit-select
                            outline
                            v-model="scheduling.unit"
                            :errors="scheduling?.errors.unit"
                            />
                    </template>
                </adx-data-input>
            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <q-input
                    v-model="scheduling.startTime"
                    mask="time"
                    label="Ora inizio"
                    :rules="['time']">
                    <template v-slot:append>
                        <q-icon name="access_time" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-time v-model="scheduling.startTime">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Chiudi" color="primary" flat />
                                    </div>
                                </q-time>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
            </adx-d>
            <adx-d vertical padding="xs">
                <mms-day-of-week-select
                    v-model="scheduling.daysOfWeek"
                    :errors="scheduling?.errors.daysOfWeek"
                    label="Giorni settimana"
                    multiple
                />
            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-state-attribute-select
                    v-model="scheduling.assignedAttributes"
                    label="Attributo di stato assegnati all'attività"
                    :for-task="true"
                    :use-filter="true"
                    multiple
                    clearable
                    />
            </adx-d>
        </adx-d>
    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl, Item } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';
import MmsAreaModelSelect from '../components/MmsAreaModelSelect.vue'
import MmsAssetModelSelect from '../components/MmsAssetModelSelect.vue'
import MmsTaskModelSelect from '../components/MmsTaskModelSelect.vue'
import MmsPartSelect from '../components/MmsPartSelect.vue'
import MmsAssetAttributeSelect from '../components/MmsAssetAttributeSelect.vue'
import MmsSchedulingUnitSelect from '../components/MmsSchedulingUnitSelect.vue'
import MmsDayOfWeekSelect from '../components/MmsDayOfWeekSelect.vue'
import MmsSchedulingTypeSelect from '../components/MmsSchedulingTypeSelect.vue'
import MmsStateAttributeSelect from '../components/MmsStateAttributeSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editScheduling', { id: props.id}))

const scheduling = ds.ref('MmsScheduling')

watch(() => scheduling.value?.startImmediately, (newValue, oldValue) => {
    if (oldValue === undefined) {
        return
    }

    if (newValue && scheduling.value?.taskModel) {
        scheduling.value.startFromLasts = [scheduling.value.taskModel]
    } else {
        scheduling.value.startFromLasts = []
    }
})

const isPeriodic = computed(() => scheduling.value?.schedulingType == 'periodic')
const isTriggered = computed(() => scheduling.value?.schedulingType == 'triggered')

const { dialog } = $adx.dialog(() => ds.commit())
</script>
