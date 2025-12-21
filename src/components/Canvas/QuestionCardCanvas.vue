<script setup lang="ts">
import { useTemplateRef, watchEffect } from 'vue'
import type { Category } from '../../types'
import { CARD_WIDTH, CARD_HEIGHT } from '../../types'
import { drawCard } from './canvasUtil';
import { useImageSources } from './imageSources';

const props = defineProps<{
  categories: Category[]
}>()

const canvasRef = useTemplateRef('canvas')
const { questions } = useImageSources()

function draw(ctx: CanvasRenderingContext2D, categories: Category[]) {
  if (!questions.value) return

  drawCard(questions.value, ctx, categories, {
    topPadding: 35,
    bottomPadding: 35,
    xOffset: 70,
    cardWidth: CARD_WIDTH,
    cardHeight: CARD_HEIGHT,
    textGetter: (cat: Category) => cat.question,
    placeholderTextGetter: (cat: Category) => `Enter question for ${cat.letter}...`
  })
}

// Use watchEffect to automatically track all reactive dependencies
watchEffect(() => {
  if (!questions.value) return
  
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Access categories to create dependency tracking
  const categories = props.categories.map(c => ({ ...c }))

  draw(ctx, categories)
})
</script>

<template>
  <canvas 
    ref="canvas" 
    :width="CARD_WIDTH" 
    :height="CARD_HEIGHT"
    style="width: 100%; height: auto;"
  />
</template>
