<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { ref } from 'vue'

const emit = defineEmits<{
  'import': [file: File]
}>()

const isDraggingFile = ref(false)
let dragCounter = 0 // Track nested drag events

// Drag and drop handlers
function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  dragCounter++
  
  // Check if dragging files
  if (event.dataTransfer?.types.includes('Files')) {
    isDraggingFile.value = true
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  dragCounter--
  
  if (dragCounter === 0) {
    isDraggingFile.value = false
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragCounter = 0
  isDraggingFile.value = false
  
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return
  
  const file = files[0]
  if (!file) return
  
  // Check if it's a JSON file
  if (file.type === 'application/json' || file.name.endsWith('.json')) {
    emit('import', file)
  } else {
    alert('Please drop a JSON file to import a card set.')
  }
}

useEventListener(document, 'dragenter', handleDragEnter)
useEventListener(document, 'dragover', handleDragOver)
useEventListener(document, 'dragleave', handleDragLeave)
useEventListener(document, 'drop', handleDrop)
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isDraggingFile"
      class="fixed inset-0 z-100 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center pointer-events-none print:hidden"
    >
      <div class="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-sky-500 rounded-2xl bg-sky-500/10">
        <div class="w-20 h-20 rounded-full bg-sky-500/20 flex items-center justify-center">
          <svg class="w-10 h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div class="text-center">
          <h3 class="text-xl font-semibold text-white mb-1">Drop to Import</h3>
          <p class="text-sm text-slate-400">Release to import your card set</p>
        </div>
      </div>
    </div>
  </Transition>
</template>