<template>
  <div class="w-full px-4">
    <h1 class="text-4xl font-extrabold text-blue-800 mb-6 mt-6 text-center">Suivi de ma santé quotidienne</h1>

    <!-- Statistiques de santé -->
    <HealthStats />

    <!-- Formulaire d'ajout de données -->
    <HealthEntryForm />

    <!-- Historique des données -->
    <HealthHistory />
  </div>
</template>

<script setup lang="ts">
import HealthStats from "../components/HealthStats.vue";
import HealthEntryForm from "../components/HealthEntryForm.vue";
import HealthHistory from "../components/HealthHistory.vue";
</script>
