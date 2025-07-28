import { ref, computed } from 'vue';

interface HealthEntry {
  id: string;
  date: string;
  steps: number;
  sleepHours: number;
  waterIntake: number; // en litres
  mood: 'excellent' | 'bon' | 'moyen' | 'mauvais';
  notes?: string;
}

interface HealthStats {
  avgSteps: number;
  avgSleepHours: number;
  avgWaterIntake: number;
  totalEntries: number;
  currentStreak: number;
  weeklyProgress: {
    steps: number[];
    sleep: number[];
    water: number[];
  };
}

const STORAGE_KEY = 'health-entries';

// Objectifs recommandés
const HEALTH_GOALS = {
  dailySteps: 10000,
  dailySleep: 8,
  dailyWater: 2.5, // litres
};

function loadEntries(): HealthEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries: HealthEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function calculateSleepHours(sleepStart: string, sleepEnd: string): number {
  const start = new Date(`2000-01-01T${sleepStart}`);
  const end = new Date(`2000-01-01T${sleepEnd}`);

  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
}

export function useHealthTracker() {
  const entries = ref<HealthEntry[]>(loadEntries());

  function addEntry(entry: Omit<HealthEntry, 'id' | 'date'>) {
    const newEntry: HealthEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
    };
    entries.value.push(newEntry);
    saveEntries(entries.value);
  }

  function updateEntry(id: string, updates: Partial<HealthEntry>) {
    const index = entries.value.findIndex(entry => entry.id === id);
    if (index !== -1) {
      entries.value[index] = { ...entries.value[index], ...updates };
      saveEntries(entries.value);
    }
  }

  function removeEntry(id: string) {
    entries.value = entries.value.filter(entry => entry.id !== id);
    saveEntries(entries.value);
  }

  const stats = computed((): HealthStats => {
    if (entries.value.length === 0) {
      return {
        avgSteps: 0,
        avgSleepHours: 0,
        avgWaterIntake: 0,
        totalEntries: 0,
        currentStreak: 0,
        weeklyProgress: { steps: [], sleep: [], water: [] }
      };
    }

    const avgSteps = Math.round(entries.value.reduce((sum, entry) => sum + entry.steps, 0) / entries.value.length);
    const avgSleepHours = Math.round((entries.value.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.value.length) * 10) / 10;
    const avgWaterIntake = Math.round((entries.value.reduce((sum, entry) => sum + entry.waterIntake, 0) / entries.value.length) * 10) / 10;

    // Calculer la série actuelle
    let currentStreak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const sortedEntries = [...entries.value].sort((a, b) => b.date.localeCompare(a.date));

    for (const entry of sortedEntries) {
      if (entry.date <= today) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Progression hebdomadaire (7 derniers jours)
    const weeklyProgress = { steps: [] as number[], sleep: [] as number[], water: [] as number[] };
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().slice(0, 10));
    }

    last7Days.forEach(date => {
      const entry = entries.value.find(e => e.date === date);
      weeklyProgress.steps.push(entry?.steps || 0);
      weeklyProgress.sleep.push(entry?.sleepHours || 0);
      weeklyProgress.water.push(entry?.waterIntake || 0);
    });

    return {
      avgSteps,
      avgSleepHours,
      avgWaterIntake,
      totalEntries: entries.value.length,
      currentStreak,
      weeklyProgress
    };
  });

  const todayEntry = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return entries.value.find(entry => entry.date === today);
  });

  const healthStatus = computed(() => {
    const today = todayEntry.value;
    if (!today) return { status: 'no-data', message: 'Aucune donnée aujourd\'hui' };

    const stepStatus = today.steps >= HEALTH_GOALS.dailySteps ? 'good' : 'needs-improvement';
    const sleepStatus = today.sleepHours >= HEALTH_GOALS.dailySleep ? 'good' : 'needs-improvement';
    const waterStatus = today.waterIntake >= HEALTH_GOALS.dailyWater ? 'good' : 'needs-improvement';

    const goodCount = [stepStatus, sleepStatus, waterStatus].filter(s => s === 'good').length;

    if (goodCount === 3) return { status: 'excellent', message: 'Excellent ! Tous vos objectifs sont atteints' };
    if (goodCount === 2) return { status: 'good', message: 'Bon travail ! Continuez comme ça' };
    if (goodCount === 1) return { status: 'fair', message: 'Pas mal, mais il y a encore du travail' };
    return { status: 'needs-work', message: 'Il faut améliorer plusieurs aspects' };
  });

  return {
    entries,
    stats,
    todayEntry,
    healthStatus,
    addEntry,
    updateEntry,
    removeEntry,
    calculateSleepHours,
    HEALTH_GOALS
  };
}
