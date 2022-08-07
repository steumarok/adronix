<template>
    <adx-dialog ref="dialog" title="Schedulazione" style="min-width: 80vw" :loading="!scheduling">

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-task-model-select
                    v-model="scheduling.taskModel"
                    :errors="scheduling?.errors.taskModel"
                />
            </adx-d>
            <adx-d vertical padding="xs">
                <mms-asset-model-select
                    v-model="scheduling.assetModels"
                    :errors="scheduling?.errors.assetModels"
                    clearable
                    multiple
                    />

            </adx-d>
            <adx-d vertical padding="xs">
                <mms-asset-attribute-select
                    v-model="scheduling.assetAttributes"
                    multiple
                    clearable
                    />
            </adx-d>
        </adx-d>

        <adx-d horizontal fit justify="evenly">
            <adx-d vertical padding="xs">
                <mms-area-model-select
                    v-model="scheduling.areaModels"
                    :errors="scheduling?.errors.areaModels"
                    clearable
                    multiple
                    />

            </adx-d>

            <adx-d vertical padding="xs">
                <mms-task-model-select
                    v-model="scheduling.startFromLasts"
                    :errors="scheduling?.errors.startFromLasts"
                    label="Dopo"
                    multiple
                />
            </adx-d>

            <adx-d vertical padding="xs">
                <adx-data-input
                    v-model="scheduling.every"
                    label="Ricorrenza"
                    :errors="scheduling.errors.every"
                    prefix="Ogni"
                >
                    <template #after>
                        <mms-scheduling-unit-select
                            outline
                            v-model="scheduling.unit"
                            :errors="scheduling?.errors.unit"
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
import MmsAreaModelSelect from '../components/MmsAreaModelSelect.vue'
import MmsAssetModelSelect from '../components/MmsAssetModelSelect.vue'
import MmsTaskModelSelect from '../components/MmsTaskModelSelect.vue'
import MmsPartSelect from '../components/MmsPartSelect.vue'
import MmsAssetAttributeSelect from '../components/MmsAssetAttributeSelect.vue'
import MmsSchedulingUnitSelect from '../components/MmsSchedulingUnitSelect.vue'

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const ds = $adx.dataSet(buildUrl('/api/mms/editScheduling', { id: props.id}))

const scheduling = ds.ref('MmsScheduling')

const { dialog } = $adx.dialog(() => ds.commit())
</script>
