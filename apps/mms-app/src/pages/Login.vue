<template>
  <adx-page>

    <adx-form
      ref="form"
      url="/api/auth/login"
      class="window-height"
      @onSuccess="onSuccess">

      <adx-d horizontal fit justify="center" content="center">
        <adx-d width="300px" y-spacing="sm">
          <adx-input
            type="email"
            label="Email"
            name="username"
            outlined
            :errors="form?.errors.username"/>

          <adx-input
            type="password"
            label="Password"
            name="password"
            outlined
            :errors="form?.errors.auth"
          />

          <q-btn type="submit" unelevated color="primary" size="lg" class="full-width">Login</q-btn>
        </adx-d>
      </adx-d>

    </adx-form>

  </adx-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const form = ref()

const onSuccess = async (r: Response) => {
  alert(await r.json())
}
</script>
