<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-green-100">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <h3 class="text-xl font-bold text-green-700">Journal alimentaire</h3>
      <div>
        <label class="text-sm font-medium text-green-700 mr-2">Date :</label>
        <input type="date" v-model="dateValue" :max="today" class="border border-green-200 rounded px-2 py-1" />
        <button type="button" @click="exportCSV" class="ml-4 px-3 py-2 rounded bg-green-100 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-200">Exporter CSV</button>
      </div>
    </div>
    <form @submit.prevent="save" class="flex flex-col gap-4 mb-4">
      <div class="flex flex-col sm:flex-row gap-4 mb-2">
        <input type="time" v-model="mealTime" class="input" required />
        <div class="flex-1 relative">
          <input type="text" v-model="mealDesc" class="input w-full" placeholder="Description du repas" required autocomplete="off" @input="onDescInput" />
          <ul v-if="showSuggestions && filteredSuggestions.length" class="absolute z-10 bg-white border border-green-200 rounded shadow w-full mt-1 max-h-40 overflow-auto">
            <li v-for="s in filteredSuggestions" :key="s.name" @click="selectSuggestion(s)" class="px-3 py-2 cursor-pointer hover:bg-green-50 flex justify-between items-center">
              <span>{{ s.name }}</span>
              <span class="text-xs text-green-700 font-semibold">{{ s.calories }} kcal</span>
            </li>
          </ul>
        </div>
        <select v-model="mealCategory" class="input w-auto min-w-[120px]">
          <option value="Petit-déjeuner">Petit-déjeuner</option>
          <option value="Déjeuner">Déjeuner</option>
          <option value="Dîner">Dîner</option>
          <option value="Collation">Collation</option>
        </select>
        <input type="number" v-model.number="mealCalories" min="0" class="input w-24" placeholder="Calories" />
        <button type="button" @click="openCalculator" class="ml-2 px-3 py-2 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200">Calculer</button>
      </div>
      <textarea v-model="mealNotes" rows="2" class="input resize-none" placeholder="Notes (optionnel)"></textarea>
      <button type="submit" class="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 shadow transition">Ajouter</button>
    </form>
    <div v-if="mealsForDate.length" class="mt-4">
      <h4 class="font-semibold text-sm mb-1 text-green-700">Repas du {{ formatDate(dateValue) }} :</h4>
      <ul class="divide-y divide-green-50">
        <li v-for="meal in mealsForDate" :key="meal.id" class="flex items-center justify-between py-2">
          <div>
            <span class="font-mono text-green-800">{{ meal.time }}</span>
            <span class="ml-2">{{ meal.desc }}</span>
            <span class="ml-3 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-200">{{ meal.category }}</span>
            <span v-if="meal.calories" class="ml-3 text-xs text-orange-700 font-semibold">{{ meal.calories }} kcal</span>
            <span v-if="meal.notes" class="ml-3 text-xs italic text-gray-500">{{ meal.notes }}</span>
          </div>
          <div class="flex gap-2">
            <button @click="editMeal(meal)" class="text-xs text-blue-600 hover:underline">Modifier</button>
            <button @click="removeMeal(meal.id)" class="text-xs text-red-600 hover:underline">Supprimer</button>
          </div>
        </li>
      </ul>
      <!-- Statistiques -->
      <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <h5 class="font-bold text-green-700 mb-2">Statistiques du jour</h5>
        <div class="flex flex-col md:flex-row md:items-center md:gap-8 gap-2">
          <div><span class="font-semibold">Nombre de repas :</span> {{ stats.total }}</div>
          <div v-if="stats.total > 0"><span class="font-semibold">Total calories :</span> {{ stats.totalCalories }} kcal</div>
          <div v-if="stats.total > 0"><span class="font-semibold">Premier repas :</span> {{ stats.first }}</div>
          <div v-if="stats.total > 0"><span class="font-semibold">Dernier repas :</span> {{ stats.last }}</div>
          <div v-if="stats.total > 0">
            <span class="font-semibold">Répartition :</span>
            <span class="ml-2">Matin : {{ stats.morning }}</span>,
            <span>Midi : {{ stats.noon }}</span>,
            <span>Soir : {{ stats.evening }}</span>
          </div>
          <div v-if="stats.total > 0" class="mt-2">
            <span class="font-semibold">Par catégorie :</span>
            <ul class="ml-4 list-disc text-sm">
              <li>Petit-déjeuner : {{ stats.byCategory['Petit-déjeuner'] || 0 }}</li>
              <li>Déjeuner : {{ stats.byCategory['Déjeuner'] || 0 }}</li>
              <li>Dîner : {{ stats.byCategory['Dîner'] || 0 }}</li>
              <li>Collation : {{ stats.byCategory['Collation'] || 0 }}</li>
            </ul>
          </div>
        </div>
        <div class="mt-8">
          <h5 class="font-bold text-green-700 mb-2">Évolution des calories (7 jours)</h5>
          <CaloriesChart :labels="caloriesChart.labels" :data="caloriesChart.data" />
        </div>
      </div>
    </div>
    <div v-else class="text-gray-400 text-sm mt-4">Aucun repas pour cette date.</div>
    <div v-if="editing" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
        <h4 class="font-bold text-lg mb-4 text-green-700">Modifier le repas</h4>
        <form @submit.prevent="saveEdit" class="flex flex-col gap-4">
          <input type="time" v-model="editTime" class="input" required />
          <input type="text" v-model="editDesc" class="input" required />
          <select v-model="editCategory" class="input w-auto min-w-[120px]">
            <option value="Petit-déjeuner">Petit-déjeuner</option>
            <option value="Déjeuner">Déjeuner</option>
            <option value="Dîner">Dîner</option>
            <option value="Collation">Collation</option>
          </select>
          <input type="number" v-model.number="editCalories" min="0" class="input w-24" placeholder="Calories" />
          <textarea v-model="editNotes" rows="2" class="input resize-none" placeholder="Notes (optionnel)"></textarea>
          <div class="flex gap-4 mt-2">
            <button type="submit" class="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2">Enregistrer</button>
            <button type="button" @click="cancelEdit" class="px-5 py-2 border border-green-300 rounded-full text-green-700">Annuler</button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="showCalculator" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 shadow-lg w-full max-w-xs">
        <h4 class="font-bold text-lg mb-4 text-orange-700">Calculateur de calories</h4>
        <input type="text" v-model="calcQuery" class="input mb-2" placeholder="Rechercher un aliment..." @input="onCalcQueryInput" />
        <ul v-if="calcFiltered.length" class="mb-2 max-h-32 overflow-auto border border-orange-100 rounded">
          <li v-for="item in calcFiltered" :key="item.name" @click="selectCalcFood(item)" class="px-3 py-2 cursor-pointer hover:bg-orange-50 flex justify-between items-center">
            <span>{{ item.name }}</span>
            <span class="text-xs text-orange-700 font-semibold">{{ item.calories }} kcal / 100g</span>
          </li>
        </ul>
        <div v-if="calcSelected">
          <div class="mb-2">Quantité (en grammes) :</div>
          <input type="number" v-model.number="calcGrams" min="1" class="input w-24 mb-2" />
          <div class="mb-2">Calories estimées : <span class="font-semibold">{{ calcResult }} kcal</span></div>
          <button type="button" @click="applyCalcResult" class="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-5 py-2 mt-2">Utiliser</button>
        </div>
        <button type="button" @click="closeCalculator" class="mt-4 text-orange-700 underline text-xs">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineComponent, h, PropType } from 'vue';
