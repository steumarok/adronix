<script setup lang="ts">
</script>

<template>
    <q-breadcrumbs separator=" > ">
        <q-breadcrumbs-el label="Home" icon="home" to="/home" />
        <slot />
    </q-breadcrumbs>
</template>