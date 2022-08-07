<template>
    <adx-dialog ref="dialog" title="Modello di locale" :loading="!areaModel">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="areaModel.name"
                label="Name"
                :errors="areaModel.errors.name"
                />

        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';
import MmsAreaModelSelect from '../components/MmsAreaModelSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editAreaModel', { id: props.id }))

const areaModel = ds.ref('MmsAreaModel', props.id)

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(areaModel)
    })
)
</script>
