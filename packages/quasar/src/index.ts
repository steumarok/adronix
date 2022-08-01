import AdxDataTable from './components/DataTable.vue'
import AdxDialog from './components/Dialog.vue'
import AdxInput from './components/Input.vue'
import AdxSelect from './components/Select.vue'
import AdxD from './components/D.vue'
import AdxForm from './components/Form.vue'
import AdxPage from './components/Page.vue'
import { openDialog } from './client/Quasar'

import { registerImplementation } from '@adronix/vue'
import { App } from 'vue'
import { useQuasar } from 'quasar'

export function bootAdronixQuasar(app: App<any>) {
    app.component('AdxDataTable', AdxDataTable)
    app.component('AdxDialog', AdxDialog)
    app.component('AdxInput', AdxInput)
    app.component('AdxSelect', AdxSelect)
    app.component('AdxD', AdxD)
    app.component('AdxForm', AdxForm)
    app.component('AdxPage', AdxPage)

    registerImplementation({
        openDialog,
        useImpl: () => useQuasar(),
        components: {
            AdxDataTable,
            AdxDialog
        }
    })
}