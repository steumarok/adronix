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
                    label="Modello asset"
                    clearable
                    />

            </adx-d>
            <adx-d vertical padding="xs">
                <mms-asset-attribute-select
                    v-model="partRequirement.assetAttributes"
                    label="Attributi asset"
                    multiple
                    clearable
                    />
            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs" v-if="assetComponentModelShown">
                <mms-asset-component-model-select
                    v-model="partRequirement.assetComponentModel"
                    :errors="partRequirement?.errors.assetComponentModel"
                    label="Modello componente"
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
                    :disable="quantityDisabled"
                    :errors="partRequirement.errors.quantity"
                    :suffix="quantityMeasurementUnitName"
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
import MmsAssetComponentModelSelect from '../components/MmsAssetComponentModelSelect.vue'
import MmsTaskModelSelect from '../components/MmsTaskModelSelect.vue'
import MmsPartSelect from '../components/MmsPartSelect.vue'
import MmsAssetAttributeSelect from '../components/MmsAssetAttributeSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editPartRequirement', { id: props.id}))

const partRequirement = ds.ref('MmsPartRequirement')

const assetComponentModelShown = computed(() => {
    return !partRequirement.value.assetModel || partRequirement.value.assetModel.assetType == 'composite'
})

const quantityMeasurementUnitName = computed(() => {
    let t = ''
    if (partRequirement.value.assetComponentModel) {
        t = ` / ${partRequirement.value.assetComponentModel?.unitQuantity} ${partRequirement.value.assetComponentModel?.measurementUnit.name}`
    }
    else if (partRequirement.value.assetModel) {
        t = ` / ${partRequirement.value.assetModel?.measurementUnit.name}`
    }
    return `${partRequirement.value.part?.measurementUnit.name} ${t}`
})

const quantityDisabled = computed(() => {
    return !partRequirement.value.part
})

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)
</script>
