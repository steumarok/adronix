import { GetParams } from '@adronix/vue'
import { Component, computed, ComputedRef, ref, unref } from "vue"
import { useQuasar } from 'quasar'

export function useQTableHandler(totalCount: ComputedRef<any>, params: GetParams | null) {
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
      pagination: computed(() => ({
        ...pagination,
        page: pageRef.value,
        rowsPerPage: rowsPerPageRef.value,
        rowsNumber: unref(totalCount)?.value
      })),
      onRequest
    }
  }



export function dialog(
  this: ReturnType<typeof useQuasar>,
  component: Component,
  props?: any) {
  this.dialog({
    component,
    componentProps: props
  })
}