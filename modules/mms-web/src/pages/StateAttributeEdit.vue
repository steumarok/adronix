<template>
    <adx-dialog ref="dialog" title="Attributo di stato" :loading="!stateAttribute" style="min-width: 80%">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="stateAttribute.name"
                label="Name"
                :errors="stateAttribute.errors.name"
                />

            <mms-state-attribute-select
                v-model="stateAttribute.containers"
                :excluded="[stateAttribute]"
                label="Associato a"
                :for-task="stateAttribute.forTask"
                multiple
                clearable
                />

            <mms-state-attribute-select
                v-model="stateAttribute.incompatibleAttributes"
                :excluded="[stateAttribute]"
                label="In alternativa a"
                :for-task="stateAttribute.forTask"
                :for-work-order="stateAttribute.forWorkOrder"
                multiple
                clearable
                />

            <adx-d vertical y-spacing="sm">
                <q-checkbox
                    v-model="stateAttribute.asInitialState"
                    label="Imposta come stato iniziale"
                    :false-value="null"
                    />
            </adx-d>

            <adx-d vertical y-spacing="sm">
                <q-checkbox
                    v-model="stateAttribute.autoAssigned"
                    label="Assegnato automaticamente"
                    :false-value="null"
                    />
            </adx-d>

            <adx-d vertical y-spacing="sm">
                <q-checkbox
                    v-model="stateAttribute.forAsset"
                    label="Per asset"
                    :false-value="null"
                    />
            </adx-d>

            <adx-d vertical y-spacing="sm">
                <q-checkbox
                    v-model="stateAttribute.forAssetComponent"
                    label="Per componente"
                    :false-value="null"
                    />
            </adx-d>

            <adx-d vertical y-spacing="sm">
                <q-checkbox
                    v-model="stateAttribute.forTask"
                    label="Per attività"
                    :false-value="null"
                    />
            </adx-d>

            <adx-d vertical y-spacing="sm">
                <q-checkbox
                    v-model="stateAttribute.withWorkOrder"
                    label="Con ordine di lavoro"
                    toggle-indeterminate
                    />
            </adx-d>

            <adx-d vertical y-spacing="sm">
                <q-checkbox
                    v-model="stateAttribute.forWorkOrder"
                    label="Per ordine di lavoro"
                    :false-value="null"
                    />
            </adx-d>

            <mms-state-attribute-select
                v-model="stateAttribute.withAllTaskStates"
                label="Con tutti questi stati delle attività"
                :for-task="true"
                :only-roots="true"
                :useFilter="false"
                multiple
                clearable
                />

            <adx-d vertical y-spacing="sm">
                <q-checkbox
                    v-model="stateAttribute.withMandatoryChecklists"
                    label="Con tutte le checklist obbligatorie compilate"
                    :false-value="null"
                    />
            </adx-d>



        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';
import MmsStateAttributeSelect from '../components/MmsStateAttributeSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editStateAttribute', { id: props.id }))

const stateAttribute = ds.ref('MmsStateAttribute', props.id)

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(stateAttribute)
    })
)
</script>
