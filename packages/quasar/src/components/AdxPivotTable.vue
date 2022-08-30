<template>
  <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :hide-bottom="true"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th></q-th>
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <slot name="column" :column="columnItemMap[col.name]"></slot>
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td>
            <slot name="row" :row="rowItemMap[getRowGroup(props.row)]"></slot>
          </q-td>
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >

            <slot name="pivot"
                :pivot="data[getRowGroup(props.row)][col.name]"
                :[rowProperty]="rowItemMap[getRowGroup(props.row)].item"
                :[columnProperty]="columnItemMap[col.name].item"
                v-if="isPivotEnabled(getRowGroup(props.row), col.name)"></slot>
          </q-td>
        </q-tr>
      </template>
    </q-table>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import { groupBy, groupByAndMap } from '@adronix/client'
import { diff } from 'deep-object-diff'
import { Item, ItemFilter } from '@adronix/client'

const props = defineProps<{
  dataSet: VueDataSet,
  itemType: string,
  itemFilter: ItemFilter,
  rowProperty: string,
  rowGroupProperty: string,
  columnProperty: string,
  allowRowInsertion: boolean,
  allowColumnInsertion: boolean,
  insertionProperties: { [key: string]: ItemProp }
}>()

const { rowProperty, columnProperty, rowGroupProperty } = props
const rowItemMap = reactive({})
const columnItemMap = reactive({})
const data = reactive({})

const items = props.dataSet.list(props.itemType, props.itemFilter || (() => true))

function checkItem(rowGroup, index, rowItem, colItem, pivot) {
    if (!(pivot instanceof Item)) {
        if (Object.keys(pivot).length > 0) {
            props.dataSet.insert(
                props.itemType, {
                    ...pivot,
                    ...props.insertionProperties || { },
                    rowGroup: parseInt(rowGroup),
                    [columnProperty]: colItem,
                    [rowProperty]: rowItem
                })
        }
    }
}

function getRowGroup(item) {
    return rowGroupProperty ? item[rowGroupProperty] : item.id
}

function calcNextRowGroup(items) {
    return Math.max(...items.map(item => getRowGroup(item)).concat([0])) + 1
}


watch(items, () => {

    const nextRowGroup = calcNextRowGroup(items)

    const rows = Object.fromEntries(
        Array.from(groupBy(
            items,
            item => getRowGroup(item))
        )
        .map(elem => [elem[0], { item: elem[1][0][rowProperty] }])
        .concat(props.allowRowInsertion ? [ [ nextRowGroup, { item: null } ] ] : [])
    )

    const group = Array.from(
        groupBy(
            items,
            item => item[columnProperty]))

    const columns = Object.fromEntries(
        group
            .map((items, index) => [index + 1, { item: items[0] }])
            .concat(props.allowColumnInsertion ? [[ group.length + 1, { item: null } ]] : [])
    )

    for (const rowGroup in rows) {
        if (!data[rowGroup]) {
            data[rowGroup] = {}
        }
        for (const index in columns) {
            const colItem = columns[index].item

            const item = props.dataSet.findItem(
                props.itemType,
                (item) => getRowGroup(item) == rowGroup && item[columnProperty]?.id == colItem?.id)

            if (!data[rowGroup][index]) {
                if (item) {
                    data[rowGroup][index] = item
                }
                else {
                    data[rowGroup][index] = { }
                }
            }
        }
    }

    Object.assign(rowItemMap, rows)
    Object.assign(columnItemMap, columns)
}, {
    immediate: true
})


watch(rowItemMap, () => {
    for (const rowGroup in rowItemMap) {
        props.dataSet.filterItems(props.itemType, (item) => getRowGroup(item) == rowGroup)
            .forEach(item => {
                if (item[rowProperty].id != rowItemMap[rowGroup].item.id) {
                    props.dataSet.update(item, { [rowProperty]: rowItemMap[rowGroup].item })
                }
            })
    }
})

watch(columnItemMap, () => {
    for (const index in columnItemMap) {
        const column = columns.value.find(c => c.name == index)
        if (column.items) {
            column.items
                .forEach((item) => {
                    if (item[columnProperty].id != columnItemMap[index].item.id) {
                        props.dataSet.update(item, { [columnProperty]: columnItemMap[index].item })
                    }
                })
        }
    }
})

watch(data, (newValue, oldValue) => {

    for (const rowGroup in newValue) {
        for (const index in newValue[rowGroup]) {
            const pivot = newValue[rowGroup][index]
            const rowItem = rowItemMap[rowGroup]?.item
            const colItem = columnItemMap[index]?.item
            if (rowItem && colItem) {
                checkItem(rowGroup, index, rowItem, colItem, pivot)
            }
        }
    }
})


const rows = computed(() => {
    const nextRowGroup = calcNextRowGroup(items)

    return Array.from(
        groupBy(
            items,
            item => getRowGroup(item))
        ).map(r => ({
            [props.rowGroupProperty || 'id']: r[0]
        }))
        .concat(props.allowRowInsertion ? [ { rowGroup: nextRowGroup }] : [])
})

const columns = computed(() => {
    const group = Array.from(
        groupBy(
            items,
            item => item[columnProperty])
    )
    const cols = group
        .map((c, index) => ({
            name: index + 1,
            items: c[1]
        }))

    if (props.allowColumnInsertion) {
        return cols.concat({ name: group.length + 1 })
    } else {
        return cols
    }
})

function isPivotEnabled(rowGroup, index) {
    return columnItemMap[index].item && rowItemMap[rowGroup].item
}

defineExpose({})

</script>