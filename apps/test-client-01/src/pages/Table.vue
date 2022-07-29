<template>
  <div class="q-pa-md">

    <adx-data-table
      :data-bindings='dataBindings'
    >
      <template #actions="{ row }">
        <q-btn icon="edit" flat size="sm" @click="onEdit(row.id)"/>
        <q-btn icon="delete" flat size="sm" @click="onDelete(row.id)"/>
      </template>
    </adx-data-table>

    <q-btn @click="insert">Nuovo</q-btn>
  </div>
</template>

<script setup lang="ts">
import { useAdronix } from '@adronix/vue';
import { Item } from '@adronix/client';
import EditProductOption2 from './EditProductOption2.vue'


function getNameExt(row: Item) {
  const ext = ds.query("TcaProductOptionExt", item => (item.productOption as Item)?.id == row.id).single();
  return ext?.nameExt as string;
}

const $adx = useAdronix()


const urlComposer = $adx.urlComposer('/api/module1/listProductOption')
const dataTable = $adx.dataTable(
  'TcmProductOption',
  {
    actions:      { label: 'Azioni' },
    name:         { label: 'Nome',        field: (row: Item) => row.name },
    nameExt:      { label: 'Nome ext',    field: getNameExt },
    shop:         { label: 'Shop',        field: (row: Item) => (row.shop as Item)?.name },
    ingredients:  { label: 'Ingredients', field: (row: Item) => (ds.join(row, 'TcmProductOptionExtra', 'productOption')?.ingredientNames as []).join(', ') },
  })

const ds = $adx.dataSet(urlComposer(dataTable.params));

function insert() {
    $adx.openDialog(EditProductOption2)
}

async function onDelete(key: string) {
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
}

function onEdit(key: string) {
  $adx.openDialog(EditProductOption2, { id: key })
}

const dataBindings = dataTable.bind(ds)

</script>
