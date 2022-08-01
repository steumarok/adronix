<template>
  <router-view />
</template>
<script lang="ts">
import { AdronixPlugin } from '@adronix/vue';
import 'reflect-metadata';
import { defineComponent } from 'vue';
import Injection1 from './injections/test/Injection1.vue'
import EditProductOptionExt from './injections/test/EditProductOptionExt.vue'
import { setAuthToken, setResponseHandler } from '@adronix/client';

setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0ZWZhbm8ubWFyb2Njb0BnbWFpbC5jb20iLCJpYXQiOjE2NTkzODAwMjN9.7U5GPLyxi1Ump6aAr7NP-X4wJKyDjPdFRTap63wZi3o')

setResponseHandler(async resp => {
  if (resp.status == 401) {
    location.href = "/"
  }
  else if (resp.status == 500) {
    const error = await resp.text()
    alert(error)
    throw new Error(error)
  }
})

AdronixPlugin.registerInjection('test/Injection1', Injection1)
AdronixPlugin.registerInjection('test/EditProductOptionExt', EditProductOptionExt)

export default defineComponent({
  name: 'App',
});
</script>
