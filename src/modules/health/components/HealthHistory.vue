<template>
  <div class="bg-white border border-blue-200 rounded-2xl shadow-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-blue-700">Historique de mes données</h3>
      <div class="flex gap-2">
        <button
          @click="showTodayOnly = !showTodayOnly"
          class="px-4 py-2 rounded-lg text-sm font-medium transition"
          :class="showTodayOnly ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
        >
          {{ showTodayOnly ? 'Tous les jours' : 'Aujourd\'hui seulement' }}
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="flex flex-col sm:flex-row sm:items-end gap-4 mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">Période</label>
        <input
          type="date"
          v-model="filterStart"
          class="bg-white border-2 border-blue-400 rounded-xl shadow-md px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition"
        />
        <input
          type="date"
          v-model="filterEnd"
          class="bg-white border-2 border-blue-400 rounded-xl shadow-md px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition mt-1"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">Humeur</label>
        <select
          v-model="filterMood"
          class="bg-white border-2 border-blue-400 rounded-xl shadow-md px-4 py-2 text-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition"
        >
          <option value="">Toutes</option>
          <option value="excellent">😊 Excellent</option>
          <option value="bon">🙂 Bon</option>
          <option value="moyen">😐 Moyen</option>
          <option value="mauvais">😔 Mauvais</option>
        </select>
      </div>
    </div>

    <!-- Tableau des données -->
    <div v-if="filteredEntries.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">📊</div>
      <h4 class="text-lg font-semibold text-gray-700 mb-2">Aucune donnée trouvée</h4>
      <p class="text-gray-500">Commencez par ajouter vos premières données de santé !</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-blue-200">
            <th class="text-left py-3 px-4 font-semibold text-blue-700">Date</th>
            <th class="text-left py-3 px-4 font-semibold text-blue-700">Pas</th>
            <th class="text-left py-3 px-4 font-semibold text-blue-700">Sommeil</th>
            <th class="text-left py-3 px-4 font-semibold text-blue-700">Eau</th>
            <th class="text-left py-3 px-4 font-semibold text-blue-700">Humeur</th>
            <th class="text-left py-3 px-4 font-semibold text-blue-700">Statut</th>
            <th class="text-left py-3 px-4 font-semibold text-blue-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in filteredEntries"
            :key="entry.id"
            class="border-b border-gray-100 hover:bg-blue-50 transition-colors"
          >
            <td class="py-3 px-4">
              <div class="font-medium text-gray-800">{{ formatDate(entry.date) }}</div>
              <div class="text-sm text-gray-500">{{ getDayName(entry.date) }}</div>
            </td>

            <td class="py-3 px-4">
              <div class="font-semibold" :class="getStepColor(entry.steps)">
                {{ entry.steps.toLocaleString() }}
              </div>
              <div class="text-xs text-gray-500">
                {{ getStepProgress(entry.steps) }}
              </div>
            </td>

            <td class="py-3 px-4">
              <div class="font-semibold" :class="getSleepColor(entry.sleepHours)">
                {{ entry.sleepHours }}h
              </div>
              <div class="text-xs text-gray-500">
                {{ getSleepProgress(entry.sleepHours) }}
              </div>
            </td>

            <td class="py-3 px-4">
              <div class="font-semibold" :class="getWaterColor(entry.waterIntake)">
                {{ entry.waterIntake }}L
              </div>
              <div class="text-xs text-gray-500">
                {{ getWaterProgress(entry.waterIntake) }}
              </div>
            </td>

            <td class="py-3 px-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ getMoodEmoji(entry.mood) }}</span>
                <span class="text-sm font-medium text-gray-700">{{ getMoodText(entry.mood) }}</span>
              </div>
            </td>

            <td class="py-3 px-4">
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full"
                  :class="getOverallStatusColor(entry)"
                ></div>
                <span class="text-sm font-medium" :class="getOverallStatusTextColor(entry)">
                  {{ getOverallStatusText(entry) }}
                </span>
              </div>
            </td>

            <td class="py-3 px-4">
              <div class="flex gap-2">
                <button
                  @click="editEntry(entry)"
                  class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  @click="deleteEntry(entry.id)"
                  class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="filteredEntries.length > 0" class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
      <div class="text-sm text-gray-600">
        {{ filteredEntries.length }} entrée{{ filteredEntries.length > 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHealthTracker } from '../../../composables/useHealthTracker';

const { entries, removeEntry, HEALTH_GOALS } = useHealthTracker();

const showTodayOnly = ref(false);
const filterStart = ref('');
const filterEnd = ref('');
const filterMood = ref('');

const filteredEntries = computed(() => {
  let filtered = [...entries.value].sort((a, b) => b.date.localeCompare(a.date));

  if (showTodayOnly.value) {
    const today = new Date().toISOString().slice(0, 10);
    filtered = filtered.filter(entry => entry.date === today);
  }

  if (filterStart.value) {
    filtered = filtered.filter(entry => entry.date >= filterStart.value);
  }

  if (filterEnd.value) {
    filtered = filtered.filter(entry => entry.date <= filterEnd.value);
  }

  if (filterMood.value) {
    filtered = filtered.filter(entry => entry.mood === filterMood.value);
  }

  return filtered;
});

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getDayName(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { weekday: 'long' });
}

