<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { createNewCard, type Card, type CardSet } from '../types';
import CardInput from './CardInput.vue';
import CardPreview from './CardPreview.vue';


const cardSet = defineModel<CardSet>('cardSet', {
  required: true
})

const editingCategoryId = ref<string | null>(null)

watch(() => cardSet.value.id, () => {
  editingCategoryId.value = null
})

const cards = computed({
  get: () => cardSet.value.cards,
  set: (value) => {
    cardSet.value.cards = value
  }
})

function addCard() {
  const newCard = createNewCard(cards.value, cardSet.value.defaultCategories)
  cards.value.push(newCard)
}

function updateCard(cardIndex: number, card: Card) {
  cards.value[cardIndex] = card
}

function removeCard(cardIndex: number) {
  if (cards.value.length <= 1) return
  cards.value.splice(cardIndex, 1)
}
</script>

<template>
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
</template>