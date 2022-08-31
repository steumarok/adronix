<template>
    <q-card flat bordered>
        <q-card-section>
            <q-card-section class="q-pa-sm">
                <div class="text-subtitle2">{{title}}</div>
                <slot/>
            </q-card-section>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string,
}>()

const { title } = props
</script>