function getStepColor(steps: number) {
  if (steps >= HEALTH_GOALS.dailySteps) return 'text-green-600';
  if (steps >= HEALTH_GOALS.dailySteps * 0.7) return 'text-orange-600';
  return 'text-red-600';
}

function getSleepColor(sleep: number) {
  if (sleep >= HEALTH_GOALS.dailySleep) return 'text-green-600';
  if (sleep >= HEALTH_GOALS.dailySleep * 0.8) return 'text-orange-600';
  return 'text-red-600';
}

function getWaterColor(water: number) {
  if (water >= HEALTH_GOALS.dailyWater) return 'text-green-600';
  if (water >= HEALTH_GOALS.dailyWater * 0.7) return 'text-orange-600';
  return 'text-red-600';
}

function getStepProgress(steps: number) {
  const percentage = Math.round((steps / HEALTH_GOALS.dailySteps) * 100);
  return `${percentage}% de l'objectif`;
}

function getSleepProgress(sleep: number) {
  const percentage = Math.round((sleep / HEALTH_GOALS.dailySleep) * 100);
  return `${percentage}% de l'objectif`;
}

function getWaterProgress(water: number) {
  const percentage = Math.round((water / HEALTH_GOALS.dailyWater) * 100);
  return `${percentage}% de l'objectif`;
}

function getMoodEmoji(mood: string) {
  switch (mood) {
    case 'excellent': return '😊';
    case 'bon': return '🙂';
    case 'moyen': return '😐';
    case 'mauvais': return '😔';
    default: return '😊';
  }
}

function getMoodText(mood: string) {
  switch (mood) {
    case 'excellent': return 'Excellent';
    case 'bon': return 'Bon';
    case 'moyen': return 'Moyen';
    case 'mauvais': return 'Mauvais';
    default: return 'Bon';
  }
}

function getOverallStatusColor(entry: any) {
  const stepStatus = entry.steps >= HEALTH_GOALS.dailySteps;
  const sleepStatus = entry.sleepHours >= HEALTH_GOALS.dailySleep;
  const waterStatus = entry.waterIntake >= HEALTH_GOALS.dailyWater;

  const goodCount = [stepStatus, sleepStatus, waterStatus].filter(Boolean).length;

  if (goodCount === 3) return 'bg-green-500';
  if (goodCount === 2) return 'bg-blue-500';
  if (goodCount === 1) return 'bg-orange-500';
  return 'bg-red-500';
}

function getOverallStatusTextColor(entry: any) {
  const stepStatus = entry.steps >= HEALTH_GOALS.dailySteps;
  const sleepStatus = entry.sleepHours >= HEALTH_GOALS.dailySleep;
  const waterStatus = entry.waterIntake >= HEALTH_GOALS.dailyWater;

  const goodCount = [stepStatus, sleepStatus, waterStatus].filter(Boolean).length;

  if (goodCount === 3) return 'text-green-700';
  if (goodCount === 2) return 'text-blue-700';
  if (goodCount === 1) return 'text-orange-700';
  return 'text-red-700';
}

function getOverallStatusText(entry: any) {
  const stepStatus = entry.steps >= HEALTH_GOALS.dailySteps;
  const sleepStatus = entry.sleepHours >= HEALTH_GOALS.dailySleep;
  const waterStatus = entry.waterIntake >= HEALTH_GOALS.dailyWater;

  const goodCount = [stepStatus, sleepStatus, waterStatus].filter(Boolean).length;

  if (goodCount === 3) return 'Excellent';
  if (goodCount === 2) return 'Bon';
  if (goodCount === 1) return 'Moyen';
  return 'À améliorer';
}

function editEntry(entry: any) {
  // TODO: Implémenter l'édition
  console.log('Éditer:', entry);
}

function deleteEntry(id: string) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
    removeEntry(id);
  }
}
</script>
