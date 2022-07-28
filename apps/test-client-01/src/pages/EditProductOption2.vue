<template>
  <adx-dialog ref="dialog">

    <adx-input
      v-if="productOption"
      v-model="productOption.name"
      />

    <adx-select
      item="productOption"
      property="ingredients"
      multiple
      lookupDataSet=""
      />
<!--
    <q-input v-if="productOption"
      v-model="productOption.name"
      label="Nome"
      :error-message="productOption.errors.name && productOption.errors.name[0].message"
      :error="!!productOption.errors.name"/>
-->
  </adx-dialog>
</template>


<script setup lang="ts">
import { useAdronix } from '@adronix/vue'
import { Item } from '@adronix/client';
import { onMounted, Ref, ref, watch } from 'vue';
import { ItemProp } from 'app/../../packages/client/src/client/types';

const props = defineProps({
  id: Number
})

const $adx = useAdronix()
const url = $adx.urlComposer('/api/module1/editProductOption')({ id: props.id})
const ds = $adx.dataSet(url)

const productOption = ds.ref('TcmProductOption')

/*
function adapt(): Ref<string> {
  return ref("k")
}
const y: Ref<string> = ref("s")

const x = ref<Item>()
onMounted(() => {
console.log(productOption)
  watch(productOption, (value) => {
  x.value = new Proxy<Item>(value as Item, {
    get(target, name, receiver) {
      let rv = Reflect.get(target, name, receiver);
      if (typeof rv === "string") {
        rv = rv.toUpperCase();
      }
      return rv as string;
    },
    set(target, name, value, receiver) {
      return Reflect.set(target, name, value as string, receiver);
    }
  });
  })
})*/

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)
</script>
