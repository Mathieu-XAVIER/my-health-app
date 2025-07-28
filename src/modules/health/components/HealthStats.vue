<template>
  <div class="w-full">
    <!-- Cartes de statistiques principales -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10 w-full">
      <div class="bg-blue-100 rounded-2xl p-10 flex flex-col items-center shadow-lg">
        <span class="text-5xl font-extrabold text-blue-800">{{ avgSteps }}</span>
        <span class="text-base text-blue-700 mt-2">Pas moyens/jour</span>
        <div class="mt-2 text-sm">
          <span :class="isNumber(avgSteps) && avgSteps >= HEALTH_GOALS.dailySteps ? 'text-green-600' : 'text-orange-600'">
            {{ isNumber(avgSteps) && avgSteps >= HEALTH_GOALS.dailySteps ? '✓ Objectif atteint' : isNumber(avgSteps) ? `${formatValue(HEALTH_GOALS.dailySteps - avgSteps)} pas manquants` : '' }}
          </span>
        </div>
      </div>

      <div class="bg-blue-100 rounded-2xl p-10 flex flex-col items-center shadow-lg">
        <span class="text-5xl font-extrabold text-blue-800">{{ avgSleep }}</span>
        <span class="text-base text-blue-700 mt-2">Sommeil moyen</span>
        <div class="mt-2 text-sm">
          <span :class="isNumber(avgSleep) && avgSleep >= HEALTH_GOALS.dailySleep ? 'text-green-600' : 'text-orange-600'">
            {{ isNumber(avgSleep) && avgSleep >= HEALTH_GOALS.dailySleep ? '✓ Objectif atteint' : isNumber(avgSleep) ? `${formatValue(HEALTH_GOALS.dailySleep - avgSleep)}h manquantes` : '' }}
          </span>
        </div>
      </div>

      <div class="bg-blue-100 rounded-2xl p-10 flex flex-col items-center shadow-lg">
        <span class="text-5xl font-extrabold text-blue-800">{{ avgWater }}</span>
        <span class="text-base text-blue-700 mt-2">Eau moyenne/jour</span>
        <div class="mt-2 text-sm">
          <span :class="isNumber(avgWater) && avgWater >= HEALTH_GOALS.dailyWater ? 'text-green-600' : 'text-orange-600'">
            {{ isNumber(avgWater) && avgWater >= HEALTH_GOALS.dailyWater ? '✓ Objectif atteint' : isNumber(avgWater) ? `${formatValue(HEALTH_GOALS.dailyWater - avgWater)}L manquants` : '' }}
          </span>
        </div>
      </div>

      <div class="bg-blue-100 rounded-2xl p-10 flex flex-col items-center shadow-lg">
        <span class="text-5xl font-extrabold text-blue-800">{{ stats.currentStreak }}</span>
        <span class="text-base text-blue-700 mt-2">Jours consécutifs</span>
        <div class="mt-2 text-sm text-blue-600">
          {{ stats.totalEntries }} entrées totales
        </div>
      </div>
    </div>

    <!-- Statut de santé du jour -->
    <div class="bg-white border border-blue-200 rounded-2xl shadow-lg p-6 mb-8">
      <h3 class="text-xl font-bold text-blue-700 mb-4">Statut de santé aujourd'hui</h3>

      <div v-if="healthStatus.status === 'no-data'" class="text-center py-8">
        <div class="text-6xl mb-4">📊</div>
        <p class="text-gray-600 text-lg">{{ healthStatus.message }}</p>
        <p class="text-gray-500 mt-2">Ajoutez vos données pour voir votre statut</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Pas quotidiens -->
        <div class="text-center">
          <div class="text-4xl mb-2">👟</div>
          <h4 class="font-semibold text-gray-800 mb-2">Pas quotidiens</h4>
          <div class="text-3xl font-bold" :class="getStepColor()">
            {{ getDisplay(todayEntry?.steps) }}
          </div>
          <div class="text-sm text-gray-600 mt-1">
            Objectif: {{ HEALTH_GOALS.dailySteps.toLocaleString() }}
          </div>
          <div class="mt-2">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="getStepColor()"
                :style="{ width: `${Math.min((todayEntry?.steps || 0) / HEALTH_GOALS.dailySteps * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Sommeil -->
        <div class="text-center">
          <div class="text-4xl mb-2">😴</div>
          <h4 class="font-semibold text-gray-800 mb-2">Heures de sommeil</h4>
          <div class="text-3xl font-bold" :class="getSleepColor()">
            {{ getDisplay(todayEntry?.sleepHours) }}h
          </div>
          <div class="text-sm text-gray-600 mt-1">
            Objectif: {{ HEALTH_GOALS.dailySleep }}h
          </div>
          <div class="mt-2">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="getSleepColor()"
                :style="{ width: `${Math.min((todayEntry?.sleepHours || 0) / HEALTH_GOALS.dailySleep * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Hydratation -->
        <div class="text-center">
          <div class="text-4xl mb-2">💧</div>
          <h4 class="font-semibold text-gray-800 mb-2">Hydratation</h4>
          <div class="text-3xl font-bold" :class="getWaterColor()">
            {{ getDisplay(todayEntry?.waterIntake) }}L
          </div>
          <div class="text-sm text-gray-600 mt-1">
            Objectif: {{ HEALTH_GOALS.dailyWater }}L
          </div>
          <div class="mt-2">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="getWaterColor()"
                :style="{ width: `${Math.min((todayEntry?.waterIntake || 0) / HEALTH_GOALS.dailyWater * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message de statut -->
      <div v-if="healthStatus.status !== 'no-data'" class="mt-6 p-4 rounded-xl" :class="getStatusBgColor()">
        <div class="flex items-center gap-3">
          <div class="text-2xl">{{ getStatusEmoji() }}</div>
          <div>
            <h4 class="font-semibold" :class="getStatusTextColor()">{{ healthStatus.message }}</h4>
            <p class="text-sm opacity-80" :class="getStatusTextColor()">
              {{ getStatusDescription() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Progression hebdomadaire -->
    <div class="bg-white border border-blue-200 rounded-2xl shadow-lg p-6">
      <h3 class="text-xl font-bold text-blue-700 mb-4">Progression de la semaine</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 class="font-semibold text-gray-800 mb-3 text-center">Pas quotidiens</h4>
          <div class="flex flex-col">
            <div class="flex items-end justify-between h-32 gap-1 pb-2" style="max-height: 7rem;">
              <div
                v-for="(steps, index) in stats.weeklyProgress.steps"
                :key="index"
                class="flex-1 bg-blue-200 rounded-t transition-all duration-300 hover:bg-blue-300"
                :style="{ height: `${Math.max((steps / HEALTH_GOALS.dailySteps) * 100, 5)}%` }"
                :title="`${getDayName(index)}: ${steps.toLocaleString()} pas`"
              ></div>
            </div>
          </div>
          <!-- Ligne des sous-titres séparée, sous le graphique -->
          <div class="flex justify-between text-xs text-gray-500 mt-4 min-h-[1.5rem] w-full">
            <span v-for="(_, index) in stats.weeklyProgress.steps" :key="index">
              {{ getDayName(index) }}
            </span>
          </div>
        </div>
        <div>
          <h4 class="font-semibold text-gray-800 mb-3 text-center">Sommeil (heures)</h4>
          <div class="flex flex-col">
            <div class="flex items-end justify-between h-32 gap-1 pb-2" style="max-height: 7rem;">
              <div
                v-for="(sleep, index) in stats.weeklyProgress.sleep"
                :key="index"
                class="flex-1 bg-blue-200 rounded-t transition-all duration-300 hover:bg-blue-300"
                :style="{ height: `${Math.max((sleep / HEALTH_GOALS.dailySleep) * 100, 5)}%` }"
                :title="`${getDayName(index)}: ${sleep}h`"
              ></div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-4 min-h-[1.5rem] w-full">
            <span v-for="(_, index) in stats.weeklyProgress.sleep" :key="index">
              {{ getDayName(index) }}
            </span>
          </div>
        </div>
        <div>
          <h4 class="font-semibold text-gray-800 mb-3 text-center">Hydratation (L)</h4>
          <div class="flex flex-col">
            <div class="flex items-end justify-between h-32 gap-1 pb-2" style="max-height: 7rem;">
              <div
                v-for="(water, index) in stats.weeklyProgress.water"
                :key="index"
                class="flex-1 bg-blue-200 rounded-t transition-all duration-300 hover:bg-blue-300"
                :style="{ height: `${Math.max((water / HEALTH_GOALS.dailyWater) * 100, 5)}%` }"
                :title="`${getDayName(index)}: ${water}L`"
              ></div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-4 min-h-[1.5rem] w-full">
            <span v-for="(_, index) in stats.weeklyProgress.water" :key="index">
              {{ getDayName(index) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHealthTracker } from '../../../composables/useHealthTracker';
import { computed } from 'vue';

const { stats, todayEntry, healthStatus, HEALTH_GOALS, entries } = useHealthTracker();

// Moyennes intelligentes : on ne compte que les jours où la donnée est > 0
const avgSteps = computed(() => {
  const valid = entries.value.filter(e => e.steps > 0);
  if (valid.length === 0) return '-';
  return Math.round(valid.reduce((sum, e) => sum + e.steps, 0) / valid.length);
});
const avgSleep = computed(() => {
  const valid = entries.value.filter(e => e.sleepHours > 0);
  if (valid.length === 0) return '-';
  return Math.round((valid.reduce((sum, e) => sum + e.sleepHours, 0) / valid.length) * 10) / 10;
});
const avgWater = computed(() => {
  const valid = entries.value.filter(e => e.waterIntake > 0);
  if (valid.length === 0) return '-';
  return Math.round((valid.reduce((sum, e) => sum + e.waterIntake, 0) / valid.length) * 10) / 10;
});

function getDisplay(val: number | undefined) {
  return val && val > 0 ? val : '-';
}

function isNumber(val: string | number): val is number {
  return typeof val === 'number';
}

function formatValue(val: string | number, decimals = 1) {
  if (typeof val === 'number') {
    return val % 1 === 0 ? val : val.toFixed(decimals);
  }
  return val;
}

function getStepColor() {
  const steps = todayEntry.value?.steps || 0;
  if (steps >= HEALTH_GOALS.dailySteps) return 'text-green-600';
  if (steps >= HEALTH_GOALS.dailySteps * 0.7) return 'text-orange-600';
  return 'text-red-600';
}

function getSleepColor() {
  const sleep = todayEntry.value?.sleepHours || 0;
  if (sleep >= HEALTH_GOALS.dailySleep) return 'text-green-600';
  if (sleep >= HEALTH_GOALS.dailySleep * 0.8) return 'text-orange-600';
  return 'text-red-600';
}

function getWaterColor() {
  const water = todayEntry.value?.waterIntake || 0;
  if (water >= HEALTH_GOALS.dailyWater) return 'text-green-600';
  if (water >= HEALTH_GOALS.dailyWater * 0.7) return 'text-orange-600';
  return 'text-red-600';
}

function getStatusEmoji() {
  switch (healthStatus.value.status) {
    case 'excellent': return '🏆';
    case 'good': return '👍';
    case 'fair': return '😐';
    case 'needs-work': return '💪';
    default: return '📊';
  }
}

function getStatusBgColor() {
  switch (healthStatus.value.status) {
    case 'excellent': return 'bg-green-100 border-green-200';
    case 'good': return 'bg-blue-100 border-blue-200';
    case 'fair': return 'bg-orange-100 border-orange-200';
    case 'needs-work': return 'bg-red-100 border-red-200';
    default: return 'bg-gray-100 border-gray-200';
  }
}

function getStatusTextColor() {
  switch (healthStatus.value.status) {
    case 'excellent': return 'text-green-800';
    case 'good': return 'text-blue-800';
    case 'fair': return 'text-orange-800';
    case 'needs-work': return 'text-red-800';
    default: return 'text-gray-800';
  }
}

function getStatusDescription() {
  switch (healthStatus.value.status) {
    case 'excellent': return 'Continuez à maintenir ces excellentes habitudes !';
    case 'good': return 'Vous êtes sur la bonne voie, gardez le rythme !';
    case 'fair': return 'Quelques ajustements et vous atteindrez vos objectifs !';
    case 'needs-work': return 'Concentrez-vous sur vos objectifs prioritaires !';
    default: return '';
  }
}

function getDayName(index: number) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  return days[index];
}
</script>
