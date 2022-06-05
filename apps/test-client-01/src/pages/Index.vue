<template>
  <q-page class="q-pa-md">
    <div class="col">
      <div class="row">
        <q-input v-model="productOption.name" label="name" />
      </div>
      <div class="row">
        <q-btn @click="printDelta">Print delta</q-btn>
        <q-btn @click="printDataSet">Print ds</q-btn>
      </div>
      <div class="row">
        <q-pagination
          v-model="currentPage"
          :max="5"
        />
      </div>
      <div class="row">
        <adronix-inject path="test/Injection1" :props="{ dataSet }" />
      </div>
      <div class="row">
        <q-btn @click="sync">Sync</q-btn>
      </div>
    </div>

  </q-page>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue';
import { VueDataSet } from '@adronix/vue';
import { ItemData } from '@adronix/client';

export default defineComponent({
  name: 'PageIndex',
  components: { },
  setup() {

    const productOption = ref({ingredients:[]} as any)
    const dataSet = new VueDataSet()

    const currentPage = ref(1)

    onBeforeMount(async () => {
      await refresh()
    })

    const refresh = async () => {
      const resp = await fetch(`http://localhost:3001/editProductOption/1?page=${currentPage.value}`)
      const data = await resp.json() as ItemData[]

      dataSet.merge(data)

      productOption.value = dataSet.query('TcmProductOption', 1).reactive().single()
    }

    watch(currentPage, async () => {
      await refresh()
    })

    return {
      productOption,
      dataSet,
      currentPage,
      printDelta: () => {
        console.log(dataSet.getDelta())
      },
      printDataSet: () => {
        console.log(dataSet)
      },
      sync: async () => {

        await dataSet.sync(async delta => {
          let resp = await fetch('http://localhost:3001/editProductOption/1', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(delta)
          })
          return await resp.json() as ItemData[]
        })

      }
    };
  },
});
</script>
