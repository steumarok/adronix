<template>
    <adx-dialog ref="dialog" title="Risorsa" :loading="!resource">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="resource.name"
                label="Name"
                :errors="resource.errors.name"
                />

            <mms-resource-model-select
                v-model="resource.models"
                :errors="resource.errors.models"
                multiple
                label="Modelli"
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
const ds = $adx.dataSet(buildUrl('/api/mms/editResource', { id: props.id }))

const resource = ds.ref('MmsResource')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(resource)
    })
)
</script>
