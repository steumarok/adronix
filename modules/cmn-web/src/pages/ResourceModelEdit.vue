<template>
    <adx-dialog ref="dialog" title="Modello di risorsa" :loading="!resourceModel">

        <adx-data-input
            v-model="resourceModel.name"
            label="Name"
            :errors="resourceModel.errors.name"
            />

        <mms-resource-type-select
            v-model="resourceModel.resourceType"
            :errors="resourceModel?.errors.resourceType"
            />

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';
import MmsResourceTypeSelect from '../components/MmsResourceTypeSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editResourceModel', { id: props.id }))

const resourceModel = ds.ref('MmsResourceModel')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(resourceModel)
    })
)
</script>
