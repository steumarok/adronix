import AdxDataTable from './components/DataTable.vue'
import AdxDialog from './components/Dialog.vue'
import { dialog } from './client/Quasar'

import { registerImplementation } from '@adronix/vue'
import { App } from 'vue'
import { useQuasar } from 'quasar'

export function bootAdronixQuasar(app: App<any>) {
    app.component('AdxDataTable', AdxDataTable)
    app.component('AdxDialog', AdxDialog)

    registerImplementation({
        dialog,
        useImpl: () => useQuasar(),
        components: {
            AdxDataTable,
            AdxDialog
        }
    })
}