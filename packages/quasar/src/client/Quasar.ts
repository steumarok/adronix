import { VueDataSet, GetParams } from '@adronix/vue'
import { computed, ref, unref } from "vue"

export function useQTableHandler(ds: VueDataSet, params: GetParams | null, type: string) {
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