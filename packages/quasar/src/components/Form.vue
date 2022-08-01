<script setup lang="ts">
import { ServerErrors, useFetch } from '@adronix/client';
import { ref } from 'vue';

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  ( event: 'onSuccess', response: Response ): void
}>()

const errors = ref<ServerErrors>({})

const onSubmit = async (evt: Event | SubmitEvent) => {

  const formData = new FormData(evt.target as HTMLFormElement)
  const fetch = useFetch()

  const r = await fetch.post(props.url, formData)
  if (r.status == 400) {
    errors.value = await r.json()
  }
  else {
    errors.value = {}
    emit('onSuccess', r)
  }
}

defineExpose({
  errors
})
</script>

<template>
  <q-form @submit="onSubmit">
    <slot/>
  </q-form>
</template>