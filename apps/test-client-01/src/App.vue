<template>
  <router-view />
</template>
<script lang="ts">
import { AdronixPlugin } from '@adronix/vue';
import 'reflect-metadata';
import { defineComponent } from 'vue';
import Injection1 from './injections/test/Injection1.vue'
import EditProductOptionExt from './injections/test/EditProductOptionExt.vue'

AdronixPlugin.registerInjection('test/Injection1', Injection1)
AdronixPlugin.registerInjection('test/EditProductOptionExt', EditProductOptionExt)

export default defineComponent({
  name: 'App',
});
</script>
