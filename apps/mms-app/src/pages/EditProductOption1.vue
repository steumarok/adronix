<template>
  <adx-dialog>
    test
  </adx-dialog>
</template>


<script>
import { useDialogPluginComponent } from 'quasar'
import { AdxDialog } from '@adronix/quasar'

export default {
  components: { AdxDialog },
  ...AdxDialog
}
</script>
