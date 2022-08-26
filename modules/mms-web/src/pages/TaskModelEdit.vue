<template>
    <adx-dialog ref="dialog" title="Modello di attività" :loading="!taskModel">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="taskModel.name"
                label="Name"
                :errors="taskModel.errors.name"
                />

            <mms-resource-model-select
                v-model="taskModel.resourceModels"
                :errors="taskModel?.errors.resourceModels"
                multiple
                />

            <adx-data-input
                v-model="taskModel.codePrefix"
                label="Prefisso"
                :errors="taskModel.errors.codePrefix"
                />

            <adx-data-input
                v-model="taskModel.codeSuffix"
                label="Suffisso"
                :errors="taskModel.errors.codeSuffix"
                />

            <q-checkbox
                v-model="taskModel.useGlobalCounter"
                :false-value="null"
                label="Usa counter globale"
                />
        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';
import MmsResourceModelSelect from '../components/MmsResourceModelSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editTaskModel', { id: props.id }))

const taskModel = ds.ref('MmsTaskModel')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(taskModel)
    })
)
</script>
