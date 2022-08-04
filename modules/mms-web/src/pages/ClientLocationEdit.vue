<template>
    <adx-dialog ref="dialog" title="Dati sede">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-if="clientLocation"
                v-model="clientLocation.address"
                label="Indirizzo"
                outlined
                :errors="clientLocation.errors.name"
                />

            <adx-autocomplete
                v-if="clientLocation"
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
import { useAdronix } from '@adronix/vue'

const props = defineProps({
  id: Number,
  clientId: Number
})

const $adx = useAdronix()
const url = $adx.urlComposer('/api/mms/editClientLocation')({ id: props.id, clientId: props.clientId })
const ds = $adx.dataSet(url)

const clientLocation = ds.ref('MmsClientLocation')

const { dialog } = $adx.dialog(
  () => ds.commit()
)
</script>
