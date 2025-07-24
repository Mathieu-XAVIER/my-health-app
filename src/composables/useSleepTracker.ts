import { ref, computed } from 'vue';

interface SleepEntry {
  sleepStart: string;
  sleepEnd: string;
  date: string;
}

const STORAGE_KEY = 'sleep-entries';

function loadEntries(): SleepEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries: SleepEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useSleepTracker() {
  const entries = ref<SleepEntry[]>(loadEntries());

  function addEntry({ sleepStart, sleepEnd }: { sleepStart: string; sleepEnd: string }) {
    const entry: SleepEntry = {
      sleepStart,
      sleepEnd,
      date: new Date().toISOString().slice(0, 10),
    };
    entries.value.push(entry);
    saveEntries(entries.value);
  }

  const lastEntry = computed(() => entries.value[entries.value.length - 1]);

  return {
    entries,
    lastEntry,
    addEntry,
  };
}
