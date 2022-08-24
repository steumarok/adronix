<script setup lang="ts">
import NavHome from './NavHome.vue'
import { VueDataSet } from '@adronix/client';
import { useNavigationStore } from '../store/navigation'
import { useRoute } from 'vue-router';
import { unref, computed } from 'vue';
import { storeToRefs } from 'pinia'

const navStore = useNavigationStore()
const { assetFilter } = storeToRefs(navStore)

const to = {
    name: 'assets',
    params: {
        clientId: assetFilter.value.client.id,
        clientLocationId: assetFilter.value.clientLocation.id
    }
}
</script>

<template>
    <nav-home>
        <q-breadcrumbs-el :to="to">
            Assets
            <span v-if="assetFilter.clientLocation.ref">&nbsp;in {{assetFilter.clientLocation.ref.address}} - {{assetFilter.clientLocation.ref.locality?.name}}</span>
            <span v-if="assetFilter.client.ref">&nbsp;di {{assetFilter.client.ref.name}}</span>
        </q-breadcrumbs-el>
        <slot />
    </nav-home>
</template>