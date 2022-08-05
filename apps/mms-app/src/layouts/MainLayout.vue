<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <!--
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          -->
          Maintenance Management System
        </q-toolbar-title>
      </q-toolbar>

    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered class="bg-grey-10 text-white">
      <q-list style="min-width: 100px">
        <q-item clickable to="/clients" :active="isActiveContext('clients')" active-class="text-white text-bold bg-grey-8">
          <q-item-section>Clienti</q-item-section>
        </q-item>
        <q-item clickable to="/assets" :active="isActiveContext('assets')" active-class="text-white text-bold bg-grey-8">
          <q-item-section>Assets</q-item-section>
        </q-item>
        <q-item clickable v-close-popup>
          <q-item-section>Ordini di lavoro</q-item-section>
        </q-item>
        <q-item clickable v-close-popup>
          <q-item-section>Fatture</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable to="/models">
          <q-item-section>Modelli</q-item-section>
        </q-item>
        <q-item clickable to="/planning">
          <q-item-section>Pianificazione</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup>
          <q-item-section>Impostazioni</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup>
          <q-item-section>Informazioni</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router';

const leftDrawerOpen = ref(false)
const route = useRoute()

function isActiveContext(context) {
  return route.meta.context == context
}

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
