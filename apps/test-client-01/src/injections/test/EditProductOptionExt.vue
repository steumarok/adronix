<template>
  <q-input v-if="productOptionExt" v-model="productOptionExt.nameExt" label="name" />
</template>

<script lang="ts">
import { DataSet, Item } from '@adronix/client';
import { VueDataSet } from '@adronix/vue';
import { computed, defineComponent, onBeforeMount, onBeforeUpdate, onMounted, PropType, ref } from 'vue';

export default defineComponent({
  name: 'CompositionComponent',
  props: {
    ds: {
      type: VueDataSet
    }
  },
  setup(props) {

    const productOptionExt = props.ds!.ref('TcaProductOptionExt')

/*
    const filter = (ext: Item) => {
      console.log((ext.productOption as Item).id == "1")
      return (ext.productOption as Item).id == "1"
    }

    const productOptions = props.dataSet!
      .query('TcaProductOptionExt', filter).reactive().list()*/

    return {
      productOptionExt
      /*productOptionExt: computed(() => productOptions.length > 0 ? productOptions[0] : {}),
      click: () => {
          return props
      }*/
    };
  },
});
</script>