import { useMeals } from '../../../composables/useMeals';
import { Bar } from 'vue-chartjs';
import type { ChartData } from 'chart.js';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

import { computed as vueComputed } from 'vue';

const CaloriesChart = defineComponent({
  name: 'CaloriesChart',
  props: {
    labels: { type: Array as PropType<string[]>, required: true },
    data: { type: Array as PropType<number[]>, required: true }
  },
  setup(props) {
    const chartData = vueComputed(() => ({
      labels: props.labels,
      datasets: [
        {
          label: 'Calories',
          backgroundColor: '#34d399',
          data: props.data
        }
      ]
    }));
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    };
    return () =>
      h(Bar, {
        chartData: chartData.value,
        options: chartOptions,
        style: 'max-height:260px;'
      });
  }
});

const caloriesChart = computed(() => {
  // 7 derniers jours (labels et data)
  const days: string[] = [];
  const data: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push(d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' }));
    // Somme des calories pour ce jour
    const sum = getMealsByDate(dateStr).reduce((acc, m) => acc + (m.calories || 0), 0);
    data.push(sum);
  }
  return { labels: days, data };
});

type MealCategory = 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';

const { getMealsByDate, addMeal, updateMeal, removeMeal } = useMeals();

const today = new Date().toISOString().slice(0, 10);
const dateValue = ref(today);
const mealTime = ref('');
const mealDesc = ref('');
const mealCategory = ref<MealCategory>('Déjeuner');
const mealCalories = ref<number | null>(null);
const mealNotes = ref('');

