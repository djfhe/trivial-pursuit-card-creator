<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { Card } from '../types'
import { PRESET_COLORS, createNewCategory, needsDarkText } from '../types'

defineProps<{
  card: Card
  canDelete: boolean
}>()

const emit = defineEmits<{
  'remove': []
}>()

const card = defineModel<Card>('card', {
  required: true
})

const editingCategoryId = defineModel<string | null>('editingCategoryId', {
  required: true
})

const editingName = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)
function startEditingName() {
  editingName.value = true
  nextTick(() => nameInput.value?.select())
}

function finishEditingName() {
  editingName.value = false
}

function updateCardName(name: string) {
  card.value.name = name
}

function addCategory() {
  card.value.categories.push(createNewCategory(card.value.categories))
}

function removeCategory(categoryIndex: number) {
  const category = card.value.categories[categoryIndex]

  if (category === undefined) {
    return
  }

  if (category.question !== '' || category.answer !== '') {
    if (!confirm('This category has a question or answer. Are you sure you want to delete it?')) {
      return
    }
  }

  card.value.categories.splice(categoryIndex, 1)
}

function updateCategoryLetter(categoryIndex: number, letter: string) {
  card.value.categories[categoryIndex]!.letter = letter
}

function updateCategoryColor(categoryIndex: number, color: string) {
  card.value.categories[categoryIndex]!.color = color
}

function updateCategoryQuestion(categoryIndex: number, question: string) {
  card.value.categories[categoryIndex]!.question = question
}

function updateCategoryAnswer(categoryIndex: number, answer: string) {
  card.value.categories[categoryIndex]!.answer = answer
}

function toggleCategoryEditingWindow(categoryId: string) {
  editingCategoryId.value = categoryId === editingCategoryId.value ? null : categoryId
}
</script>

<template>
  <div class="bg-slate-800/50 border border-slate-700/30 rounded-lg flex flex-col">
    <!-- Card Header -->
    <div class="px-2 py-1.5 bg-slate-900/60 border-b border-slate-700/30">
      <div class="flex items-center justify-between gap-2">
        <input
          v-if="editingName"
          ref="nameInput"
          :value="card.name"
          @input="$event => updateCardName(($event.target as HTMLInputElement).value)"
          @blur="finishEditingName"
          @keydown.enter="finishEditingName"
          class="font-semibold text-amber-500 bg-black/20 border border-amber-500/50 px-1.5 py-0.5 rounded text-xs w-24"
        />
        <button 
          v-else 
          @click="startEditingName" 
          class="font-semibold text-amber-500 bg-transparent border-none cursor-pointer px-1.5 py-0.5 rounded text-xs hover:bg-amber-500/10"
        >
          {{ card.name }}
        </button>
        
        <div class="flex gap-1">
          <button 
            v-if="canDelete"
            @click="emit('remove')" 
            class="px-1.5 py-1 text-xs bg-red-500/20 text-red-500 border-none rounded-md cursor-pointer flex items-center justify-center hover:bg-red-500/30"
            title="Delete card"
          >
            <svg class="size-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Card
          </button>

          <button 
            @click="addCategory" 
            class="px-1.5 py-1 text-xs bg-emerald-500/20 text-emerald-500 border-none rounded-md cursor-pointer flex items-center justify-center hover:bg-emerald-500/30"
            title="Add category"
          >
            <svg class="size-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Category
            </button>
        </div>
      </div>
    </div>

    <!-- Categories Grid -->
    <div 
      v-for="(category, categoryIndex) in card.categories" 
      :key="categoryIndex"
      class="grid grid-cols-[auto_1fr] grid-flow-col grid-rows-2 gap-1.5 px-1.5 py-1 border-b border-slate-700/20 last:border-b-0 items-start"
    >
      <!-- Color/Letter Badge -->
      <div class="relative">
        <button
          @click="toggleCategoryEditingWindow(category.id)"
          class="w-7 h-7 rounded-full border-2 border-white/20 cursor-pointer font-semibold text-[0.65rem] italic flex items-center justify-center transition-transform hover:scale-110"
          :style="{ backgroundColor: category.color }"
          :title="'Change color'"
        >
          <span :class="needsDarkText(category.color) ? 'text-slate-800' : 'text-white'">
            {{ category.letter }}
          </span>
        </button>
        
        <!-- Inline color picker -->
        <div 
          v-if="editingCategoryId === category.id" 
          class="absolute top-full left-0 mt-2 p-3 bg-slate-800 border border-slate-600/50 rounded-lg z-50 min-w-[180px] shadow-xl"
        >
          <input
            :value="category.letter"
            @input="($event) => updateCategoryLetter(categoryIndex, ($event.target as HTMLInputElement).value)"
            class="w-full px-2 py-1.5 bg-black/30 border border-slate-600/50 rounded-md text-white font-semibold text-center mb-2"
            maxlength="3"
          />
          <div class="grid grid-cols-5 gap-1.5 mb-2">
            <button
              v-for="preset in PRESET_COLORS"
              :key="preset.value"
              @click="updateCategoryColor(categoryIndex, preset.value)"
              class="w-6 h-6 rounded-full border-none cursor-pointer transition-transform hover:scale-115"
              :class="category.color === preset.value ? 'ring-2 ring-white' : ''"
              :style="{ backgroundColor: preset.value }"
              :title="preset.name"
            />
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-700/30">
            <input
              type="color"
              :value="category.color"
              @input="($event) => updateCategoryColor(categoryIndex, ($event.target as HTMLInputElement).value)"
              class="w-8 h-6 border-none rounded cursor-pointer"
            />
            <button 
              v-if="card.categories.length > 1"
              @click="removeCategory(categoryIndex)"
              class="text-xs text-red-500 bg-transparent border-none cursor-pointer px-2 py-1 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
        
        <!-- Click outside to close -->
        <div 
          v-if="editingCategoryId === category.id" 
          class="fixed inset-0 z-40"
          @click="editingCategoryId = null"
        />
      </div>

      <button v-if="card.categories.length > 1" type="button" @click="removeCategory(categoryIndex)" class=" p-1 justify-self-center text-xs text-slate-500 bg-transparent border-none cursor-pointer hover:text-red-500">
        <svg class="size-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      <span v-else />

      <!-- Question & Answer Inputs -->

      <textarea
        :value="category.question"
        @input="($event) => updateCategoryQuestion(categoryIndex, ($event.target as HTMLTextAreaElement).value)"
        class="px-1.5 py-1 bg-black/20 border border-slate-700/30 rounded text-white text-[0.7rem] resize-y min-h-6 leading-tight focus:outline-none focus:border-amber-500/50"
        placeholder="Question..."
        rows="1"
      />

      <input
        :value="category.answer"
        @input="updateCategoryAnswer(categoryIndex, ($event.target as HTMLInputElement).value)"
        class="px-1.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-500 text-[0.65rem] font-medium focus:outline-none focus:border-emerald-500/50"
        placeholder="Answer..."
      />
    </div>
  </div>
</template>
