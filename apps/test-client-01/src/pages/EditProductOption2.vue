<template>
  <adx-dialog @confirm="confirm">

    <adx-data-input
      item="productOption"
      property="name"
      />

    <adx-data-lookup
      item="productOption"
      property="ingredients"
      multiple
      lookupDataSet=""
      />

    <q-input v-if="productOption"
          v-model="productOption['name']"
          label="Nome"
          :error-message="productOption.errors.name && productOption.errors.name[0].message"
          :error="!!productOption.errors.name"/>

  </adx-dialog>
</template>


<script lang="ts">
import { useAdronix, AdxComponents } from '@adronix/vue'
import { defineComponent } from 'vue'

export default defineComponent({
  extends: AdxComponents.AdxDialog,

  props: [ 'id' ],

  setup(props) {
    const $adx = useAdronix()
    const url = $adx.urlComposer('/api/module1/editProductOption')({ id: props.id})
    const ds = $adx.dataSet(url)

    const productOption = ds.ref('TcmProductOption')

    return {
      productOption,
      async confirm ({ ok }) {
        if (await ds.commit()) {
          ok()
        }
      },
    }
  }
})
</script>
