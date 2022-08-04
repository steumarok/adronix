<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" >
    <q-card class="q-dialog-plugin" :style="style">

      <q-card-section class="row items-center">
          <div class="text-h6">{{title}}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section style="min-height: 120px">
        <loading :show="loading">
          <slot v-if="!loading"/>
        </loading>
      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" unelevated/>
        <q-btn color="primary" label="Annulla" @click="onCancelClick" unelevated/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>


<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref, toRefs } from 'vue'
import Loading from './Loading.vue'

defineEmits({
  ...useDialogPluginComponent.emitsObject
})

const props = defineProps({
  title: String,
  style: String,
  loading: Boolean
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const okHandler = ref<(() => Promise<boolean | { status: boolean, payload: any }>)>(() => Promise.resolve(true))
const cancelHandler = ref(() => Promise.resolve(true))

async function onOKClick () {
  const result = await okHandler.value()
  const status = (typeof result == 'boolean') ? result : result.status
  const payload = (typeof result == 'boolean') ? undefined : result.payload
  if (status) {
    onDialogOK(payload)
  }
}

async function onCancelClick () {
  const result = await cancelHandler.value()
  if (result) {
    onDialogCancel()
  }
}

defineExpose({
  setCloseHandler: function (onOk: () => Promise<boolean | { status: boolean, payload: any}>, onCancel: () => Promise<boolean>) {
    okHandler.value = onOk
    cancelHandler.value = onCancel
  }
})

const { title, style, loading } = toRefs(props)
</script>