const foodSuggestions = [
  { name: 'Pomme', calories: 52 },
  { name: 'Banane', calories: 90 },
  { name: 'Croissant', calories: 180 },
  { name: 'Pain (1 tranche)', calories: 80 },
  { name: 'Poulet rôti (100g)', calories: 165 },
  { name: 'Riz cuit (100g)', calories: 130 },
  { name: 'Yaourt nature', calories: 60 },
  { name: 'Oeuf', calories: 70 },
  { name: 'Fromage (30g)', calories: 120 },
  { name: 'Pâtes cuites (100g)', calories: 130 },
  { name: 'Steak haché (100g)', calories: 210 },
  { name: 'Tomate', calories: 18 },
  { name: 'Carotte', calories: 41 },
  { name: 'Pizza (1 part)', calories: 250 },
  { name: 'Chocolat (10g)', calories: 55 },
  { name: 'Lait (1 verre)', calories: 90 },
  { name: 'Orange', calories: 47 },
  { name: 'Poisson (100g)', calories: 120 },
  { name: 'Frites (100g)', calories: 310 },
  { name: 'Salade composée', calories: 150 },
];

const showSuggestions = ref(false);
const filteredSuggestions = ref<typeof foodSuggestions>([]);

function onDescInput() {
  const val = mealDesc.value.trim().toLowerCase();
  if (!val) {
    showSuggestions.value = false;
    filteredSuggestions.value = [];
    return;
  }
  filteredSuggestions.value = foodSuggestions.filter(s => s.name.toLowerCase().includes(val));
  showSuggestions.value = filteredSuggestions.value.length > 0;
}

function selectSuggestion(s: { name: string; calories: number }) {
  mealDesc.value = s.name;
  mealCalories.value = s.calories;
  showSuggestions.value = false;
}

// Fermer suggestions si clic extérieur
import { onMounted, onBeforeUnmount } from 'vue';
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.input')) {
    showSuggestions.value = false;
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));

const showCalculator = ref(false);
const calcQuery = ref('');
const calcFiltered = ref<typeof foodSuggestions>([]);
const calcSelected = ref<{ name: string; calories: number } | null>(null);
const calcGrams = ref(100);
const calcResult = computed(() => calcSelected.value ? Math.round(calcSelected.value.calories * (calcGrams.value / 100)) : 0);

