<template>
    <adx-dialog ref="dialog" title="Dati locale">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-if="area"
                v-model="area.name"
                label="Nome"
                filled
                :errors="area.errors.name"
                />

            <adx-select
                v-model="models"
                label="Modelli"
                :lookup-data-set="dsAreaModel"
                lookup-type="MmsAreaModel"
                lookup-display-property="name"
                clearable
                filled
                multiple
            />

        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { useAdronix } from '@adronix/vue'
import { computed, ref, unref, watch } from 'vue';

const props = defineProps({
  id: Number,
  clientLocationId: Number
})

const $adx = useAdronix()
const url = $adx.urlComposer('/api/mms/editArea')({ id: props.id, clientLocationId: props.clientLocationId })
const ds = $adx.dataSet(url)
const dsAreaModel = $adx.dataSet('/api/mms/lookupAreaModels')

const area = ds.ref('MmsArea')
const attributions = ds.list('MmsAreaModelAttribution')
const models = computed({
    get() {
        return attributions.map(attribution => attribution.model)
    },
    set(value) {
        if (value) {
            for (const model of value) {
                const attribution = attributions.find(attribution => attribution.model == model)
                if (!attribution) {
                    ds.insert('MmsAreaModelAttribution', { model, area: unref(area) })
                }
            }
        }
        attributions.filter(attribution => (value || []).indexOf(attribution.model) == -1)
            .forEach(item => ds.delete(item))
    }
})


const { dialog } = $adx.dialog(
  () => ds.commit()
)
</script>
