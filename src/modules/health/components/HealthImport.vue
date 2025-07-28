<template>
  <div class="bg-white border border-blue-200 rounded-2xl shadow-lg p-6 mb-8">
    <h3 class="text-xl font-bold text-blue-700 mb-4">Importer mes données Santé (iPhone)</h3>
    <form @submit.prevent>
      <input type="file" accept=".xml" @change="onFileChange" class="mb-4" />
      <div class="flex flex-wrap gap-4 mb-4">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="importOptions.steps" /> Pas
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="importOptions.sleep" /> Sommeil
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="importOptions.water" /> Hydratation
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="importOptions.calories" /> Calories
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="importOptions.weight" /> Poids
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="importOptions.heart" /> Fréquence cardiaque
        </label>
      </div>
    </form>
    <button
      @click="confirmDeleteAll"
      class="mt-2 mb-4 bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2 font-semibold shadow transition"
    >
      Supprimer toutes mes données
    </button>
    <div v-if="showDeleteConfirm" class="mt-2 p-4 bg-red-100 border border-red-300 rounded-xl">
      <div class="mb-2 font-semibold text-red-700">Êtes-vous sûr de vouloir supprimer <u>toutes</u> vos données santé ?</div>
      <button @click="deleteAll" class="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 mr-2">Oui, tout supprimer</button>
      <button @click="showDeleteConfirm = false" class="bg-gray-200 rounded-xl px-4 py-2">Annuler</button>
    </div>
    <div v-if="deleteSuccess" class="mt-2 p-3 bg-green-100 border border-green-200 rounded-xl text-green-700 font-semibold">
      Toutes vos données ont été supprimées.
    </div>
    <div v-if="importSummary" class="mt-4">
      <h4 class="font-semibold text-blue-700 mb-2">Résumé de l'import :</h4>
      <ul class="list-disc ml-6 text-gray-700">
        <li v-if="importSummary.days">Jours importés : <b>{{ importSummary.days }}</b></li>
        <li v-if="importSummary.ignored">Jours ignorés (déjà présents) : <b>{{ importSummary.ignored }}</b></li>
        <li v-if="importSummary.steps">Pas importés : <b>{{ importSummary.steps }}</b></li>
        <li v-if="importSummary.sleep">Nuits de sommeil importées : <b>{{ importSummary.sleep }}</b></li>
        <li v-if="importSummary.water">Entrées d'hydratation : <b>{{ importSummary.water }}</b></li>
        <li v-if="importSummary.calories">Calories brûlées : <b>{{ importSummary.calories }}</b></li>
        <li v-if="importSummary.weight">Poids enregistrés : <b>{{ importSummary.weight }}</b></li>
        <li v-if="importSummary.heart">Mesures de fréquence cardiaque : <b>{{ importSummary.heart }}</b></li>
      </ul>
      <div class="mt-2 text-green-700 font-semibold">Import terminé !</div>
    </div>
    <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHealthTracker } from '../../../composables/useHealthTracker';

const { addEntry, entries, calculateSleepHours, clearAllEntries } = useHealthTracker();

const importSummary = ref<any>(null);
const error = ref('');
const showDeleteConfirm = ref(false);
const deleteSuccess = ref(false);

const importOptions = ref({
  steps: true,
  sleep: true,
  water: true,
  calories: false,
  weight: false,
  heart: false
});

function confirmDeleteAll() {
  showDeleteConfirm.value = true;
  deleteSuccess.value = false;
}

function deleteAll() {
  clearAllEntries();
  showDeleteConfirm.value = false;
  deleteSuccess.value = true;
  importSummary.value = null;
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  error.value = '';
  importSummary.value = null;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const text = e.target?.result as string;
      await parseAppleHealthXML(text);
    } catch (err) {
      error.value = "Erreur lors de l'import : " + (err as Error).message;
    }
  };
  reader.readAsText(file);
}

