<template>
  <router-view />
</template>
<script lang="ts">
import { AdronixPlugin } from '@adronix/vue';
import 'reflect-metadata';
import { defineComponent } from 'vue';
import Injection1 from './injections/test/Injection1.vue'
import EditProductOptionExt from './injections/test/EditProductOptionExt.vue'
import { setAuthTokens } from '@adronix/client';

AdronixPlugin.registerInjection('test/Injection1', Injection1)
AdronixPlugin.registerInjection('test/EditProductOptionExt', EditProductOptionExt)

setAuthTokens('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.hECuVJ9UX81-8wSA5L7GAZKoX6SLxLLuyihNGyUeIjo')

export default defineComponent({
  name: 'App',
});
</script>
