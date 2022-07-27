<template>
  <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      @request="onRequest"
    >
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
    </q-table>
</template>

<script lang="ts">
import { Columns, } from '@adronix/vue';
import { defineComponent } from 'vue';
import { useQTableHandler } from '../client/Quasar';


function toQuasarColumns(columns: Columns): any {
  return Array.from(
    new Map(Object.entries(columns)),
    ([name, value]) => ({ name, label: value.label, field: value.field }))
}

export default defineComponent({
  name: 'AdxDataTable',
  props: {
    dataBindings: {
      required: true,
      type: null
    }
  },
  setup(props) {

    const table = useQTableHandler(props.dataBindings.totalCount, props.dataBindings.params);

    return {
      rows: props.dataBindings.rows,
      columns: toQuasarColumns(props.dataBindings.columns),
      ...table
    };
  },
});
</script>
