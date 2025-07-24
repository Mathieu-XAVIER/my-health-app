import { ref, computed } from 'vue';

export interface Activity {
  id: string;
  type: string;
  duration: number;
  intensity: string;
  date: string;
  time: string;
}

const STORAGE_KEY = 'activities';

function loadActivities(): Activity[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveActivities(activities: Activity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

export function useFitnessTracker() {
  const activities = ref<Activity[]>(loadActivities());

  function addActivity({ type, duration, intensity, date, time }: { type: string; duration: number; intensity: string; date?: string; time?: string }) {
    const now = new Date();
    const activity: Activity = {
      id: Math.random().toString(36).slice(2, 10),
      type,
      duration,
      intensity,
      date: date || now.toISOString().slice(0, 10),
      time: time || now.toTimeString().slice(0,5),
    };
    activities.value.push(activity);
    saveActivities(activities.value);
  }

  function removeActivity(id: string) {
    activities.value = activities.value.filter(a => a.id !== id);
    saveActivities(activities.value);
  }

  const today = new Date().toISOString().slice(0, 10);
  const activitiesToday = computed(() => activities.value.filter(a => a.date === today));

  return {
    activities,
    activitiesToday,
    addActivity,
    removeActivity,
  };
}
