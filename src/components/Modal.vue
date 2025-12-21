<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, type VNode } from 'vue'

const props = withDefaults(defineProps<{
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean
  /** Whether pressing ESC closes the modal (native dialog default is true) */
  closeOnEsc?: boolean
  /** Additional classes for the dialog element */
  dialogClass?: string
}>(), {
  closeOnBackdropClick: true,
  closeOnEsc: true,
  dialogClass: ''
})

const emit = defineEmits<{
  'close': []
  'open': []
}>()

const open = defineModel<boolean>('open', {
  default: false
})

const dialogRef = ref<HTMLDialogElement | null>(null)

function openModal() {
  if (dialogRef.value && !dialogRef.value.open) {
    dialogRef.value.showModal()
    emit('open')
  }
}

function closeModal() {
  if (dialogRef.value?.open) {
    dialogRef.value.close()
    open.value = false
    emit('close')
  }
}

function handleBackdropClick(event: MouseEvent) {
  if (!props.closeOnBackdropClick) return
  
  // Check if click was on the backdrop (dialog element itself, not its content)
  if (event.target === dialogRef.value) {
    closeModal()
  }
}

function handleCancel(event: Event) {
  // Native ESC key handling - dialog fires 'cancel' event
  if (!props.closeOnEsc) {
    event.preventDefault()
    return
  }
  open.value = false
  emit('close')
}

function handleClose() {
  open.value = false
  emit('close')
}

// Sync v-model with dialog state
watch(open, (isOpen) => {
  if (isOpen) {
    openModal()
  } else {
    closeModal()
  }
})

// Expose methods for imperative usage
defineExpose({
  open: openModal,
  close: closeModal,
  dialogElement: dialogRef
})

onMounted(() => {
  if (open.value) {
    openModal()
  }
})

onBeforeUnmount(() => {
  closeModal()
})

defineSlots<{
  default: (props: { close: () => void }) => VNode[]
  header: (props: { close: () => void }) => VNode[]
  footer: (props: { close: () => void }) => VNode[]
}>()
</script>

<template>
  <dialog
    ref="dialogRef"
    :class="[
      'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
      'bg-transparent p-0 m-auto',
      'open:animate-fade-in',
      dialogClass
    ]"
    @click="handleBackdropClick"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <div 
      class="bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl text-white"
      @click.stop
    >
      <!-- Header slot -->
      <div 
        v-if="$slots.header" 
        class="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between"
      >
        <slot name="header" :close="closeModal" />
        <button
          @click="closeModal"
          class="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Default content slot -->
      <div class="px-5 py-4">
        <slot :close="closeModal" />
      </div>

      <!-- Footer slot -->
      <div 
        v-if="$slots.footer" 
        class="px-5 py-4 border-t border-slate-700/50 flex justify-end gap-3"
      >
        <slot name="footer" :close="closeModal" />
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  animation: fade-in 150ms ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

dialog[open] {
  animation: slide-up 200ms ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>

