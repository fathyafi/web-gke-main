<template>
  <transition name="fade">
    <div
      v-if="isVisible"
      :class="alertClasses"
      class="p-4 mb-4 rounded-md flex items-center justify-between shadow-sm"
      role="alert"
    >
      <div class="flex items-center">
        <svg v-if="type === 'success'" class="h-5 w-5 text-green-800 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <svg v-else-if="type === 'error'" class="h-5 w-5 text-red-800 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <svg v-else-if="type === 'info'" class="h-5 w-5 text-blue-800 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 000-2H9z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm font-medium">{{ message }}</p>
      </div>
      <button v-if="!autoClose" @click="closeAlert" class="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md inline-flex h-8 w-8" :class="buttonClasses">
        <span class="sr-only">Close</span>
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </transition>
</template>

<script>
import { computed, watch } from 'vue';

export default {
  props: {
    message: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'info', // 'info', 'success', 'error'
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    duration: { // Durasi alert akan otomatis hilang, 0 berarti manual close
      type: Number,
      default: 0, // Default 3 detik
    }
  },
  emits: ['update:isVisible'],
  setup(props, { emit }) {
    let timeoutId = null;

    const alertClasses = computed(() => {
      switch (props.type) {
        case 'success':
          return 'bg-green-100 text-green-700 border border-green-200';
        case 'error':
          return 'bg-red-100 text-red-700 border border-red-200';
        case 'info':
          return 'bg-blue-100 text-blue-700 border border-blue-200';
        default:
          return 'bg-gray-100 text-gray-700 border border-gray-200';
      }
    });

    const buttonClasses = computed(() => {
      switch (props.type) {
        case 'success':
          return 'text-green-500 hover:bg-green-200 focus:ring-green-400';
        case 'error':
          return 'text-red-500 hover:bg-red-200 focus:ring-red-400';
        case 'info':
          return 'text-blue-500 hover:bg-blue-200 focus:ring-blue-400';
        default:
          return 'text-gray-500 hover:bg-gray-200 focus:ring-gray-400';
      }
    });

    const autoClose = computed(() => props.duration > 0);

    const closeAlert = () => {
      emit('update:isVisible', false);
      clearTimeout(timeoutId); // Hapus timer jika alert ditutup manual
    };

    // Watcher untuk properti isVisible
    watch(() => props.isVisible, (newValue) => {
      if (newValue && autoClose.value) {
        // Hapus timer sebelumnya jika ada
        clearTimeout(timeoutId);
        // Set timer baru untuk menyembunyikan alert
        timeoutId = setTimeout(() => {
          emit('update:isVisible', false);
        }, props.duration);
      } else if (!newValue) {
        // Jika alert disembunyikan (manual atau dari parent), pastikan timer juga dibersihkan
        clearTimeout(timeoutId);
      }
    }, { immediate: true }); // Jalankan watcher segera setelah komponen dibuat

    return {
      alertClasses,
      buttonClasses,
      autoClose,
      closeAlert,
    };
  },
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>