function openCalculator() {
  showCalculator.value = true;
  calcQuery.value = '';
  calcFiltered.value = foodSuggestions;
  calcSelected.value = null;
  calcGrams.value = 100;
}
function closeCalculator() {
  showCalculator.value = false;
}
function onCalcQueryInput() {
  const val = calcQuery.value.trim().toLowerCase();
  if (!val) {
    calcFiltered.value = foodSuggestions;
    return;
  }
  calcFiltered.value = foodSuggestions.filter(s => s.name.toLowerCase().includes(val));
}
function selectCalcFood(item: { name: string; calories: number }) {
  calcSelected.value = item;
}
function applyCalcResult() {
  if (calcSelected.value) {
    mealDesc.value = calcSelected.value.name + ' (' + calcGrams.value + 'g)';
    mealCalories.value = calcResult.value;
    showCalculator.value = false;
  }
}

const mealsForDate = computed(() => getMealsByDate(dateValue.value));

const stats = computed(() => {
  const total = mealsForDate.value.length;
  if (total === 0) return { total: 0, totalCalories: 0, first: '-', last: '-', morning: 0, noon: 0, evening: 0, byCategory: {} };
  const sorted = [...mealsForDate.value].sort((a, b) => a.time.localeCompare(b.time));
  const first = sorted[0].time;
  const last = sorted[sorted.length - 1].time;
  let morning = 0, noon = 0, evening = 0;
  const byCategory: Record<string, number> = { 'Petit-déjeuner': 0, 'Déjeuner': 0, 'Dîner': 0, 'Collation': 0 };
  let totalCalories = 0;
  for (const meal of mealsForDate.value) {
    const [h] = meal.time.split(":").map(Number);
    if (h < 10) morning++;
    else if (h < 15) noon++;
    else evening++;
    if (byCategory[meal.category] !== undefined) byCategory[meal.category]++;
    if (typeof meal.calories === 'number') totalCalories += meal.calories;
  }
  return { total, totalCalories, first, last, morning, noon, evening, byCategory };
});

function save() {
  addMeal({ time: mealTime.value, desc: mealDesc.value, date: dateValue.value, category: mealCategory.value, calories: mealCalories.value ?? undefined, notes: mealNotes.value || undefined });
  mealTime.value = '';
  mealDesc.value = '';
  mealCategory.value = 'Déjeuner';
  mealCalories.value = null;
  mealNotes.value = '';
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR');
}

function exportCSV() {
  // Colonnes : Date, Heure, Description, Catégorie, Calories, Notes
  const header = ['Date', 'Heure', 'Description', 'Catégorie', 'Calories', 'Notes'];
  const rows = mealsForDate.value.map(meal => [
    meal.date,
    meal.time,
    '"' + (meal.desc || '').replace(/"/g, '""') + '"',
    meal.category,
    meal.calories ?? '',
    '"' + (meal.notes || '').replace(/"/g, '""') + '"',
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `repas-${dateValue.value}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Edition
const editing = ref(false);
const editId = ref<string | null>(null);
const editTime = ref('');
const editDesc = ref('');
const editCategory = ref<MealCategory>('Déjeuner');
const editCalories = ref<number | null>(null);
const editNotes = ref('');

function editMeal(meal: any) {
  editing.value = true;
  editId.value = meal.id;
  editTime.value = meal.time;
  editDesc.value = meal.desc;
  editCategory.value = meal.category as MealCategory;
  editCalories.value = meal.calories ?? null;
  editNotes.value = meal.notes || '';
}

function saveEdit() {
  if (editId.value) {
    updateMeal(editId.value, { time: editTime.value, desc: editDesc.value, category: editCategory.value, calories: editCalories.value ?? undefined, notes: editNotes.value || undefined });
  }
  editing.value = false;
  editId.value = null;
  editTime.value = '';
  editDesc.value = '';
  editCategory.value = 'Déjeuner';
  editCalories.value = null;
  editNotes.value = '';
}

function cancelEdit() {
  editing.value = false;
  editId.value = null;
  editTime.value = '';
  editDesc.value = '';
  editCategory.value = 'Déjeuner';
  editCalories.value = null;
  editNotes.value = '';
}

defineExpose({ exportCSV });
</script>

<style scoped>
.input {
  @apply border border-green-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-200 transition;
}
</style>
