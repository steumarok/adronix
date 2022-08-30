<template>
    <adx-dialog ref="dialog" title="Attributo di stato" :loading="!stateAttribute">

        <adx-d vertical y-spacing="sm">

            <adx-data-input
                v-model="stateAttribute.name"
                label="Name"
                :errors="stateAttribute.errors.name"
                />

            <mms-state-attribute-select
                v-model="stateAttribute.incompatibleAttributes"
                :excluded="[stateAttribute]"
                label="Attributi non compatibili"
                multiple
                clearable
                />

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
                    v-model="stateAttribute.forWorkOrder"
                    label="Per ordine di lavoro"
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
