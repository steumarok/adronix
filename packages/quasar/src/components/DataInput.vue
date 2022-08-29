<script setup lang="ts">
import { Error } from '@adronix/base';
import { ItemProp, ServerError } from '@adronix/client';
import { computed, ref } from 'vue'
import { DateTime } from 'luxon'

const props = defineProps<{
  modelValue: ItemProp,
  errors: ServerError[],
  dataType: string
}>()
const emit = defineEmits(['update:modelValue'])

const dateFormat = {
  'date': {
    ...DateTime.DATE_SHORT,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  },
  'datetime': {
    ...DateTime.DATETIME_SHORT,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
}

const dateToISO = {
  'date': (dt) => dt.toISODate(),
  'datetime': (dt) => dt.toISO()
}

function format(value) {
  if (props.dataType == 'date' ||
      props.dataType == 'datetime') {
    const dt = DateTime.fromISO(value)
    return dt.isValid ? dt.toLocaleString(dateFormat[props.dataType]) : value
  }
  else {
    return value as string
  }
}

function parse(value) {
  if (props.dataType == 'date' ||
      props.dataType == 'datetime') {
    const dt = DateTime.fromFormat(value, getParseFormat())
    return dt.isValid ? dateToISO[props.dataType](dt) : value
  }
  else {
    return value
  }
}

const value = computed({
  get() {
    return format(props.modelValue)
  },
  set(value) {
    emit('update:modelValue', parse(value))
  }
})

function getParseFormat() {
  const dt = DateTime.local(2021, 3, 10, 11, 30)
  const res = dt.toLocaleString(dateFormat[props.dataType])
  return res
    .replace("2021", "yyyy")
    .replace("03", "MM")
    .replace("10", "dd")
    .replace("11", "HH")
    .replace("30", "mm")
}

const mask = computed(() => {
  if (props.dataType == 'date' ||
      props.dataType == 'datetime') {
    const dt = DateTime.local(2021, 3, 10, 11, 30)
    const res = dt.toLocaleString(dateFormat[props.dataType])
    return res.replace(/(\d)/g, '#')
  }
})

const errorMessage = computed(() => props.errors ? props.errors.map(error => error.message).join(', ') : '')
</script>

<template>
  <q-input
    v-model="value"
    :mask="mask"
    fill-mask
    :hide-bottom-space="true"
    :error-message="errorMessage"
    :error="!!errorMessage.length">
    <template v-for="(_, name) in $slots" :slot="name">
      <slot :name="name"/>
    </template>
  </q-input>
</template>