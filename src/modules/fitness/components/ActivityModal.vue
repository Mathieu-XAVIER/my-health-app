<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
      <h3 class="text-xl font-bold text-purple-700 mb-4">{{ activity ? 'Modifier' : 'Ajouter' }} une activité</h3>
      <form @submit.prevent="submit" class="flex flex-col gap-4">
        <input type="text" v-model="type" class="input" placeholder="Type (course, yoga...)" required />
        <input type="number" v-model.number="duration" class="input" placeholder="Durée (min)" required min="1" />
        <select v-model="intensity" class="input" required>
          <option value="">Intensité</option>
          <option value="faible">Faible</option>
          <option value="moyenne">Moyenne</option>
          <option value="forte">Forte</option>
        </select>
        <input type="date" v-model="date" class="input" required />
        <input type="time" v-model="time" class="input" required />
        <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 py-2 shadow transition">{{ activity ? 'Enregistrer' : 'Ajouter' }}</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{ open: boolean, activity?: any }>();
const emit = defineEmits(['close', 'add', 'update']);

const type = ref('');
const duration = ref<number | null>(null);
const intensity = ref('');
const date = ref<string>('');
const time = ref<string>('');

watch(() => props.open, (val) => {
  if (val) {
    if (props.activity) {
      type.value = props.activity.type;
      duration.value = props.activity.duration;
      intensity.value = props.activity.intensity;
      date.value = props.activity.date;
      time.value = props.activity.time;
    } else {
      type.value = '';
      duration.value = null;
      intensity.value = '';
      date.value = new Date().toISOString().slice(0, 10);
      time.value = new Date().toTimeString().slice(0,5);
    }
  }
});

function submit() {
  if (!type.value || !duration.value || !intensity.value || !date.value || !time.value) return;
  const payload = { type: type.value, duration: duration.value, intensity: intensity.value, date: date.value, time: time.value };
  if (props.activity) {
    emit('update', { ...props.activity, ...payload });
  } else {
    emit('add', payload);
  }
  emit('close');
}
</script>

<style scoped>
.input {
  @apply border border-purple-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-200 transition;
}
</style>
