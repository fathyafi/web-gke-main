<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <div class="mt-1 relative"> <input
        :id="id"
        :type="computedInputType" :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :maxlength="maxlength"
        :pattern="pattern"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
               transition-all duration-200 ease-in-out pr-10" :class="[inputClass, { 'border-red-500 focus:border-red-500 focus:ring-red-500': errorMessage }]"
      />
      <div v-if="isPasswordToggle"
           @click="togglePasswordVisibility"
           class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700">
        <svg v-if="inputType === 'password'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.168 5.49L21 21"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      </div>
    </div>
    <p v-if="errorMessage" class="mt-2 text-sm text-red-600">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script>
import { ref, computed } from 'vue'; // Import computed

export default {
  name: 'BaseInput',
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    type: { // This type will now determine if it's a "password" type initially
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
    autocomplete: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    maxlength: {
      type: [String, Number],
      default: null,
    },
    pattern: {
      type: String,
      default: null,
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
    inputClass: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    isPasswordToggle: { // NEW PROP: To enable password visibility toggle
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props) {
    // Internal state for the input type when toggle is enabled
    const inputType = ref(props.type);

    // Computed property to determine the actual input type to use
    const computedInputType = computed(() => {
      return props.isPasswordToggle ? inputType.value : props.type;
    });

    const togglePasswordVisibility = () => {
      inputType.value = inputType.value === 'password' ? 'text' : 'password';
    };

    return {
      inputType,
      computedInputType,
      togglePasswordVisibility,
    };
  },
};
</script>

<style scoped>
/* Style tambahan jika diperlukan, tapi Tailwind sudah cukup */
</style>