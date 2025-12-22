<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { CardSet } from './types'
import { DEFAULT_CATEGORIES, createNewCard, DefaultCardSet } from './types'
import PrintableCard from './components/PrintableCard.vue'
import questionsCardImg from './assets/trivia_pursuite_questions_blank.png'
import answersCardImg from './assets/trivia_pursuite_answers_blank.png'
import { provideImageSources } from './components/Canvas/imageSources'
import CardSetPanel from './components/CardSetPanel.vue'
import CardSetSettings from './components/CardSetSettings.vue'
import { useEventListener, useLocalStorage, watchDebounced } from '@vueuse/core'
import { validateCardSets } from './localStorage'
import { importCardSet } from './cardSetImporter'
import CardSetsDropImporter from './components/CardSetsDropImporter.vue'

const showSettings = ref(false)
const showCardSetDropdown = ref(false)


const cardSetsLocalStorage = useLocalStorage<CardSet[]>('cardSets', [JSON.parse(JSON.stringify(DefaultCardSet))], {
  serializer: {
    read: (raw) => validateCardSets(JSON.parse(raw)),
    write: (value) => JSON.stringify(value)
  }
})
const cardSets = ref<CardSet[]>(JSON.parse(JSON.stringify(cardSetsLocalStorage.value)))

const selectedCardSetId = ref<string | null>(cardSets.value[0]?.id ?? null)
const selectedCardSet = computed<CardSet | null>({
  get: () => cardSets.value.find(set => set.id === selectedCardSetId.value) ?? null,

  set: (value: CardSet | null) => {
    if (!value) {
      selectedCardSetId.value = null
      return
    }

    const selectedCardSetIndex = cardSets.value.findIndex(set => set.id === selectedCardSetId.value)

    if (selectedCardSetIndex !== -1) {
      cardSets.value[selectedCardSetIndex] = value
    } else {
      cardSets.value.push(value)
    }
  }
})

watchDebounced(cardSets, (newCardSets) => {
  cardSetsLocalStorage.value = JSON.parse(JSON.stringify(newCardSets))
}, { debounce: 500, deep: true })

function selectCardSet(cardSetId: string) {
  selectedCardSetId.value = cardSetId
  showCardSetDropdown.value = false
}

function addNewCardSet() {
  const newCardSet: CardSet = {
    id: `card-set-${crypto.randomUUID()}`,
    name: `Card Set ${cardSets.value.length + 1}`,
    defaultCategories: DEFAULT_CATEGORIES.map(cat => ({ ...cat, id: `category-${crypto.randomUUID()}` })),
    cards: []
  }
  newCardSet.cards.push(createNewCard([], newCardSet.defaultCategories))
  cardSets.value.push(newCardSet)
  selectedCardSetId.value = newCardSet.id
  showCardSetDropdown.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.card-set-dropdown')) {
    showCardSetDropdown.value = false
  }
}

function removeCardSet(cardSetId: string) {
  const cardSetIndex = cardSets.value.findIndex(set => set.id === cardSetId)
  const nextIndex = cardSetIndex === 0 ? 0 : cardSetIndex === cardSets.value.length - 1 ? cardSetIndex - 1 : cardSetIndex

  if (cardSetIndex === -1) {
    return
  }

  cardSets.value.splice(cardSetIndex, 1)

  if (nextIndex !== -1) {
    selectedCardSetId.value = cardSets.value[nextIndex]?.id ?? null
  } else {
    selectedCardSetId.value = null
  }

  showSettings.value = false
}

const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInputRef.value?.click()
}

function processImportFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    const imported = importCardSet(content)
    if (imported) {
      // Generate new ID to avoid conflicts
      imported.id = `card-set-${crypto.randomUUID()}`
      cardSets.value.push(imported)
      selectedCardSetId.value = imported.id
      showCardSetDropdown.value = false
    } else {
      alert('Failed to import card set. Please check the file format.')
    }
  }
  reader.readAsText(file)
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  processImportFile(file)
  
  // Reset the input so the same file can be imported again
  target.value = ''
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

useEventListener(document, 'click', handleClickOutside)

