<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative">
    <!-- 🔄 LOADING OVERLAY -->
    <div
      v-if="authStore.isLoading"
      class="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex justify-center items-center"
    >
      <svg class="h-12 w-12 text-orange-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>

    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-down
                 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ease-in-out">
      <h1 class="text-3xl font-extrabold text-center text-gray-900 mb-6">
        Register your account
      </h1>
      <p class="text-center text-gray-600 mb-8">
        Welcome! Please complete your personal data.
      </p>

      <AlertMessage
        :message="alertMessage"
        :type="alertType"
        :isVisible="showAlert"
        :duration="alertDuration" 
        @update:isVisible="showAlert = $event; resetAlertState()" 
      />

      <form class="space-y-6" @submit.prevent="handleRegister">
        <BaseInput id="fullName" label="Full Name" type="text" placeholder="Enter your full name" autocomplete="name" required v-model="fullName" :errorMessage="formErrors.fullName" />
        <BaseInput id="email" label="Email Address" type="email" placeholder="Enter your email address" autocomplete="email" required v-model="email" :errorMessage="formErrors.email" />
        <BaseInput id="phone" label="Phone Number" type="tel" placeholder="Enter your phone number" autocomplete="tel" required v-model="phone" :errorMessage="formErrors.phone" />        
        <BaseInput id="username" label="Username" type="text" placeholder="Enter your username" autocomplete="username" required v-model="username" :errorMessage="formErrors.username" />

        <div>
          <BaseInput id="password" label="Password" type="password" placeholder="Create New Password" autocomplete="new-password" required v-model="password" :errorMessage="formErrors.password" :isPasswordToggle="true" />
          <div class="h-2 mt-1 rounded-full" :class="passwordStrengthClass"></div>
          <p class="text-xs text-gray-500 mt-1">{{ passwordStrengthLabel }}</p>
        </div>

        <BaseInput id="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter your password" autocomplete="new-password" required v-model="confirmPassword" :errorMessage="formErrors.confirmPassword" />

        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            :aria-busy="authStore.isLoading"
            aria-live="polite"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 ease-in-out"
            :class="{ 'opacity-50 cursor-not-allowed': authStore.isLoading }"
          >
            <span v-if="!authStore.isLoading">Register Now</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          </button>
        </div>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Already have an account?
        <router-link to="/" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out">
          Back to login
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseInput from '@/components/BaseInput.vue';
import AlertMessage from '@/components/AlertMessage.vue';

const router = useRouter();
const authStore = useAuthStore();

const fullName = ref('');
const email = ref('');
const phone = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const formErrors = ref({
  fullName: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: '',
});

const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('info');
const alertDuration = ref(3000);

const displayAlert = (message, type, duration = 3000) => {
  alertMessage.value = message;
  alertType.value = type;
  alertDuration.value = duration;
  showAlert.value = true;
};

const resetAlertState = () => {
  showAlert.value = false;
  alertMessage.value = '';
  alertType.value = 'info';
  alertDuration.value = 3000;
};

const passwordStrength = computed(() => {
  let strength = 0;
  if (password.value.length >= 8) strength++;
  if (/[A-Z]/.test(password.value)) strength++;
  if (/[a-z]/.test(password.value)) strength++;
  if (/\d/.test(password.value)) strength++;
  if (/[^A-Za-z0-9]/.test(password.value)) strength++;
  return strength;
});

const passwordStrengthLabel = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Moderate';
    case 4:
      return 'Strong';
    case 5:
      return 'Very Strong';
    default:
      return '';
  }
});

const passwordStrengthClass = computed(() => {
  return [
    'transition-all duration-300',
    passwordStrength.value <= 1 ? 'bg-red-400 w-1/5' :
    passwordStrength.value === 2 ? 'bg-orange-400 w-2/5' :
    passwordStrength.value === 3 ? 'bg-yellow-400 w-3/5' :
    passwordStrength.value === 4 ? 'bg-green-400 w-4/5' :
    'bg-green-600 w-full'
  ];
});

const handleRegister = async () => {
  Object.keys(formErrors.value).forEach(key => formErrors.value[key] = '');
  resetAlertState();
  let hasError = false;

  if (!fullName.value.trim()) {
    formErrors.value.fullName = 'Full name is required.';
    hasError = true;
  } else if (!/^[a-zA-Z\s]+$/.test(fullName.value)) {
    formErrors.value.fullName = 'Only letters and spaces allowed.';
    hasError = true;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    formErrors.value.email = 'Invalid email format.';
    hasError = true;
  }

  if (!/^\+62\d{10,11}$/.test(phone.value)) {
    formErrors.value.phone = 'Phone must start with +62 and be 10–11 digits.';
    hasError = true;
  }

  if (!/^[a-zA-Z0-9]{5,20}$/.test(username.value)) {
    formErrors.value.username = '5–20 chars, letters & numbers only.';
    hasError = true;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(password.value)) {
    formErrors.value.password = 'Must include upper, lower, number & special char.';
    hasError = true;
  }

  if (password.value !== confirmPassword.value) {
    formErrors.value.confirmPassword = 'Passwords do not match.';
    hasError = true;
  }

  if (hasError) return;

  try {
    const result = await authStore.register({
      fullName: fullName.value,
      email: email.value,
      phone: phone.value,
      username: username.value,
      password: password.value
    });

    if (result.success) {
      displayAlert('Registration successful! Redirecting...', 'success', 5000);
      setTimeout(() => router.push('/login'), 1500);
    } else {
      displayAlert(result.message || 'Registration failed.', 'error', 0);
    }
  } catch (err) {
    console.error(err);
    displayAlert('Unexpected error occurred.', 'error');
  }
};
</script>

<style scoped>
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out forwards;
}
</style>
