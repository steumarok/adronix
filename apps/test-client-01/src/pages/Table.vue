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
            <q-btn size="sm" flat dense @click="del(props.key)" icon="delete" />
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
    <q-btn @click="insert">Nuovo</q-btn>
  </div>
</template>

<script lang="ts">
import { useQTableHandler } from '@adronix/quasar';
import { Item, ItemData } from '@adronix/client';
import { useDataSet, useUrlComposer } from '@adronix/vue';
import { useQuasar } from 'quasar';
import EditProductOption from './EditProductOption.vue'



export default {
  setup () {

    const { url, params } = useUrlComposer(
      ({ table }) => `/api/module1/listProductOption?page=${table.page as string}&limit=${table.limit as string}`, {
        table: {
          page: 1,
          limit: 10
        }
      })

    const ds = useDataSet(url)

    const columns = [
      {
        name: 'name',
        required: true,
        label: 'Name',
        align: 'left',
        field: (row: Item) => row.name,
      },
      {
        name: 'nameExt',
        label: 'Name ext',
        align: 'left',
        field: (row: Item) => {
          const ext = ds.query('TcaProductOptionExt', item => (item.productOption as Item)?.id == row.id).single()
          return ext?.nameExt
        }
      }
    ]

    const table = useQTableHandler(
      ds,
      params.table,
      'TcmProductOption')

    const $q = useQuasar()

    return {
      columns,
      insert() {
        $q.dialog({
          component: EditProductOption
        })
      },
      async del(key: string) {
        const item = ds.query('TcmProductOption', key).single()
        if (item) {
          ds.delete(item)
          try {
            await ds.commit()
          } catch (e) {
            alert(e)
          }
        }
      },
      edit(key: string) {
        $q.dialog({
          component: EditProductOption,
          componentProps: {
            id: key,
          }
        })
      },
      ...table
    }
  }
}
</script>