async function parseAppleHealthXML(xmlString: string) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');
  const records = Array.from(xml.getElementsByTagName('Record'));

  const TYPE_STEPS = 'HKQuantityTypeIdentifierStepCount';
  const TYPE_SLEEP = 'HKCategoryTypeIdentifierSleepAnalysis';
  const TYPE_WATER = 'HKQuantityTypeIdentifierDietaryWater';
  const TYPE_CALORIES = 'HKQuantityTypeIdentifierActiveEnergyBurned';
  const TYPE_WEIGHT = 'HKQuantityTypeIdentifierBodyMass';
  const TYPE_HEART = 'HKQuantityTypeIdentifierHeartRate';

  const stepsByDate: Record<string, number> = {};
  const sleepByDate: Record<string, { start: string, end: string }[]> = {};
  const waterByDate: Record<string, number> = {};
  const caloriesByDate: Record<string, number> = {};
  const weightByDate: Record<string, number> = {};
  const heartByDate: Record<string, number[]> = {};

  let countSteps = 0, countSleep = 0, countWater = 0, countCalories = 0, countWeight = 0, countHeart = 0;

  for (const rec of records) {
    const type = rec.getAttribute('type');
    const startDate = rec.getAttribute('startDate')?.slice(0, 10) || '';
    const endDate = rec.getAttribute('endDate')?.slice(0, 10) || '';
    const value = parseFloat(rec.getAttribute('value') || '0');

    if (type === TYPE_STEPS && importOptions.value.steps) {
      stepsByDate[startDate] = (stepsByDate[startDate] || 0) + value;
      countSteps++;
    }
    if (type === TYPE_SLEEP && importOptions.value.sleep) {
      const val = rec.getAttribute('value');
      if (val === 'Asleep' || val === '4') {
        if (!sleepByDate[startDate]) sleepByDate[startDate] = [];
        sleepByDate[startDate].push({ start: rec.getAttribute('startDate')!, end: rec.getAttribute('endDate')! });
        countSleep++;
      }
    }
    if (type === TYPE_WATER && importOptions.value.water) {
      waterByDate[startDate] = (waterByDate[startDate] || 0) + value;
      countWater++;
    }
    if (type === TYPE_CALORIES && importOptions.value.calories) {
      caloriesByDate[startDate] = (caloriesByDate[startDate] || 0) + value;
      countCalories++;
    }
    if (type === TYPE_WEIGHT && importOptions.value.weight) {
      weightByDate[startDate] = value;
      countWeight++;
    }
    if (type === TYPE_HEART && importOptions.value.heart) {
      if (!heartByDate[startDate]) heartByDate[startDate] = [];
      heartByDate[startDate].push(value);
      countHeart++;
    }
  }

  let daysImported = 0;
  let daysIgnored = 0;
  Object.keys(stepsByDate).forEach(date => {
    const alreadyExists = entries.value.some(e => e.date === date);
    if (alreadyExists) {
      daysIgnored++;
      return;
    }
    const steps = Math.round(stepsByDate[date]);
    const sleepArr = sleepByDate[date] || [];
    let sleepHours = 0;
    if (sleepArr.length > 0) {
      sleepHours = sleepArr.reduce((sum, s) => {
        return sum + calculateSleepHours(s.start.slice(11, 16), s.end.slice(11, 16));
      }, 0);
    }
    const water = Math.round((waterByDate[date] || 0) * 100) / 100;
    addEntry({
      steps,
      sleepHours,
      waterIntake: water,
      mood: 'bon',
      notes: '[Importé depuis Apple Santé]',
      date // <-- on passe la date réelle !
    });
    daysImported++;
  });

  importSummary.value = {
    days: daysImported,
    ignored: daysIgnored,
    steps: countSteps,
    sleep: countSleep,
    water: countWater,
    calories: countCalories,
    weight: countWeight,
    heart: countHeart
  };
}
</script>
