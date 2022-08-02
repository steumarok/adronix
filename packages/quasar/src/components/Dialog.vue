<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <slot/>
      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn color="primary" label="Annulla" @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>


<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'

defineEmits({
  ...useDialogPluginComponent.emitsObject
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const okHandler = ref(() => Promise.resolve(true))
const cancelHandler = ref(() => Promise.resolve(true))

async function onOKClick () {
  const result = await okHandler.value()
  if (result) {
    onDialogOK()
  }
}

async function onCancelClick () {
  const result = await cancelHandler.value()
  if (result) {
    onDialogCancel()
  }
}

defineExpose({
  setCloseHandler: function (onOk: () => Promise<boolean>, onCancel: () => Promise<boolean>) {
    okHandler.value = onOk
    cancelHandler.value = onCancel
  }
})

</script>
