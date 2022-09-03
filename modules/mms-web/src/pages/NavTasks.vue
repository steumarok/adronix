<script setup lang="ts">
import NavHome from './NavHome.vue'
import { VueDataSet } from '@adronix/client';
import { useNavigationStore } from '../store/navigation'
import { useRoute } from 'vue-router';
import { unref, computed } from 'vue';
import { storeToRefs } from 'pinia'

const navStore = useNavigationStore()
const { taskFilter } = storeToRefs(navStore)

const to = {
    name: 'tasks',
    params: {
        workOrderId: taskFilter.value.workOrder.id,
        clientId: taskFilter.value.client.id
    }
}
</script>

<template>
    <nav-home>
        <q-breadcrumbs-el :to="to">
            Attività
            <span v-if="taskFilter.workOrder.ref">&nbsp;in {{taskFilter.workOrder.ref.code}}</span>
            <span v-if="taskFilter.client.ref">&per {{taskFilter.client.ref.name}}</span>
        </q-breadcrumbs-el>
        <slot />
    </nav-home>
</template>