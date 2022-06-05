import { boot } from 'quasar/wrappers';
import { AdronixPlugin } from '@adronix/vue'

export default boot(({ app }) => {
  app.use(AdronixPlugin)
});

