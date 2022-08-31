<template>
    <adx-dialog ref="dialog" title="Motivo chiusura attività" :loading="!taskClosingReason">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="taskClosingReason.name"
                label="Name"
                :errors="taskClosingReason.errors.name"
                />

            <mms-task-completion-outcome-select
                label="Esito attività"
                v-model="taskClosingReason.completionOutcome"
                />

            <mms-state-attribute-select
                v-model="taskClosingReason.assignedAttributes"
                :for-task="true"
                :for-asset="true"
                :for-work-order="true"
                multiple
                clearable
                />

        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';
import MmsStateAttributeSelect from '../components/MmsStateAttributeSelect.vue'
import MmsTaskCompletionOutcomeSelect from '../components/MmsTaskCompletionOutcomeSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editTaskClosingReason', { id: props.id }))

const taskClosingReason = ds.ref('MmsTaskClosingReason', props.id)

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(taskClosingReason)
    })
)
</script>
