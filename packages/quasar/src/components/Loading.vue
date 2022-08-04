<template>
    <q-inner-loading :showing="show">
        <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <slot v-if="!show"/>
</template>


<script setup lang="ts">

</script>
