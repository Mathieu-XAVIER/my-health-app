<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-green-100">
    <h3 class="text-xl font-bold text-green-700 mb-4">Ajouter un repas</h3>
    <form @submit.prevent="save" class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row gap-4 mb-2">
        <input type="time" v-model="mealTime" class="input" required />
        <input type="text" v-model="mealDesc" class="input flex-1" placeholder="Description du repas" required />
      </div>
      <button type="submit" class="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 shadow transition">Ajouter</button>
    </form>
    <div v-if="mealsToday.length" class="mt-4">
      <h4 class="font-semibold text-sm mb-1 text-green-700">Repas du jour :</h4>
      <ul class="list-disc ml-5 text-sm">
        <li v-for="meal in mealsToday" :key="meal.id">{{ meal.time }} - {{ meal.desc }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMeals } from '@/composables/useMeals';

const { mealsToday, addMeal } = useMeals();
const mealTime = ref('');
const mealDesc = ref('');

function save() {
  addMeal({ time: mealTime.value, desc: mealDesc.value });
  mealTime.value = '';
  mealDesc.value = '';
}
</script>

<style scoped>
.input {
  @apply border border-green-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-200 transition;
}
</style>
