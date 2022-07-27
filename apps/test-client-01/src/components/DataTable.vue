<template>
  <q-table
      title="Treats"
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
import { useQTableHandler } from '@adronix/quasar';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CompositionComponent',
  props: {
    data: {
      required: true,
      type: null
    },
    columns: {
      required: true,
      type: null
    },
    params: {
      required: true,
      type: null
    },
  },
  setup(props) {

    const table = useQTableHandler(props.data.totalCount, props.params);

    return {
      rows: props.data.rows,
      ...table
    };
  },
});
</script>
