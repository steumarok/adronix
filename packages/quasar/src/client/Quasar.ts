import { GetParams } from '@adronix/vue'
import { Component, computed, ComputedRef, ref, unref } from "vue"
import { useQuasar } from 'quasar'

export function useQTableHandler(totalCount: ComputedRef<any>, params: GetParams | null) {
    const pageRef = ref(1)
    const rowsPerPageRef = ref(params?.limit)
    const sortByRef = ref()
    const descendingRef = ref()

    const pagination = ({
      sortBy: 'desc',
      descending: false
    })

    const onRequest = (props: any) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter

      pageRef.value = page
      rowsPerPageRef.value = rowsPerPage
      sortByRef.value = sortBy
      descendingRef.value = descending

      if (params) {
        params.page = page
        params.limit = rowsPerPage
        params.sortBy = sortBy
        params.descending = descending
        params.filter = filter
      }
    }

    return {
      pagination: computed(() => ({
        ...pagination,
        page: pageRef.value,
        sortBy: sortByRef.value,
        descending: descendingRef.value,
        rowsPerPage: rowsPerPageRef.value,
        rowsNumber: unref(totalCount)?.value
      })),
      onRequest
    }
  }



export function openDialog(
  this: ReturnType<typeof useQuasar>,
  component: Component,
  props?: any) {
  return this.dialog({
    component,
    componentProps: props
  })
}