<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { CardSet } from './types'
import { loadCardSets } from './types'
import PrintableCard from './components/PrintableCard.vue'
import questionsCardImg from './assets/trivia_pursuite_questions_blank.png'
import answersCardImg from './assets/trivia_pursuite_answers_blank.png'
import { provideImageSources } from './components/Canvas/imageSources'
import CardSetPanel from './components/CardSetPanel.vue'
import CardSetSettings from './components/CardSetSettings.vue'

const showSettings = ref(false)


const cardSets = ref<CardSet[]>(loadCardSets())
const selectedCardSetId = ref<string>(cardSets.value[0]!.id)
const selectedCardSet = computed<CardSet>({
  get: () => cardSets.value.find(set => set.id === selectedCardSetId.value) ?? cardSets.value[0]!,

  set: (value) => {
    const selectedCardSetIndex = cardSets.value.findIndex(set => set.id === selectedCardSetId.value)

    if (selectedCardSetIndex !== -1) {
      cardSets.value[selectedCardSetIndex] = value
    } else {
      cardSets.value.push(value)
    }
  }
})

function handlePrint() {
  window.print()
}

const questionImage = shallowRef<HTMLImageElement | null>(null)
const answerImage = shallowRef<HTMLImageElement | null>(null)

onMounted(() => {
  const loadingQuestionImage = new Image()
  loadingQuestionImage.onload = () => {
    questionImage.value = loadingQuestionImage
  }
  loadingQuestionImage.src = questionsCardImg

  const loadingAnswerImage = new Image()
  loadingAnswerImage.onload = () => {
    answerImage.value = loadingAnswerImage
  }
  loadingAnswerImage.src = answersCardImg
})

provideImageSources(questionImage, answerImage)
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col print:hidden">
    <!-- Header -->
    <header class="px-4 py-2 bg-slate-900/90 border-b border-slate-700/30 flex items-center justify-between backdrop-blur-sm sticky top-0 z-50">
      <div class="flex items-baseline gap-2">
        <h1 class="text-base font-bold bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Trivia Pursuit Card Creator</h1>
        <span class="text-[0.625rem] text-slate-500">Family Edition</span>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="showSettings = true" 
          class="flex items-center gap-1 px-2.5 py-1.5 text-slate-400 border border-slate-700/50 rounded-md text-xs cursor-pointer transition-all hover:bg-slate-700/50 hover:text-white"
          title="Settings"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button 
          @click="handlePrint" 
          class="flex items-center gap-1 px-3 py-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-md font-semibold text-xs cursor-pointer transition-all shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/35"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print All
        </button>
      </div>
    </header>

    <!-- Main Content - Card Grid -->
    <main class="flex-1 overflow-y-auto p-3 print:hidden pb-80">
      <CardSetPanel v-model:card-set="selectedCardSet" />
    </main>
  </div>

  <!-- Print version -->
  <div class="hidden print:block">
      <PrintableCard
        v-for="card in selectedCardSet.cards" :key="card.id"
        :card="card"
      />
  </div>

  <CardSetSettings
    v-model:open="showSettings"
    v-model:card-set="selectedCardSet"
  />
</template>
