import { ref, computed } from 'vue';

interface Meal {
  id: string;
  time: string;
  desc: string;
  date: string;
  category: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
  calories?: number;
  notes?: string;
}

const STORAGE_KEY = 'meals';

function loadMeals(): Meal[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveMeals(meals: Meal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

export function useMeals() {
  const meals = ref<Meal[]>(loadMeals());

  function addMeal({ time, desc, date, category, calories, notes }: { time: string; desc: string; date?: string; category: Meal['category']; calories?: number; notes?: string }) {
    const meal: Meal = {
      id: Math.random().toString(36).slice(2, 10),
      time,
      desc,
      date: date || new Date().toISOString().slice(0, 10),
      category,
      calories,
      notes,
    };
    meals.value.push(meal);
    saveMeals(meals.value);
  }

  function updateMeal(id: string, updates: Partial<Omit<Meal, 'id'>>) {
    const idx = meals.value.findIndex(m => m.id === id);
    if (idx !== -1) {
      meals.value[idx] = { ...meals.value[idx], ...updates };
      saveMeals(meals.value);
    }
  }

  function removeMeal(id: string) {
    meals.value = meals.value.filter(m => m.id !== id);
    saveMeals(meals.value);
  }

  function getMealsByDate(date: string) {
    return meals.value.filter(m => m.date === date);
  }

  const today = new Date().toISOString().slice(0, 10);
  const mealsToday = computed(() => meals.value.filter(m => m.date === today));

  return {
    meals,
    mealsToday,
    addMeal,
    updateMeal,
    removeMeal,
    getMealsByDate,
  };
}
