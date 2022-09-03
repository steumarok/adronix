<script setup lang="ts">
import { VueDataSet } from '@adronix/client';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '../store/navigation'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const navStore = useNavigationStore()

const { taskFilter } = storeToRefs(navStore)

function removeFilter(item: string) {
    navStore.clearTaskFilter(item)
}

</script>
<template>
    <q-chip removable @remove="removeFilter('client')" color="secondary" text-color="white" class="q-ml-xl"
        v-if="taskFilter.client.ref">
        <span v-if="taskFilter.client.ref">Cliente: {{taskFilter.client.ref.name}}</span>
    </q-chip>

</template>