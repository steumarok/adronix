<template>
    <adx-dialog ref="dialog" title="Modello di asset" :loading="!assetModel" style="min-width: 80vw">

        <adx-d vertical y-spacing="sm">
            <adx-data-input
                v-model="assetModel.name"
                label="Name"
                outlined
                :errors="assetModel.errors.name"
                />

            <adx-pivot-table
                :data-set="ds"
                item-type="MmsAssetModelPivot"
                row-property="areaModel"
                column-property="componentModel"
                :insertionProperties="{ assetModel }"
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
                    <q-input dense v-model.number="pivot.quantity"
                        type="number" input-class="text-right"
                        :suffix="componentModel.measurementUnit.name"/>
                </template>
            </adx-pivot-table>
        </adx-d>

    </adx-dialog>
</template>


<script setup lang="ts">
import { buildUrl, filterObject } from '@adronix/client';
import { useAdronix } from '@adronix/vue'
import { unref, computed, reactive } from 'vue';
import MmsAreaModelSelect from '../components/MmsAreaModelSelect.vue'
import MmsAssetComponentModelSelect from '../components/MmsAssetComponentModelSelect.vue'

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
</script>
