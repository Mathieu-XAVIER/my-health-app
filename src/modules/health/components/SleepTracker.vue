<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
    <h3 class="text-xl font-bold text-blue-700 mb-4">Sommeil</h3>
    <form @submit.prevent="save" class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row gap-4 mb-2">
        <label class="flex-1">
          <span class="block text-gray-700 font-medium mb-1">Heure de coucher</span>
          <input type="time" v-model="sleepStart" class="input" required />
        </label>
        <label class="flex-1">
          <span class="block text-gray-700 font-medium mb-1">Heure de réveil</span>
          <input type="time" v-model="sleepEnd" class="input" required />
        </label>
      </div>
      <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2 shadow transition">Enregistrer</button>
    </form>
    <div v-if="lastEntry" class="mt-4 text-sm text-gray-600">
      <span class="font-semibold">Dernier sommeil :</span> {{ lastEntry.sleepStart }} → {{ lastEntry.sleepEnd }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSleepTracker } from '@/composables/useSleepTracker';

const { lastEntry, addEntry } = useSleepTracker();
const sleepStart = ref('');
const sleepEnd = ref('');

function save() {
  addEntry({ sleepStart: sleepStart.value, sleepEnd: sleepEnd.value });
  sleepStart.value = '';
  sleepEnd.value = '';
}
</script>

<style scoped>
.input {
  @apply border border-blue-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 transition;
}
</style>
