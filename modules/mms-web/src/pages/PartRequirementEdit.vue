<template>
    <adx-dialog ref="dialog" title="Voce di fabbisogno" style="min-width: 80vw" :loading="!partRequirement">

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-task-model-select
                    v-model="partRequirement.taskModel"
                    :errors="partRequirement?.errors.taskModel"
                />
            </adx-d>
            <adx-d vertical padding="xs">
                <mms-asset-model-select
                    v-model="partRequirement.assetModel"
                    :errors="partRequirement?.errors.assetModel"
                    clearable
                    />

            </adx-d>
            <adx-d vertical padding="xs">
                <mms-asset-attribute-select
                    v-model="partRequirement.assetAttributes"
                    multiple
                    clearable
                    />
            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-part-select
                    v-model="partRequirement.part"
                    :errors="partRequirement?.errors.part"
                    />
            </adx-d>

            <adx-d vertical padding="xs">
                <adx-data-input
                    v-model="partRequirement.quantity"
                    label="Quantità"
                    :errors="partRequirement.errors.quantity"
                    :suffix="partRequirement.part?.measurementUnit.name"
                />
            </adx-d>
        </adx-d>
    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl, Item } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { computed, watch } from 'vue';
import MmsAssetModelSelect from '../components/MmsAssetModelSelect.vue'
import MmsTaskModelSelect from '../components/MmsTaskModelSelect.vue'
import MmsPartSelect from '../components/MmsPartSelect.vue'
import MmsAssetAttributeSelect from '../components/MmsAssetAttributeSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editPartRequirement', { id: props.id}))

const partRequirement = ds.ref('MmsPartRequirement')

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)
</script>
