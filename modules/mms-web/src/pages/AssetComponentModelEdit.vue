<template>
    <adx-dialog ref="dialog" title="Modello di componente" :loading="!assetComponentModel" style="min-width: 80vw">

        <adx-d vertical y-spacing="sm">
            <adx-data-input
                v-model="assetComponentModel.name"
                label="Name"
                :errors="assetComponentModel.errors.name"
                />

            <adx-d horizontal fit justify="evenly">
                <adx-d vertical padding="xs">
                    <cmn-measurement-unit-select
                        v-model="assetComponentModel.measurementUnit"
                        :errors="assetComponentModel?.errors.measurementUnit"
                        />
                </adx-d>

                <adx-d vertical padding="xs">
                    <adx-data-input
                        v-model="assetComponentModel.unitQuantity"
                        label="Quantità unitaria"
                        :suffix="assetComponentModel.measurementUnit?.name"
                        :errors="assetComponentModel.errors.unitQuantity"
                        />
                </adx-d>
            </adx-d>

            <adx-d vertical padding="xs">
                <mms-checklist-item-model-select
                    label="Modelli di elementi di checklist"
                    v-model="assetComponentModel.checklistItemModels"
                    :errors="assetComponentModel.errors.checklistItemModels"
                    multiple
                    />
            </adx-d>

        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref, computed, reactive } from 'vue';
import { CmnMeasurementUnitSelect } from '@adronix/cmn-web'
import MmsChecklistItemModelSelect from '../components/MmsChecklistItemModelSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editAssetComponentModel', { id: props.id }))

const assetComponentModel = ds.ref('MmsAssetComponentModel')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(assetComponentModel)
    })
)
</script>
