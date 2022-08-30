<script setup lang="ts">
import { useAdronix } from '@adronix/vue';

const $adx = useAdronix()
const ds = $adx.dataSet('/api/mms/modelCounts')

const assetModelCount = ds.ref("Metadata", "assetModelCount")
</script>

<template>
  <q-page class="q-pa-md">

    <adx-d vertical y-spacing="sm">

        <adx-breadcrumbs separator=" > ">
            <q-breadcrumbs-el label="Home" icon="home" to="/home" />
            <q-breadcrumbs-el label="Modelli" />
        </adx-breadcrumbs>

        <adx-d>
            <q-list bordered separator>
                <q-item clickable to="/assetModels">
                    <q-item-section>
                        <span class="adx-reference">Modelli di asset ({{assetModelCount?.value}})</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/assetComponentModels">
                    <q-item-section>
                        <span class="adx-reference">Modelli di componenti</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/taskModels">
                    <q-item-section>
                        <span class="adx-reference">Modelli di attività</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/services">
                    <q-item-section>
                        <span class="adx-reference">Servizi</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/checklistModels">
                    <q-item-section>
                        <span class="adx-reference">Modelli di checklist</span>
                    </q-item-section>
                </q-item>

                 <q-item clickable to="/checklistItemModels">
                    <q-item-section>
                        <span class="adx-reference">Modelli di elementi checklist</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/areaModels">
                    <q-item-section>
                        <span class="adx-reference">Modelli di locale</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/resourceModels">
                    <q-item-section>
                        <span class="adx-reference">Modelli di risorsa</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/resourceTypes">
                    <q-item-section>
                        <span class="adx-reference">Tipi di risorsa</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/assetAttributes">
                    <q-item-section>
                        <span class="adx-reference">Attributi assets</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/stateAttributes">
                    <q-item-section>
                        <span class="adx-reference">Attributi di stato</span>
                    </q-item-section>
                </q-item>

                <q-item clickable to="/parts">
                    <q-item-section>
                        <span class="adx-reference">Articoli</span>
                    </q-item-section>
                </q-item>
            </q-list>
        </adx-d>

    </adx-d>

  </q-page>
</template>

