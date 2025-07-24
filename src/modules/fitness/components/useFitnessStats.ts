import { computed } from 'vue';
import { useFitnessTracker } from '../../../composables/useFitnessTracker';

function getIntensityLabel(avg: number) {
  if (avg < 1.5) return 'Faible';
  if (avg < 2.5) return 'Moyenne';
  return 'Forte';
}

export function useFitnessStats() {
  const { activitiesToday } = useFitnessTracker();

  const stats = computed(() => {
    const acts = activitiesToday.value;
    const count = acts.length;
    const totalDuration = acts.reduce((sum, a) => sum + a.duration, 0);
    // Type le plus fréquent
    const freq: Record<string, number> = {};
    acts.forEach(a => { freq[a.type] = (freq[a.type] || 0) + 1; });
    let mostFrequentType = '';
    let max = 0;
    for (const t in freq) {
      if (freq[t] > max) { max = freq[t]; mostFrequentType = t; }
    }
    // Intensité moyenne
    const intensityMap: Record<string, number> = { 'faible': 1, 'moyenne': 2, 'forte': 3 };
    const avgIntensityNum = count ? acts.reduce((sum, a) => sum + (intensityMap[a.intensity] || 0), 0) / count : 0;
    const avgIntensity = count ? getIntensityLabel(avgIntensityNum) : '-';
    return { count, totalDuration, mostFrequentType, avgIntensity };
  });

  return { stats };
}
