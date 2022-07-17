<template>
  <div class="q-pa-md">
    <q-table
      title="Treats"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      @request="onRequest"
      :hide-pagination="true"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
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
          <q-td auto-width>
            <q-btn size="sm" flat dense @click="edit(props.key)" icon="edit" />
          </q-td>
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.value }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
    {{pagination}}
  </div>
</template>

<script lang="ts">
import { Item, ItemData } from '@adronix/client';
import { GetParams, useDataSet, useUrlComposer, VueDataSet } from '@adronix/vue';
import { computed, isRef, reactive, Ref, ref, unref, watch, watchEffect } from 'vue';
import { useQuasar } from 'quasar';
import EditProductOption from './EditProductOption.vue'


function useQTableHandler(ds: VueDataSet, params: GetParams | null, type: string) {
  const rows =  ds.list('TcmProductOption')
  const totalCount = ds.ref('Metadata', `${type}.totalCount`)
  const pageRef = ref(1)
  const rowsPerPageRef = ref(params?.limit)

  const pagination = ({
    sortBy: 'desc',
    descending: false
  })

  const onRequest = (props: any) => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination

    pageRef.value = page
    rowsPerPageRef.value = rowsPerPage

    if (params) {
      params.page = page
      params.limit = rowsPerPage
    }
  }

  return {
    rows,
    pagination: computed(() => ({
      ...pagination,
      page: pageRef.value,
      rowsPerPage: rowsPerPageRef.value,
      rowsNumber: unref(totalCount)?.value
    })),
    onRequest
  }
}

export default {
  setup () {

    const columns = [
      {
        name: 'name',
        required: true,
        label: 'Name',
        align: 'left',
        field: (row: Item) => row.name,
      }
    ]

    const { url, params } = useUrlComposer(
      ({ table }) => `/api/listProductOption?page=${table.page as string}&limit=${table.limit as string}`, {
        table: {
          page: 1,
          limit: 10
        }
      })

    const h = useQTableHandler(
      useDataSet(url),
      params.table,
      'TcmProductOption')

    const $q = useQuasar()

    return {
      columns,
      edit(key: string) {

        $q.dialog({
          component: EditProductOption,

          // props forwarded to your custom component
          componentProps: {
            id: key,
            // ...more..props...
          }
        }).onOk(() => {
          console.log('OK')
        }).onCancel(() => {
          console.log('Cancel')
        }).onDismiss(() => {
          console.log('Called on OK or Cancel')
        })
      },
      ...h
    }
  }
}
</script>
