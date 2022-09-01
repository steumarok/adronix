<template>
    <adx-dialog ref="dialog" title="Modello di asset" :loading="!assetModel" style="min-width: 80vw">

        <adx-d vertical y-spacing="sm">
            <adx-data-input
                v-model="assetModel.name"
                label="Name"
                :errors="assetModel.errors.name"
                />

            <mms-asset-type-select
                label="Tipologia"
                v-model="assetModel.assetType"
                />

            <adx-d horizontal fit justify="evenly" v-if="assetModel.assetType == 'simple'">
                <adx-d vertical padding="xs">
                    <cmn-measurement-unit-select
                        v-model="assetModel.measurementUnit"
                        :errors="assetModel?.errors.measurementUnit"
                        />
                </adx-d>

                <adx-d vertical padding="xs">
                    <adx-data-input
                        v-model="assetModel.unitQuantity"
                        label="Quantità unitaria"
                        :suffix="assetModel.measurementUnit?.name"
                        :errors="assetModel.errors.unitQuantity"
                        />
                </adx-d>
            </adx-d>

            <mms-checklist-model-select
                label="Modelli di checklist"
                v-model="assetModel.checklistModel"
                :errors="assetModel.errors.checklistModel"
                />

            <adx-d vertical y-spacing="sm">
                <q-checkbox
                    v-model="assetModel.mandatoryChecklist"
                    label="Checklist obbligatoria"
                    :false-value="null"
                    />
            </adx-d>

            <adx-d v-if="showComponentModelPivot">
                <span class="text-subtitle1">Griglia modelli</span>

                <adx-pivot-table
                    :data-set="ds"
                    item-type="MmsAssetModelPivot"
                    row-property="areaModel"
                    column-property="componentModel"
                    row-group-property="rowGroup"
                    :insertion-properties="{ assetModel }"
                    :allow-row-insertion="true"
                    :allow-column-insertion="true"
                    flat
                    dense
                    >
                    <template #column="{ column }">
                        <mms-asset-component-model-select
                            v-model="column.item"
                            label=""
                            dense
                            />
                    </template>

                    <template #row="{ row }">
                        <mms-area-model-select
                            v-model="row.item"
                            label=""
                            dense
                            />
                    </template>

                    <template #pivot="{ pivot, componentModel }">
                        <q-input
                            dense
                            v-model.number="pivot.quantity"
                            type="number"
                            input-class="text-right"
                            :suffix="componentModel.measurementUnit.name"/>
                    </template>
                </adx-pivot-table>
            </adx-d>
        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl, filterObject } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref, computed, reactive } from 'vue';
import MmsAreaModelSelect from '../components/MmsAreaModelSelect.vue'
import MmsAssetComponentModelSelect from '../components/MmsAssetComponentModelSelect.vue'
import MmsAssetTypeSelect from '../components/MmsAssetTypeSelect.vue'
import { CmnMeasurementUnitSelect } from '@adronix/cmn-web'
import MmsChecklistModelSelect from '../components/MmsChecklistModelSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editAssetModel', { id: props.id }))

const assetModel = ds.ref('MmsAssetModel')

const { dialog } = $adx.dialog(
    async () => ({
        status: await ds.commit(),
        payload: unref(assetModel)
    })
)

const showComponentModelPivot = computed(() => assetModel.value?.assetType == 'composite')
</script>
