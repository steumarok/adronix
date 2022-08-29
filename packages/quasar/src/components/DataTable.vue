<template>
  <q-table
      :rows="rows"
      :columns="columns"
      :filter="filter"
      row-key="id"
      v-model:pagination="pagination"
      :hide-bottom="pagination.rowsNumber === undefined"
      @request="onRequest"
    >
      <template v-slot:top-left v-if="Object.keys($slots).filter(name => name == 'top-left').length != 0">
        <slot name="top-left" />
      </template>

      <template v-slot:top-right v-if="filtering">
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Cerca">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <slot :name="`${col.name}Header`">{{ col.label }}</slot>
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <slot :name="col.name" :row="props.row">{{ col.value }}</slot>
          </q-td>
        </q-tr>
        <slot name="row-content" :row="props.row" />
      </template>

      <slot/>
    </q-table>
</template>

<script setup lang="ts">
import { Columns, } from '@adronix/vue';
import { defineComponent, ref, computed, toRefs, unref } from 'vue';


function toQuasarColumns(columns: Columns): any {
  return Array.from(
    new Map(Object.entries(columns)),
      ([name, value]) => ({
          name,
          label: value.label,
          field: value.field,
          sortable: value.sortable,
          align: value.align || 'left',
          style: `${value.width ? 'width: ' + value.width : ''}`,
        }))
}
const props = defineProps({
  dataBindings: {
      required: true,
      type: null
  },
  filtering: Boolean
})

const filter = ref(props.dataBindings.params.filter)

const onRequest = (p: any) => {
    const { page, rowsPerPage, sortBy, descending } = p.pagination
    const filter = p.filter

    props.dataBindings.params.sortBy = sortBy
    props.dataBindings.params.descending = descending
    props.dataBindings.params.filter = filter
    props.dataBindings.params.page = page
    props.dataBindings.params.limit = rowsPerPage
}


const pagination = computed({
  get() {
    const paginated = props.dataBindings.totalCount?.value?.value

    const pagintion_ = paginated
      ? {
          page: props.dataBindings.params.page,
          rowsNumber: props.dataBindings.totalCount.value?.value,
          rowsPerPage: props.dataBindings.params.limit
        }
      : { }

    return {
      sortBy: props.dataBindings.params.sortBy,
      descending: props.dataBindings.params.descending,
      ...pagintion_
    }
  },
  set(value) {
    props.dataBindings.params.sortBy = value.sortBy
    props.dataBindings.params.descending = value.descending
  }
})

const { filtering } = toRefs(props)

const columns = computed(() => toQuasarColumns(props.dataBindings.columns))
const rows = props.dataBindings.rows

</script>
