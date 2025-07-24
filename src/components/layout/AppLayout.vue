<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur shadow flex items-center justify-between px-6 py-4">
      <h1 class="text-2xl font-bold text-blue-700 tracking-tight">Health App</h1>
      <nav class="flex gap-6">
        <router-link to="/health" class="nav-link">Santé</router-link>
        <router-link to="/nutrition" class="nav-link">Alimentation</router-link>
        <router-link to="/fitness" class="nav-link">Activité</router-link>
      </nav>
    </header>
    <main class="flex-1 px-8 py-6 mx-auto w-full">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.nav-link {
  @apply text-gray-700 hover:text-blue-600 font-medium transition;
}
</style>
