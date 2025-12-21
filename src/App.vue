<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue'
import type { Card, AppSettings } from './types'
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, STORAGE_KEYS, createNewCard } from './types'
import CardInput from './components/CardInput.vue'
import CardPreview from './components/CardPreview.vue'
import PrintableCard from './components/PrintableCard.vue'
import SettingsModal from './components/SettingsModal.vue'
import questionsCardImg from './assets/trivia_pursuite_questions_blank.png'
import answersCardImg from './assets/trivia_pursuite_answers_blank.png'
import { provideImageSources } from './components/Canvas/imageSources'

// Settings state
const settings = ref<AppSettings>(loadSettings())
const showSettings = ref(false)

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.settings)
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.warn('Failed to load settings:', e)
  }
  return { ...DEFAULT_SETTINGS }
}

function saveSettingsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings.value))
  } catch (e) {
    console.warn('Failed to save settings:', e)
  }
}

function updateSettings(newSettings: AppSettings) {
  settings.value = newSettings
  saveSettingsToStorage()
  updatePrintStyles()
}

// Dynamic print styles
function updatePrintStyles() {
  let styleEl = document.getElementById('dynamic-print-styles')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'dynamic-print-styles'
    document.head.appendChild(styleEl)
  }
}

// Initialize print styles on mount
onMounted(() => {
  updatePrintStyles()
})

// Multi-card state
const cards = ref<Card[]>(loadCards())

function loadCards(): Card[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.cards)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to load cards:', e)
  }
  return [{
    id: 'card-1',
    name: 'Card 1',
    categories: DEFAULT_CATEGORIES.map(cat => ({ ...cat }))
  }]
}

function saveCardsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.cards, JSON.stringify(cards.value))
  } catch (e) {
    console.warn('Failed to save cards:', e)
  }
}

// Auto-save cards when they change
watch(cards, saveCardsToStorage, { deep: true })

const editingCategoryId = ref<string | null>(null)

function addCard() {
  const newCard = createNewCard(cards.value, settings.value.defaultCategories)
  cards.value.push(newCard)
}

function updateCard(cardIndex: number, card: Card) {
  cards.value[cardIndex] = card
}

function removeCard(cardIndex: number) {
  if (cards.value.length <= 1) return
  cards.value.splice(cardIndex, 1)
}

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
        <span class="text-xs text-slate-500">{{ cards.length }} card{{ cards.length !== 1 ? 's' : '' }}</span>
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
          @click="addCard" 
          class="flex items-center gap-1 px-3 py-1.5 bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-md font-medium text-xs cursor-pointer transition-all hover:bg-amber-500/25"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Card
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
      <div class="flex flex-col gap-3 mx-auto ">
        <!-- Each card row: Input + Preview -->
        <div 
          v-for="(card, index) in cards" 
          :key="card.id"
          class="grid grid-cols-[4fr_3fr] gap-3 items-stretch 2xl:grid-cols-[1fr_2fr]"
        >
          <!-- Card Input -->
          <CardInput
            :card="card"
            @update:card="updateCard(index, $event)"
            v-model:editing-category-id="editingCategoryId"
            :can-delete="cards.length > 1"
            @remove="removeCard(index)"
          />
          
          <!-- Card Preview -->
          <CardPreview
              :categories="card.categories"
            />
        </div>

        <!-- Add Card Row -->
        <button 
          @click="addCard" 
          class="flex items-center justify-center gap-1.5 py-3 border border-dashed border-slate-600/40 rounded-lg text-slate-500 bg-transparent text-xs font-medium cursor-pointer transition-all hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Card
        </button>
      </div>
    </main>
  </div>

  <!-- Print version -->
  <div class="hidden print:block">
      <PrintableCard
        v-for="card in cards" :key="card.id"
        :card="card"
      />
  </div>

  <!-- Settings Modal -->
  <SettingsModal 
    v-model:open="showSettings"
    :settings="settings"
    @update:settings="updateSettings"
  />
</template>
