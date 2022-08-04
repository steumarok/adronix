import AdxDataTable from './components/DataTable.vue'
import AdxDialog from './components/Dialog.vue'
import AdxInput from './components/Input.vue'
import AdxDataInput from './components/DataInput.vue'
import AdxSelect from './components/Select.vue'
import AdxD from './components/D.vue'
import AdxForm from './components/Form.vue'
import AdxPage from './components/Page.vue'
import AdxAutocomplete from './components/Autocomplete.vue'
import AdxLoading from './components/Loading.vue'
import AdxBreadcrumbs from './components/AdxBreadcrumbs.vue'
import AdxBreadcrumbsEl from './components/AdxBreadcrumbsEl.vue'
import { openDialog } from './client/Quasar'

import { registerImplementation } from '@adronix/vue'
import { App } from 'vue'
import { useQuasar } from 'quasar'

export function bootAdronixQuasar(app: App<any>) {
    app.component('AdxDataTable', AdxDataTable)
    app.component('AdxDialog', AdxDialog)
    app.component('AdxInput', AdxInput)
    app.component('AdxDataInput', AdxDataInput)
    app.component('AdxSelect', AdxSelect)
    app.component('AdxAutocomplete', AdxAutocomplete)
    app.component('AdxD', AdxD)
    app.component('AdxForm', AdxForm)
    app.component('AdxPage', AdxPage)
    app.component('AdxLoading', AdxLoading)
    app.component('AdxBreadcrumbs', AdxBreadcrumbs)
    app.component('AdxBreadcrumbsEl', AdxBreadcrumbsEl)

    registerImplementation({
        openDialog,
        useImpl: () => useQuasar(),
        components: {
            AdxDataTable,
            AdxDialog
        }
    })
}