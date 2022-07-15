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
            <q-btn size="sm" flat dense @click="edit(props)" icon="edit" />
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
import { VueDataSet } from '@adronix/vue';
import { computed, isRef, reactive, Ref, ref, unref, watch, watchEffect } from 'vue';

type GetParams = {
  [name: string]: any
}
/*function useDataSet1(get: (a: x) => String, params: x ) {

}*/

//useDataSet1(p => `${p.prova}`, {prova: '1'})

function useUrlComposer(
  composer: (params: GetParams) => string,
  initParams: GetParams) {
  const url = ref(composer(initParams))
  const params = reactive(initParams)

  watch(params, (newParams) => {
    url.value = composer(newParams)
  })

  return {
    url,
    params
  }
}

type IDataBroker = {
  get(url: string): Promise<Response>
}

function useFetch(): IDataBroker {
  return {
    get: (url) => fetch(url)
  }
}

function useDataSet(url: string | Ref<string>, dataBroker: IDataBroker = useFetch()) {
  const dataSet = new VueDataSet()

  function doFetch() {
    dataBroker.get(unref(url))
      .then((res) => res.json())
      .then(json => json as ItemData[])
      .then(data => dataSet.merge(data))
      .catch((err) => alert(err))
  }

   if (isRef(url)) {
    // setup reactive re-fetch if input URL is a ref
    watchEffect(doFetch)
  } else {
    // otherwise, just fetch once
    // and avoid the overhead of a watcher
    void doFetch()
  }

  return dataSet
}

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
      params => `/api/listProductOption?page=${params.table.page as string}&limit=${params.table.limit as string}`, {
        table: {
          page: 1,
          limit: 10
        }
      })

    const h = useQTableHandler(
      useDataSet(url),
      params.table,
      'TcmProductOption')

    return {
      columns,
      edit(props) {
        console.log(props)
      },
      ...h
    }
  }
}
</script>
