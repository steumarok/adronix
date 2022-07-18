<template>
  <component
    v-for="(component, index) in components"
    v-bind:key="index"
    :is="component"
    v-bind="componentProps"></component>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount } from 'vue';
import { injectionsMap } from './ui';

export default defineComponent({
  name: 'AdronixInject',
  props: {
    path: {
      type: String,
      required: true,
    },
    props: {
      type: Object
    }
  },
  setup(props) {
    return {
        componentProps: props.props,
        components: injectionsMap.get(props.path) || [],
        handleClick: () => {
            alert(props.path)
        }
    };
  },
});
</script>
