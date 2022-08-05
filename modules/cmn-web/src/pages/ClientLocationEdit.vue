<template>
    <adx-dialog ref="dialog" title="Dati sede" :loading="!clientLocation">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="clientLocation.address"
                label="Indirizzo"
                outlined
                :errors="clientLocation.errors.name"
                />

            <adx-autocomplete
                v-model="clientLocation.locality"
                label="Località"
                lookup-data-set-url="/api/cmn/lookupLocalities"
                lookup-type="CmnLocality"
                lookup-display-property="name"
                clearable
                outlined
                />

        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'

const props = defineProps({
  id: Number,
  clientId: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editClientLocation', { id: props.id, clientId: props.clientId }))

const clientLocation = ds.ref('MmsClientLocation')

const { dialog } = $adx.dialog(
  () => ds.commit()
)
</script>
