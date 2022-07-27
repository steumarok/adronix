<template>
  <q-page class="q-pa-md">
    <q-form @submit="submit" >
      <div class="col">
        <div class="row">
          <q-input v-model="username" label="name" name="username" />
        </div>

        <div class="row">
          <q-btn type="submit">Sync</q-btn>
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

    const username = ref('')
    return {
      username,
      submit: async (evt: { target: HTMLFormElement; }) => {

        const formData = new FormData(evt.target)
        const fetch = useFetch()

       await  fetch.post('/api/module2/login', formData)
      }
    };
  },
});
</script>
