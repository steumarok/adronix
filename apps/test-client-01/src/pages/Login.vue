<template>
  <q-page class="q-pa-md">
    <q-form @submit="submit" class="window-height">

      <adx-cont horizonal>
        <adx-col>

        </adx-col>
      </adx-cont>

      <div class="fit row wrap justify-center content-center">
        <div class="q-ma-xs q-gutter-sm" style="width: 300px">
          <div class="full-width">
            <q-input v-model="username" label="Email" name="username" outlined />
            </div>
          <div class="full-width">
            <q-input v-model="username" type="password" label="Password" name="password" outlined />
            </div>

          <div class="full-width">
            <q-btn type="submit" unelevated color="primary">Sync</q-btn>
            </div>
        </div>

      </div>
    </q-form>

  </q-page>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue';
import { VueDataSet } from '@adronix/vue';
import { ItemData, useFetch } from '@adronix/client';

export default defineComponent({
  name: 'Form',
  components: { },
  setup() {

    const username = ref(null)
    return {
      username,
      submit: async (evt: { target: HTMLFormElement; }) => {

        const formData = new FormData(evt.target)
        const fetch = useFetch()

       await  fetch.post('/api/auth/login', formData)
      }
    };
  },
});
</script>
