export { VueDataSet, dataSet } from './client/VueDataSet'
import { Component, computed, reactive, Ref } from 'vue'
import { GetParams, urlComposer } from './client/UrlComposer'
import { dataSet, VueDataSet } from './client/VueDataSet'
import AdronixPlugin from './ui/AdronixPlugin'

export { AdronixPlugin }

export { GetParams }

export type Columns = {
    [name: string]: {
        label: string,
        field?: (row: any) => any
    }
}



function getDefaultDataTableParams() {
    return {
      page: 1,
      limit: 10
    }
  }


export function dataTable(
    typeName: string,
    columns: Columns,
    initParams: GetParams = getDefaultDataTableParams()) {

    const params = reactive(initParams)
    return {
        params,
        bind(dataSet: VueDataSet) {
            return {
                params,
                columns,
                rows: dataSet.list(typeName),
                totalCount: computed(() => dataSet.ref('Metadata', `${typeName}.totalCount`).value),
            }
        }
    }
  }

export function dialog(component: Component, props?: any): void {
    throw "not implemented";
}

const implementation = {
    urlComposer,
    dataSet,
    dataTable,
    dialog,
    components: {} as {
        [name: string]: Component
    },
    useImpl: () => null
}

type LibraryImplementation = {
    dialog: typeof dialog,
    useImpl: () => any,
    components: {
        [name: string]: Component
    },
}

export function registerImplementation({ dialog, useImpl, components }: LibraryImplementation) {
    implementation.dialog = dialog
    implementation.useImpl = useImpl
    implementation.components = { ...implementation.components, ...components }
}

export function useAdronix() {
    return {
        ...implementation,
        dialog: implementation.dialog.bind(implementation.useImpl())
    }
}

export const AdxComponents = implementation.components

