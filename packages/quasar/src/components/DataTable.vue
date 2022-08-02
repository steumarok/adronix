<template>
  <q-table
      :rows="rows"
      :columns="columns"
      :filter="filter"
      row-key="id"
      v-model:pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:top-left>
        <slot name="top-left"></slot>
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
            {{ col.label }}
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
      </template>
      <slot/>
    </q-table>
</template>

<script lang="ts">
import { Columns, } from '@adronix/vue';
import { defineComponent, ref } from 'vue';
import { useQTableHandler } from '../client/Quasar';


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

export default defineComponent({
  name: 'AdxDataTable',
  props: {
    dataBindings: {
      required: true,
      type: null
    },
    filtering: Boolean
  },
  setup(props) {

    const filter = ref(props.dataBindings.params.filter)
    const table = useQTableHandler(props.dataBindings.totalCount, props.dataBindings.params);

    return {
      filtering: props.filtering,
      filter,
      rows: props.dataBindings.rows,
      columns: toQuasarColumns(props.dataBindings.columns),
      ...table
    };
  },
});
</script>
