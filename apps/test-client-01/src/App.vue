<template>
  <router-view />
</template>
<script lang="ts">
import { AdronixPlugin } from '@adronix/vue';
import 'reflect-metadata';
import { defineComponent } from 'vue';
import Injection1 from './injections/test/Injection1.vue'

AdronixPlugin.registerInjection('test/Injection1', Injection1)

export default defineComponent({
  name: 'App',
});
</script>
