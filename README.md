# Health App

Application Vue 3 (Composition API + TypeScript) pour le suivi personnel de santé.

## Modules principaux

- **Journal de santé quotidien** : sommeil, humeur, hydratation, symptômes
- **Journal alimentaire** : repas, calories, photos, suggestions recettes
- **Suivi d’activité physique** : activités, objectifs, progression

## Structure du projet

```
src/
  assets/
  components/
    common/         # Composants réutilisables
    layout/         # Layout principal
  composables/      # Composables personnalisés (useSleepTracker, useMeals...)
  modules/
    health/
      components/
      views/
    nutrition/
      components/
      views/
    fitness/
      components/
      views/
  router/
  store/
  App.vue
  main.ts
  tailwind.css
```

## Stack technique

- Vue 3 + TypeScript
- Vue Router
- Pinia
- Tailwind CSS
- Chart.js
- VueUse
- localStorage (persistance locale)

## Démarrage

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer le serveur de dev :
   ```bash
   npm run dev
   ```

---

**Développé avec amour pour le suivi santé !**
