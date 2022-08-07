<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Pianificazione" />
        </adx-breadcrumbs>

        <adx-d>
            <q-list bordered separator>
                <q-item clickable to="/partRequirements">
                    <q-item-section>
                        <span class="adx-reference">Fabbisogno articoli</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/workPlans">
                    <q-item-section>
                        <span class="adx-reference">Piani di lavoro</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/schedulings">
                    <q-item-section>
                        <span class="adx-reference">Schedulazioni</span>
                    </q-item-section>
                </q-item>

            </q-list>
        </adx-d>

    </adx-d>

  </q-page>
</template>

<script setup lang="ts">
import { useAdronix } from '@adronix/vue';
</script>
