<script setup lang="ts">
import { ref, watch, computed, toRaw } from 'vue'
import type { CardSet } from '../types'
import { DEFAULT_CATEGORIES, PRESET_COLORS, createNewCategory, needsDarkText } from '../types'
import { exportCardSet } from '../cardSetImporter'
import Modal from './Modal.vue'

const emit = defineEmits<{
  'remove': []
}>()

const cardSet = defineModel<CardSet>('cardSet', {
  required: true
})

const open = defineModel<boolean>('open', {
  default: false
})

function getLocalCardSetSettingsClone(): Pick<CardSet, 'defaultCategories' | 'name'> {
  return {
    defaultCategories: toRaw(cardSet.value.defaultCategories),
    name: toRaw(cardSet.value.name)
  }
}

// Local copy of settings to edit
const immutableCardSetSettingsClone = computed(() => getLocalCardSetSettingsClone())
const localCardSetSettingsClone = ref<Pick<CardSet, 'defaultCategories' | 'name'>>(JSON.parse(JSON.stringify(immutableCardSetSettingsClone.value)))
const editingCategoryId = ref<string | null>(null)


// Reset local settings when modal opens
watch(open, (isOpen) => {
  if (isOpen) {
    localCardSetSettingsClone.value = JSON.parse(JSON.stringify(immutableCardSetSettingsClone.value))
    editingCategoryId.value = null
  }
})

// Default card helpers
function addCategory() {
  localCardSetSettingsClone.value.defaultCategories.push(createNewCategory(localCardSetSettingsClone.value.defaultCategories))
}

function removeCategory(index: number) {
  if (localCardSetSettingsClone.value.defaultCategories.length <= 1) return
  localCardSetSettingsClone.value.defaultCategories.splice(index, 1)
}

function updateCategoryLetter(index: number, letter: string) {
  localCardSetSettingsClone.value.defaultCategories[index]!.letter = letter
}

function updateCategoryColor(index: number, color: string) {
  localCardSetSettingsClone.value.defaultCategories[index]!.color = color
}

function toggleCategoryEditingWindow(categoryId: string) {
  editingCategoryId.value = categoryId === editingCategoryId.value ? null : categoryId
}

function resetCategoriesToDefault() {
  localCardSetSettingsClone.value.defaultCategories = DEFAULT_CATEGORIES.map(cat => ({ 
    ...cat, 
    id: `category-${crypto.randomUUID()}` 
  }))
}

function saveSettings() {
  cardSet.value = {
    ...cardSet.value,
    ...localCardSetSettingsClone.value
  }
  open.value = false
}

function cancel() {
  open.value = false
}

const hasChanges = computed(() => {
  return JSON.stringify(localCardSetSettingsClone.value) !== JSON.stringify(immutableCardSetSettingsClone.value)
})

function removeCardSet() {
  if (!confirm('Are you sure you want to remove this card set? This action cannot be undone.')) {
    return
  }

  emit('remove')
}

function handleExport() {
  const exportData = exportCardSet(cardSet.value)
  const blob = new Blob([exportData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${cardSet.value.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Modal v-model:open="open" :close-on-backdrop-click="false">
    <template #header>
      <h2 class="text-lg font-semibold bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
        Card Set Settings
      </h2>
    </template>

    <div class="space-y-6 min-w-[500px] max-h-[70vh] overflow-y-auto pr-2">
      <!-- Card Set Name Section -->
      <section>
        <h3 class="text-sm font-medium text-slate-300 mb-2">Card Set Name</h3>
        <input
          v-model="localCardSetSettingsClone.name"
          type="text"
          class="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-colors"
          placeholder="Enter card set name..."
        />
      </section>

      <!-- Default Card Template Section -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-slate-300">Default Card Template</h3>
          <div class="flex gap-2">
            <button
              @click="resetCategoriesToDefault"
              class="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Reset to default
            </button>
            <button
              @click="addCategory"
              class="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500/20 text-emerald-500 rounded hover:bg-emerald-500/30 transition-colors"
            >
              <svg class="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Category
            </button>
          </div>
        </div>
        
        <p class="text-xs text-slate-500 mb-3">
          Configure the default categories that new cards will start with.
        </p>

        <div class="bg-slate-900/50 rounded-lg border border-slate-700/30 p-3">
          <div class="space-y-2">
            <div 
              v-for="(category, index) in localCardSetSettingsClone.defaultCategories" 
              :key="category.id"
              class="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg"
            >
              <!-- Color/Letter Badge -->
              <div class="relative">
                <button
                  @click="toggleCategoryEditingWindow(category.id)"
                  class="w-8 h-8 rounded-full border-2 border-white/20 cursor-pointer font-semibold text-xs italic flex items-center justify-center transition-transform hover:scale-110"
                  :style="{ backgroundColor: category.color }"
                  title="Change color & letter"
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
                    @input="($event) => updateCategoryLetter(index, ($event.target as HTMLInputElement).value)"
                    class="w-full px-2 py-1.5 bg-black/30 border border-slate-600/50 rounded-md text-white font-semibold text-center mb-2"
                    maxlength="3"
                    placeholder="Letter"
                  />
                  <div class="grid grid-cols-5 gap-1.5 mb-2">
                    <button
                      v-for="preset in PRESET_COLORS"
                      :key="preset.value"
                      @click="updateCategoryColor(index, preset.value)"
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
                      @input="($event) => updateCategoryColor(index, ($event.target as HTMLInputElement).value)"
                      class="w-8 h-6 border-none rounded cursor-pointer"
                    />
                    <button 
                      v-if="localCardSetSettingsClone.defaultCategories.length > 1"
                      @click="removeCategory(index)"
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

              <!-- Category info -->
              <div class="flex-1 text-sm text-slate-300">
                Category <span class="font-semibold" :style="{ color: category.color }">{{ category.letter }}</span>
              </div>

              <!-- Remove button -->
              <button
                v-if="localCardSetSettingsClone.defaultCategories.length > 1"
                @click="removeCategory(index)"
                class="p-1.5 text-slate-500 hover:text-red-500 transition-colors"
                title="Remove category"
              >
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Export Section -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-slate-300">Export Card Set</h3>
        </div>
        <p class="text-xs text-slate-500 mb-3">
          Download this card set as a JSON file to share or backup.
        </p>
        <button
          @click="handleExport"
          class="flex items-center gap-2 px-3 py-2 text-sm bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500/50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export as JSON
        </button>
      </section>
    </div>

    <template #footer>
      <button 
        @click="removeCardSet"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-md cursor-pointer hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-colors mr-auto"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Card Set
      </button>

      <button
        @click="cancel"
        class="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        Cancel
      </button>
      <button
        @click="saveSettings"
        :disabled="!hasChanges"
        class="px-4 py-2 text-sm bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/25 transition-all"
      >
        Save Changes
      </button>
    </template>
  </Modal>
</template>

