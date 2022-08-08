export { VueDataSet, dataSet } from './client/VueDataSet'
import { Item } from '@adronix/client/src'
import { Component, computed, onMounted, reactive, ref, Ref } from 'vue'
import { GetParams, urlComposer } from './client/UrlComposer'
import { dataSet, VueDataSet } from './client/VueDataSet'
import AdronixPlugin from './ui/AdronixPlugin'

export { AdronixPlugin }

export { GetParams }

export type Columns = {
    [name: string]: {
        label: string,
        width?: string,
        align?: string,
        sortable?: boolean,
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
    columns = reactive(columns)
    return {
        params,
        columns,
        bind(dataSet: VueDataSet) {
            return {
                params,
                columns,
                rows: dataSet.list(typeName),
                totalCount: dataSet.ref('Metadata', `${typeName}.totalCount`),
            }
        }
    }
}

export function openDialog(component: Component, props?: any): void {
    throw "not implemented";
}

const implementation = {
    urlComposer,
    dataSet,
    dataTable,
    openDialog,
    components: {} as {
        [name: string]: Component<{}, {}, any>
    },
    useImpl: () => null
}

type LibraryImplementation = {
    openDialog: typeof openDialog,
    useImpl: () => any,
    components: {
        [name: string]: Component<{}, {}, any>
    },
}

export function registerImplementation({ openDialog, useImpl, components }: LibraryImplementation) {
    implementation.openDialog = openDialog
    implementation.useImpl = useImpl
    implementation.components = { ...implementation.components, ...components }
}

export function useAdronix() {
    return {
        ...implementation,
        openDialog: implementation.openDialog.bind(implementation.useImpl()),

        dialog: (
          onOk: () => Promise<boolean | { status: boolean, payload: any}>,
          onCancel: () => Promise<boolean> = () => Promise.resolve(true)
        ) => {
          const dialog = ref()

          onMounted(() => {
            dialog.value.setCloseHandler(onOk, onCancel)
          })

          return { dialog }
        }
    }
}

export const AdxComponents = implementation.components

