<template>
  <div class="q-pa-md">

    <adx-data-table
      :data-bindings='dataBindings'
    >
      <template #actions="{ row }">
        <q-btn icon="edit" flat size="sm" @click="edit(row.id)"/>
      </template>
    </adx-data-table>

    <q-btn @click="insert">Nuovo</q-btn>
  </div>
</template>

<script lang="ts">
import { useAdronix } from '@adronix/vue';
import { Item } from '@adronix/client';
import EditProductOption2 from './EditProductOption2.vue'


export default {
    setup() {

      function getNameExt(row: Item) {
        const ext = ds.query("TcaProductOptionExt", item => (item.productOption as Item)?.id == row.id).single();
        return ext?.nameExt as string;
      }

      const $adx = useAdronix()

      const urlComposer = $adx.urlComposer('/api/module1/listProductOption')
      const dataTable = $adx.dataTable(
        'TcmProductOption',
        {
          actions:  { label: 'Azioni' },
          name:     { label: 'Nome',      field: (row: Item) => row.name },
          nameExt:  { label: 'Nome ext',  field: getNameExt },
        })

      const ds = $adx.dataSet(urlComposer(dataTable.params));
/*
      const dt = dataTable.bind('/api/module1/listProductOption')

      const dataTable = $adx.dataTable(
        'TcmProductOption',
        {
          actions:  { label: 'Azioni' },
          name:     { label: 'Nome',      field: (row: Item) => row.name },
          nameExt:  { label: 'Nome ext',  field: getNameExt },
        })*/



        return {
            insert() {
                $adx.dialog(EditProductOption2)
            },
            async del(key: string) {
                const item = ds.query("TcmProductOption", key).single();
                if (item) {
                    ds.delete(item);
                    try {
                        await ds.commit();
                    }
                    catch (e) {
                        alert(e);
                    }
                }
            },
            edit(key: string) {

                $adx.dialog(EditProductOption2, { id: key })

            },
            dataBindings: dataTable.bind(ds)
        };
    }
}
</script>
