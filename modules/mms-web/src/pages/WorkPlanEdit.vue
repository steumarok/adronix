<template>
    <adx-dialog ref="dialog" title="Piano di lavoro" style="min-width: 80vw" :loading="!workPlan">

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-task-model-select
                    v-model="workPlan.taskModel"
                    :errors="workPlan?.errors.taskModel"
                />
            </adx-d>
            <adx-d vertical padding="xs">
                <mms-asset-model-select
                    v-model="workPlan.assetModel"
                    :errors="workPlan?.errors.assetModel"
                    label="Modello asset"
                    clearable
                    />

            </adx-d>
            <adx-d vertical padding="xs">
                <mms-asset-attribute-select
                    v-model="workPlan.assetAttributes"
                    label="Attributi asset"
                    multiple
                    clearable
                    />
            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs" v-if="assetComponentModelShown">
                <mms-asset-component-model-select
                    v-model="workPlan.assetComponentModel"
                    :errors="workPlan?.errors.assetComponentModel"
                    label="Modello componente"
                    clearable
                    />

            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-service-select
                    v-model="workPlan.service"
                    :errors="workPlan?.errors.service"
                    />
            </adx-d>

            <adx-d vertical padding="xs">
                <adx-data-input
                    v-model="workPlan.quantity"
                    label="Quantità"
                    :disable="quantityDisabled"
                    :errors="workPlan.errors.quantity"
                    :suffix="quantityMeasurementUnitName"
                >
                    <template #after>
                        <mms-quantity-type-select
                            v-if="workPlan.service?.measurementUnit"
                            class="q-ml-md"
                            outline
                            v-model="workPlan.quantityType"
                            :errors="workPlan?.errors.quantityType"
                            />
                    </template>
                </adx-data-input>
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
import MmsServiceSelect from '../components/MmsServiceSelect.vue'
import MmsAssetAttributeSelect from '../components/MmsAssetAttributeSelect.vue'
import MmsQuantityTypeSelect from '../components/MmsQuantityTypeSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editWorkPlan', { id: props.id}))

const workPlan = ds.ref('MmsWorkPlan')

const assetComponentModelShown = computed(() => {
    return !workPlan.value.assetModel || workPlan.value.assetModel.assetType == 'composite'
})

const quantityMeasurementUnitName = computed(() => {
    if (workPlan.value.service?.measurementUnit) {
        let t = ''
        if (workPlan.value.quantityType == 'relative') {
            if (workPlan.value.assetComponentModel) {
                t = ` / ${workPlan.value.assetComponentModel?.unitQuantity} ${workPlan.value.assetComponentModel?.measurementUnit.name}`
            }
            else if (workPlan.value.assetModel) {
                t = ` / ${workPlan.value.assetModel?.measurementUnit.name}`
            }
        }
        return `${workPlan.value.service?.measurementUnit.name} ${t}`
    }
    else {
        return ''
    }
})

const quantityDisabled = computed(() => {
    return !workPlan.value.service
})

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)
</script>
