import { boot } from 'quasar/wrappers';
import { AdronixPlugin } from '@adronix/vue'
import { bootAdronixQuasar } from '@adronix/quasar'

export default boot(({ app }) => {

  bootAdronixQuasar(app)

  app.use(AdronixPlugin)
});

