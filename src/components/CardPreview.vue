<script setup lang="ts">
import type { Category } from '../types'
import QuestionCardCanvas from './Canvas/QuestionCardCanvas.vue';
import AnswerCardCanvas from './Canvas/AnswerCardCanvas.vue';

defineProps<{
  categories: Category[]
}>()
</script>

<template>
  <div class="bg-slate-800/50 border border-slate-700/30 grid-cols-1 grid-flow-row grid gap-2 p-2 2xl:grid-cols-2">
    <QuestionCardCanvas
      :categories="categories"
    />

    <AnswerCardCanvas
      :categories="categories"
    />
  </div>
</template>
