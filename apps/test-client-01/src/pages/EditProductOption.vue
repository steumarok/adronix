<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <q-input v-if="productOption"
          v-model="productOption.name"
          label="Nome"
          :error-message="productOption.errors.name && productOption.errors.name[0].message"
          :error="!!productOption.errors.name"/>

        <adronix-inject path="test/EditProductOptionExt" :props="{ ds }" />
      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn color="primary" label="Refresh" @click="onRefresh" />
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn color="primary" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { onMounted, onUnmounted } from 'vue'
import { GetParams, useDataSet, useUrlComposer, VueDataSet } from '@adronix/vue';

const props = defineProps({
  id: Number
})

const ds = useDataSet(`/api/editProductOption?id=${props.id || ''}`)

const productOption = ds.ref('TcmProductOption')

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onRefresh() {
 // productOption.value.name = "prova"
}


async function onOKClick () {
  if (await ds.commit()) {
    onDialogOK()
  }

  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  //
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
