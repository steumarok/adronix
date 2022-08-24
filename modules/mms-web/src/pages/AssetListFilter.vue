<script setup lang="ts">
import { VueDataSet } from '@adronix/client';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '../store/navigation'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const navStore = useNavigationStore()

const { assetFilter } = storeToRefs(navStore)

function removeFilter(item: string) {
    navStore.clearAssetFilter(item)
}

</script>
<template>
    <q-chip removable @remove="removeFilter('client')" color="secondary" text-color="white" class="q-ml-xl"
        v-if="assetFilter.client.ref">
        <span v-if="assetFilter.client.ref">Cliente: {{assetFilter.client.ref.name}}</span>
    </q-chip>

    <q-chip removable @remove="removeFilter('clientLocation')" color="secondary" text-color="white" class="q-ml-xl"
        v-if="assetFilter.clientLocation.ref">
        <span v-if="assetFilter.clientLocation.ref">Sede: {{assetFilter.clientLocation.ref.address}} - {{assetFilter.clientLocation.ref.locality?.name}}</span>
    </q-chip>
</template>