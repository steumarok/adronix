import { App, Component } from 'vue';
import AdronixInject from './AdronixInject.vue'
import { injectionsMap } from './ui';


export default {
  install: (app: App, options: any[]) => {
    app.component('adronix-inject', AdronixInject)
  },

  registerInjection: (path: string, componentClass: Component) => {
    if (!injectionsMap.has(path)) {
      injectionsMap.set(path, [])
    }
    injectionsMap.get(path)!.push(componentClass)
  }
};
