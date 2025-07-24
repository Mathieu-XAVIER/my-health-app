<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100">
    <h3 class="text-xl font-bold text-purple-700 mb-4">Ajouter une activité</h3>
    <form @submit.prevent="save" class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row gap-4 mb-2">
        <input type="text" v-model="type" class="input w-64" placeholder="Type (course, yoga...)" required />
        <input type="number" v-model.number="duration" class="input w-20" placeholder="Durée (min)" required min="1" />
        <select v-model="intensity" class="input w-32" required>
          <option value="">Intensité</option>
          <option value="faible">Faible</option>
          <option value="moyenne">Moyenne</option>
          <option value="forte">Forte</option>
        </select>
        <input type="date" v-model="date" class="input w-36" required />
        <input type="time" v-model="time" class="input w-28" required />
      </div>
      <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 py-2 shadow transition">Ajouter</button>
    </form>
    <div v-if="activitiesToday.length" class="mt-4">
      <h4 class="font-semibold text-sm mb-1 text-purple-700">Activités du jour :</h4>
      <ul class="list-disc ml-5 text-sm">
        <li v-for="a in activitiesToday" :key="a.id" class="flex items-center gap-2">
          <span>{{ a.type }} ({{ a.duration }} min, {{ a.intensity }})</span>
          <button @click="removeActivity(a.id)" class="text-xs text-red-500 hover:underline ml-2">Supprimer</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFitnessTracker } from '../../../composables/useFitnessTracker';

const { activitiesToday, addActivity, removeActivity } = useFitnessTracker();
const type = ref('');
const duration = ref<number | null>(null);
const intensity = ref('');
const date = ref<string>(new Date().toISOString().slice(0, 10));
const time = ref<string>(new Date().toTimeString().slice(0,5));

function save() {
  if (!type.value || !duration.value || !intensity.value || !date.value || !time.value) return;
  addActivity({ type: type.value, duration: duration.value, intensity: intensity.value, date: date.value, time: time.value });
  type.value = '';
  duration.value = null;
  intensity.value = '';
  date.value = new Date().toISOString().slice(0, 10);
  time.value = new Date().toTimeString().slice(0,5);
}
</script>

<style scoped>
.input {
  @apply border border-purple-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-200 transition;
}
</style>
