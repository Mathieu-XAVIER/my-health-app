import { ref, computed } from 'vue';

interface Meal {
  id: string;
  time: string;
  desc: string;
  date: string;
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

  function addMeal({ time, desc }: { time: string; desc: string }) {
    const meal: Meal = {
      id: Math.random().toString(36).slice(2, 10),
      time,
      desc,
      date: new Date().toISOString().slice(0, 10),
    };
    meals.value.push(meal);
    saveMeals(meals.value);
  }

  const today = new Date().toISOString().slice(0, 10);
  const mealsToday = computed(() => meals.value.filter(m => m.date === today));

  return {
    meals,
    mealsToday,
    addMeal,
  };
}
