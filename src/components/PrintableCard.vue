<script setup lang="ts">
import { watchEffect, useTemplateRef } from 'vue'
import type { Card, Category } from '../types'
import { CARD_WIDTH, CARD_HEIGHT } from '../types'
import { drawCard } from './Canvas/canvasUtil'
import { useImageSources } from './Canvas/imageSources';

const props = defineProps<{
  card: Card
}>()

const canvasRef = useTemplateRef('canvas')

const { questions, answers } = useImageSources()

function draw(ctx: CanvasRenderingContext2D, categories: Category[]) {
  if (!questions.value || !answers.value) return

  ctx.save()
  ctx.translate(0, 0)

  drawCard(questions.value, ctx, categories, {
    topPadding: 35,
    bottomPadding: 35,
    xOffset: 70,
    cardWidth: CARD_WIDTH,
    cardHeight: CARD_HEIGHT,
    textGetter: (cat: Category) => cat.question,
    placeholderTextGetter: () => ''
  })

  ctx.translate(CARD_WIDTH, 0)

  drawCard(answers.value, ctx, categories, {
    topPadding: 30,
    bottomPadding: 35,
    xOffset: 375,
    cardWidth: CARD_WIDTH,
    cardHeight: CARD_HEIGHT,
    textGetter: (cat: Category) => cat.answer,
    placeholderTextGetter: () => ''
  })

  ctx.restore()
}



watchEffect(() => {
  if (!questions.value || !answers.value) return

  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  draw(ctx, props.card.categories)
})
</script>

<template>
  <canvas 
    class="printable-card"
    ref="canvas" 
    :width="CARD_WIDTH * 2" 
    :height="CARD_HEIGHT"
  />
</template>

<style scoped>
.printable-card {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>

