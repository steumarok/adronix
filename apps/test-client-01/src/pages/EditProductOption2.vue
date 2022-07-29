<template>
  <adx-dialog ref="dialog">

    <adx-input
      v-if="productOption"
      v-model="productOption.name"
      label="Name"
      :errors="productOption.errors.name"
      />

    <adx-input
      v-if="productOption"
      v-model="productOption.quantity"
      label="Quantity"
      />

    <adx-select
      v-if="productOption"
      v-model="productOption.ingredients"
      multiple
      label="Ingredients"
      :lookup-dataSet="dsIngredients"
      lookup-type="TcmIngredient"
      lookup-display-property="name"
      />

    <adx-select
      v-if="productOption"
      v-model="productOption.shop"
      label="Shops"
      :lookup-dataSet="dsShops"
      lookup-type="TcmShop"
      lookup-display-property="name"
      clearable
      />
<!--
    <q-input v-if="productOption"
      v-model="productOption.name"
      label="Nome"
      :error-message="productOption.errors.name && productOption.errors.name[0].message"
      :error="!!productOption.errors.name"/>
-->
<q-btn @click="showContent">content</q-btn>
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

const dsIngredients = $adx.dataSet('/api/module1/lookupIngredients')
const dsShops = $adx.dataSet('/api/module1/lookupShops')

const { dialog } = $adx.dialog(
  () => { return ds.commit() }
)



function showContent() {
  console.log(ds.getDelta())
}
</script>