provideImageSources(questionImage, answerImage)
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col print:hidden">
    <!-- Header -->
    <header class="px-4 py-2 bg-slate-900/90 border-b border-slate-700/30 flex justify-between backdrop-blur-sm sticky top-0 z-50">
      <div class="self-center">
        <h1 class="text-base font-bold bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent inline mr-2">Trivia Pursuit Card Creator</h1>
        <span class="text-xs text-slate-500">Family Edition</span>
      </div>

        <!-- Card Set Dropdown with Settings -->
        <div class="relative card-set-dropdown flex ml-auto mr-4">
          <button
            @click="showCardSetDropdown = !showCardSetDropdown"
            class="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-l-md text-sm cursor-pointer transition-all hover:bg-slate-700/60 hover:border-slate-600/50 min-w-[180px]"
          >
            <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span class="flex-1 text-left truncate text-slate-200" :class="{ 'italic font-light': selectedCardSet === null }">{{ selectedCardSet?.name ?? 'Select a card set' }}</span>
            <svg 
              class="w-4 h-4 text-slate-400 transition-transform duration-200" 
              :class="{ 'rotate-180': showCardSetDropdown }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button 
            @click="showSettings = true" 
            class="flex items-center px-2 py-1.5 bg-slate-800/80 border border-l-0 border-slate-700/50 rounded-r-md text-slate-400 cursor-pointer transition-all hover:bg-slate-700/60 hover:text-amber-400 hover:border-slate-600/50"
            title="Card Set Settings"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="showCardSetDropdown"
              class="absolute top-full left-0 mt-1 w-full min-w-[220px] bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl shadow-black/30 overflow-hidden z-50"
            >
              <!-- Existing Card Sets -->
              <div class="max-h-[240px] overflow-y-auto">
                <button
                  v-for="cardSet in cardSets"
                  :key="cardSet.id"
                  @click="selectCardSet(cardSet.id)"
                  class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left cursor-pointer transition-colors"
                  :class="cardSet.id === selectedCardSetId ? 'bg-amber-500/15 text-amber-400' : 'text-slate-300 hover:bg-slate-700/60'"
                >
                  <svg 
                    v-if="cardSet.id === selectedCardSetId"
                    class="w-4 h-4 text-amber-500 shrink-0" 
                    fill="currentColor" viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <div v-else class="w-4 h-4 shrink-0"></div>
                  <span class="truncate">{{ cardSet.name }}</span>
                  <span class="ml-auto text-xs text-slate-500">{{ cardSet.cards.length }} cards</span>
                </button>
              </div>

              <!-- Divider -->
              <div class="border-t border-slate-700/50"></div>

              <!-- Add New Card Set -->
              <button
                @click="addNewCardSet"
                class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left cursor-pointer transition-colors text-emerald-400 hover:bg-emerald-500/10"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New Card Set</span>
              </button>

              <!-- Import Card Set -->
              <button
                @click="triggerImport"
                class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left cursor-pointer transition-colors text-sky-400 hover:bg-sky-500/10"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Import Card Set</span>
              </button>
            </div>
          </Transition>
        </div>
      <div class="flex items-center gap-3">
        <button 
          @click="handlePrint" 
          class="flex items-center gap-1 px-3 py-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-md font-semibold text-xs cursor-pointer transition-all shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/35"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>
    </header>

    <!-- Main Content - Card Grid -->
    <main class="flex-1 overflow-y-auto p-3 print:hidden pb-80">
      <CardSetPanel v-if="selectedCardSet" v-model:card-set="selectedCardSet" />
      <div v-else class="flex items-center justify-center h-full py-20">
        <p class="text-slate-500 text-center">No card set selected. Please select a card set to continue.</p>
      </div>
    </main>
  </div>

  <!-- Print version -->
  <div v-if="selectedCardSet" class="hidden print:block">
      <PrintableCard
        v-for="card in selectedCardSet.cards" :key="card.id"
        :card="card"
      />
  </div>

  <CardSetSettings
    v-if="selectedCardSet"
    v-model:open="showSettings"
    v-model:card-set="selectedCardSet"
    @remove="removeCardSet(selectedCardSet.id)"
  />

  <!-- Hidden file input for import -->
  <input
    ref="fileInputRef"
    type="file"
    accept=".json"
    class="hidden"
    @change="handleFileImport"
  />

  <CardSetsDropImporter @import="processImportFile" />
</template>
