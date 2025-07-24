<template>
  <div class="w-full px-4">
    <h1 class="text-4xl font-extrabold text-purple-800 mb-6 mt-6 text-center">Suivi de mon activité physique</h1>
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10 w-full">
      <div class="bg-purple-100 rounded-2xl p-10 flex flex-col items-center shadow-lg">
        <span class="text-5xl font-extrabold text-purple-800">{{ stats.count }}</span>
        <span class="text-base text-purple-700 mt-2">Activités</span>
      </div>
      <div class="bg-purple-100 rounded-2xl p-10 flex flex-col items-center shadow-lg">
        <span class="text-5xl font-extrabold text-purple-800">{{ stats.totalDuration }} min</span>
        <span class="text-base text-purple-700 mt-2">Durée totale</span>
      </div>
      <div class="bg-purple-100 rounded-2xl p-10 flex flex-col items-center shadow-lg">
        <span class="text-5xl font-extrabold text-purple-800">{{ stats.mostFrequentType || '-' }}</span>
        <span class="text-base text-purple-700 mt-2">Type le plus fréquent</span>
      </div>
      <div class="bg-purple-100 rounded-2xl p-10 flex flex-col items-center shadow-lg">
        <span class="text-5xl font-extrabold text-purple-800">{{ stats.avgIntensity }}</span>
        <span class="text-base text-purple-700 mt-2">Intensité moyenne</span>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row sm:items-end gap-4 mb-8 bg-white border border-purple-200 rounded-2xl shadow-lg p-6">
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">Type</label>
        <select v-model="filterType" class="bg-white border-2 border-purple-400 rounded-xl shadow-md px-4 py-2 text-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-600 transition mb-2">
          <option value="">Tous</option>
          <option v-for="t in uniqueTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">Intensité</label>
        <select v-model="filterIntensity" class="bg-white border-2 border-purple-400 rounded-xl shadow-md px-4 py-2 text-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-600 transition mb-2">
          <option value="">Toutes</option>
          <option value="faible">Faible</option>
          <option value="moyenne">Moyenne</option>
          <option value="forte">Forte</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">Période</label>
        <input type="date" v-model="filterStart" class="bg-white border-2 border-purple-400 rounded-xl shadow-md px-4 py-2 text-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-600 transition mb-2" />
        <input type="date" v-model="filterEnd" class="bg-white border-2 border-purple-400 rounded-xl shadow-md px-4 py-2 text-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-600 transition mt-1 mb-2" />
      </div>
      <button @click="openAddModal" class="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-2 text-xl shadow flex items-center gap-2 self-end">
        <span>+</span> Ajouter
      </button>
    </div>
    <ActivityTable :activities="filteredActivities" @remove="removeActivity" @edit="openEditModal" />
    <ActivityModal :open="showModal" :activity="editingActivity" @close="closeModal" @add="addActivityFromModal" @update="updateActivityFromModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Activity } from '../../../composables/useFitnessTracker';
import { useFitnessTracker } from '../../../composables/useFitnessTracker';
import { useFitnessStats } from '../components/useFitnessStats';
import ActivityTable from '../components/ActivityTable.vue';
import ActivityModal from '../components/ActivityModal.vue';

const showModal = ref(false);
const editingActivity = ref<Activity|null>(null);
const { activities, addActivity, removeActivity } = useFitnessTracker();
const { stats } = useFitnessStats();

const filterType = ref('');
const filterIntensity = ref('');
const filterStart = ref('');
const filterEnd = ref('');

const uniqueTypes = computed(() => {
  const set = new Set(activities.value.map(a => a.type));
  return Array.from(set).filter(Boolean);
});

const filteredActivities = computed(() => {
  return activities.value.filter(a => {
    if (filterType.value && a.type !== filterType.value) return false;
    if (filterIntensity.value && a.intensity !== filterIntensity.value) return false;
    if (filterStart.value && a.date < filterStart.value) return false;
    if (filterEnd.value && a.date > filterEnd.value) return false;
    return true;
  });
});

function openAddModal() {
  editingActivity.value = null;
  showModal.value = true;
}
function openEditModal(activity: Activity) {
  editingActivity.value = { ...activity };
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}
function addActivityFromModal(payload: Activity) {
  addActivity(payload);
}
function updateActivityFromModal(payload: Activity) {
  // Remplacer l'activité dans la liste (en localStorage via useFitnessTracker)
  const idx = activities.value.findIndex(a => a.id === payload.id);
  if (idx !== -1) {
    activities.value[idx] = { ...payload };
    // Sauvegarder
    localStorage.setItem('activities', JSON.stringify(activities.value));
  }
}
</script>
