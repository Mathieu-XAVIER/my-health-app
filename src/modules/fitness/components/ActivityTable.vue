<template>
  <div>
    <table class="min-w-full bg-white rounded-xl shadow overflow-hidden">
      <thead>
        <tr>
          <th @click="sort('type')" class="px-4 py-2 cursor-pointer text-center">
            Type
            <span v-if="sortKey === 'type'">{{ sortAsc ? '▲' : '▼' }}</span>
          </th>
          <th @click="sort('date')" class="px-4 py-2 cursor-pointer text-center">
            Date
            <span v-if="sortKey === 'date'">{{ sortAsc ? '▲' : '▼' }}</span>
          </th>
          <th @click="sort('time')" class="px-4 py-2 cursor-pointer text-center">
            Heure
            <span v-if="sortKey === 'time'">{{ sortAsc ? '▲' : '▼' }}</span>
          </th>
          <th @click="sort('duration')" class="px-4 py-2 cursor-pointer text-center">
            Durée
            <span v-if="sortKey === 'duration'">{{ sortAsc ? '▲' : '▼' }}</span>
          </th>
          <th @click="sort('intensity')" class="px-4 py-2 cursor-pointer text-center">
            Intensité
            <span v-if="sortKey === 'intensity'">{{ sortAsc ? '▲' : '▼' }}</span>
          </th>
          <th class="px-4 py-2 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in sortedActivities" :key="a.id" class="border-t">
          <td class="px-4 py-2 text-center">{{ a.type }}</td>
          <td class="px-4 py-2 text-center">{{ formatDate(a.date) }}</td>
          <td class="px-4 py-2 text-center">{{ a.time }}</td>
          <td class="px-4 py-2 text-center">{{ formatDuration(a.duration) }}</td>
          <td class="px-4 py-2 text-center">{{ a.intensity }}</td>
          <td class="px-4 py-2 text-center">
            <button @click="$emit('edit', a)" class="text-xs text-blue-500 hover:underline mr-2">Modifier</button>
            <button @click="$emit('remove', a.id)" class="text-xs text-red-500 hover:underline">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
const props = defineProps<{ activities: any[] }>();
const emit = defineEmits(['remove', 'edit']);

const sortKey = ref('date');
const sortAsc = ref(false);

function sort(key: string) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDuration(duration: number) {
  if (!duration && duration !== 0) return '';
  const h = Math.floor(duration / 60);
  const min = duration % 60;
  if (h > 0) return `${h}h${min > 0 ? ' ' + min + ' min' : ''}`;
  return `${min} min`;
}

const sortedActivities = computed(() => {
  return [...props.activities].sort((a, b) => {
    if (a[sortKey.value] < b[sortKey.value]) return sortAsc.value ? -1 : 1;
    if (a[sortKey.value] > b[sortKey.value]) return sortAsc.value ? 1 : -1;
    return 0;
  });
});
</script>
