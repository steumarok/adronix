<template>
    <adx-dialog ref="dialog" title="Tipo di risorsa" :loading="!resourceType">

        <adx-data-input
            v-model="resourceType.name"
            label="Name"
            outlined
            :errors="resourceType.errors.name"
            />

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref } from 'vue';

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editResourceType', { id: props.id }))

const resourceType = ds.ref('MmsResourceType')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(resourceType)
    })
)
</script>
