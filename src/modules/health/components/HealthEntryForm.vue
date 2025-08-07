<template>
  <div class="bg-white border border-blue-200 rounded-2xl shadow-lg p-6 mb-8">
    <h3 class="text-xl font-bold text-blue-700 mb-6">Ajouter mes données de santé</h3>

    <form @submit.prevent="saveEntry" class="space-y-6">
      <!-- Sélection de la date -->
      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">
          <span class="flex items-center gap-2">
            <span class="text-xl">📅</span>
            Date de l'entrée
          </span>
        </label>
        <input
          type="date"
          v-model="dateValue"
          :max="today"
          class="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-600 transition"
        />
      </div>
      <!-- Pas quotidiens -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            <span class="flex items-center gap-2">
              <span class="text-xl">👟</span>
              Nombre de pas aujourd'hui
            </span>
          </label>
          <div class="relative">
            <input
              type="number"
              v-model.number="formData.steps"
              min="0"
              max="50000"
              class="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-600 transition"
              placeholder="Ex: 8500"
            />
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              pas
            </div>
          </div>
          <div class="mt-1 text-sm text-gray-600">
            Objectif: {{ HEALTH_GOALS.dailySteps.toLocaleString() }} pas
          </div>
        </div>

        <!-- Sommeil -->
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            <span class="flex items-center gap-2">
              <span class="text-xl">😴</span>
              Heures de sommeil
            </span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Heure de coucher</label>
              <input
                type="time"
                v-model="sleepStart"
                class="w-full border-2 border-blue-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Heure de réveil</label>
              <input
                type="time"
                v-model="sleepEnd"
                class="w-full border-2 border-blue-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-600 transition"
              />
            </div>
          </div>
          <div class="mt-1 text-sm text-gray-600">
            Calculé: {{ calculatedSleepHours }}h (Objectif: {{ HEALTH_GOALS.dailySleep }}h)
          </div>
        </div>
      </div>

      <!-- Hydratation et Humeur -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            <span class="flex items-center gap-2">
              <span class="text-xl">💧</span>
              Hydratation (litres)
            </span>
          </label>
          <div class="relative">
            <input
              type="number"
              v-model.number="formData.waterIntake"
              min="0"
              max="10"
              step="0.1"
              class="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-600 transition"
              placeholder="Ex: 2.5"
            />
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              L
            </div>
          </div>
          <div class="mt-1 text-sm text-gray-600">
            Objectif: {{ HEALTH_GOALS.dailyWater }}L
          </div>
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-2">
            <span class="flex items-center gap-2">
              <span class="text-xl">😊</span>
              Humeur du jour
            </span>
          </label>
          <select
            v-model="formData.mood"
            class="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-600 transition"
          >
            <option value="excellent">😊 Excellent</option>
            <option value="bon">🙂 Bon</option>
            <option value="moyen">😐 Moyen</option>
            <option value="mauvais">😔 Mauvais</option>
          </select>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-gray-700 font-medium mb-2">
          <span class="flex items-center gap-2">
            <span class="text-xl">📝</span>
            Notes (optionnel)
          </span>
        </label>
        <textarea
          v-model="formData.notes"
          rows="3"
          class="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-600 transition resize-none"
          placeholder="Comment vous sentez-vous aujourd'hui ? Avez-vous des observations particulières ?"
        ></textarea>
      </div>

      <!-- Boutons -->
      <div class="flex gap-4 pt-4">
        <button
          type="submit"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 text-lg font-semibold shadow-lg transition duration-200 transform hover:scale-105"
          :disabled="!isFormValid"
        >
          <span class="flex items-center justify-center gap-2">
            <span>💾</span>
            Enregistrer mes données
          </span>
        </button>

        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition"
        >
          Réinitialiser
        </button>
      </div>
    </form>

    <!-- Message de succès -->
    <div v-if="showSuccess" class="mt-4 p-4 bg-green-100 border border-green-200 rounded-xl">
      <div class="flex items-center gap-3">
        <span class="text-2xl">✅</span>
        <div>
          <h4 class="font-semibold text-green-800">Données enregistrées !</h4>
          <p class="text-sm text-green-700">Vos données de santé ont été sauvegardées avec succès.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useHealthTracker } from '../../../composables/useHealthTracker';

const { addEntry, todayEntry, HEALTH_GOALS } = useHealthTracker();

const today = new Date().toISOString().slice(0, 10);
const dateValue = ref(today);

const formData = ref({
  steps: 0,
  sleepHours: 0,
  waterIntake: 0,
  mood: 'bon' as 'excellent' | 'bon' | 'moyen' | 'mauvais',
  notes: ''
});

const sleepStart = ref('');
const sleepEnd = ref('');
const showSuccess = ref(false);

// Calculer automatiquement les heures de sommeil
const calculatedSleepHours = computed(() => {
  if (!sleepStart.value || !sleepEnd.value) return 0;

  const start = new Date(`2000-01-01T${sleepStart.value}`);
  const end = new Date(`2000-01-01T${sleepEnd.value}`);

  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
});

// Mettre à jour les heures de sommeil calculées
watch(calculatedSleepHours, (newValue) => {
  formData.value.sleepHours = newValue;
});

// Charger les données existantes si elles existent
watch(() => todayEntry.value, (entry) => {
  if (entry) {
    formData.value = {
      steps: entry.steps,
      sleepHours: entry.sleepHours,
      waterIntake: entry.waterIntake,
      mood: entry.mood,
      notes: entry.notes || ''
    };
  }
}, { immediate: true });

const isFormValid = computed(() => {
  return formData.value.steps > 0 &&
         formData.value.sleepHours > 0 &&
         formData.value.waterIntake > 0;
});

function saveEntry() {
  if (!isFormValid.value) return;

  addEntry({
    steps: formData.value.steps,
    sleepHours: formData.value.sleepHours,
    waterIntake: formData.value.waterIntake,
    mood: formData.value.mood,
    notes: formData.value.notes,
    date: dateValue.value
  });

  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);

  // Ne pas réinitialiser le formulaire si on a des données pour aujourd'hui
  if (!todayEntry.value) {
    resetForm();
  }
}

function resetForm() {
  formData.value = {
    steps: 0,
    sleepHours: 0,
    waterIntake: 0,
    mood: 'bon',
    notes: ''
  };
  sleepStart.value = '';
  sleepEnd.value = '';
  dateValue.value = today;
}
</script>
