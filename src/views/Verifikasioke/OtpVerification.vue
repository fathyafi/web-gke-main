<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-down
                 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ease-in-out">

      <div class="flex justify-start mb-4">
        <button @click="goBack" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      <div class="flex justify-center mb-6">
        <img class="h-28 w-auto" src="@/assets/BNI.webp" alt="Logo BNI" />
      </div>

      <h1 class="text-3xl font-extrabold text-center text-gray-900 mb-6">
        Authentication Verification
      </h1>

      <div v-if="errorMessage" class="bg-red-100 border border-red-500 text-red-700 p-3 rounded mb-6">
        <span class="font-semibold">ERROR: </span>{{ errorMessage }}
      </div>
      <div v-if="successMessage" class="bg-green-100 border border-green-500 text-green-700 p-3 rounded mb-6">
        <span class="font-semibold">SUCCESS: </span>{{ successMessage }}
      </div>

      <p class="text-center text-gray-700 mb-6">
        Enter the OTP code that has been sent to your registered phone number.
        <br />
        <span v-if="phoneNumberDisplay" class="font-semibold">{{ phoneNumberDisplay }}</span>
      </p>

      <div v-if="showRecaptchaContainer" id="recaptcha-container" class="mt-4 flex justify-center"></div>

      <form v-if="!isRecaptchaLoading" class="space-y-6" @submit.prevent="handleOtpVerification">
        <div class="flex justify-center space-x-2">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            v-model="otpDigits[index]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="w-12 h-12 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
            @input="onOtpInput(index)"
            @keydown.backspace="onOtpBackspace(index, $event)"
            ref="otpInputs" />
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                           transition-all duration-300 ease-in-out"
            :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
          >
            <span v-if="!isLoading">Verify OTP</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          </button>
        </div>
      </form>

      <p v-if="!isRecaptchaLoading" class="mt-6 text-center text-sm text-gray-500">
        Didn't receive code?
        <button @click="resendOtp" :disabled="isResending || isLoading" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
          Resend OTP
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'OtpPage',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const otpDigits = ref(['', '', '', '', '', '']);
    const isLoading = ref(false);
    const isResending = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const phoneNumberDisplay = ref('');
    const isRecaptchaLoading = ref(true); // Controls OTP input/button visibility initially
    const showRecaptchaContainer = ref(true); // Controls reCAPTCHA container visibility

    const otpCode = computed(() => otpDigits.value.join(''));
    const otpInputs = ref([]); // Ref to access OTP input elements

    const onOtpInput = (index) => {
      const val = otpDigits.value[index];
      if (val.length > 1) otpDigits.value[index] = val.slice(-1);
      if (val && index < 5) focusNextInput(index + 1);
    };

    const onOtpBackspace = (index, event) => {
      if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        focusNextInput(index - 1);
      }
    };

    const focusNextInput = (index) => {
      // Use otpInputs ref for more robust focus management
      if (otpInputs.value[index]) {
        otpInputs.value[index].focus();
      }
    };

    const goBack = () => {
      router.push('/login');
    };

    const initializeRecaptcha = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      isRecaptchaLoading.value = true; // Sembunyikan OTP input/button
      showRecaptchaContainer.value = true; // Tampilkan reCAPTCHA container

      // Clear the reCAPTCHA container to ensure a fresh render
      const recaptchaEl = document.getElementById('recaptcha-container');
      if (recaptchaEl) {
        recaptchaEl.innerHTML = ''; // Penting: Membersihkan container
      }

      // Pastikan DOM sudah diperbarui sebelum Firebase mencoba merender reCAPTCHA
      await nextTick();

      const result = await authStore.sendOtpFirebase('recaptcha-container');

      if (result.success) {
        successMessage.value = result.message;
        isRecaptchaLoading.value = false; 
        showRecaptchaContainer.value = false; 
        // Clear OTP input fields for new OTP
        otpDigits.value = ['', '', '', '', '', ''];
        await nextTick(); // Ensure inputs are rendered before focusing
        if (otpInputs.value[0]) {
          otpInputs.value[0].focus();
        }
      } else {
        errorMessage.value = result.message;
        isRecaptchaLoading.value = false; 
        showRecaptchaContainer.value = false; 
      }
    };

    onMounted(async () => {
      const phoneNumber = authStore.currentPhoneNumber;
      if (!phoneNumber) {
        errorMessage.value = 'Phone number not found. Please log in again.';
        router.push('/login');
        return;
      }
      phoneNumberDisplay.value = phoneNumber;

      await initializeRecaptcha();
    });

    const handleOtpVerification = async () => {
      isLoading.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      if (otpCode.value.length !== 6) {
        errorMessage.value = 'OTP must be 6 digits long.';
        isLoading.value = false;
        return;
      }

      try {
        const result = await authStore.verifyOtpAndLoginWithFirebase(otpCode.value);

        if (result.success) {
          successMessage.value = result.message;
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          errorMessage.value = result.message;
          // Tidak ada perubahan di sini, errorMessage akan ditampilkan di atas form
        }
      } catch (error) {
        errorMessage.value = 'An unexpected error occurred during OTP verification.';
      } finally {
        isLoading.value = false;
      }
    };

    const resendOtp = async () => {
      const phoneNumber = authStore.currentPhoneNumber;
      if (!phoneNumber) {
        errorMessage.value = 'Phone number not found for resending OTP.';
        return;
      }

      isResending.value = true;
      isLoading.value = true; // Disable verify button during resend process

      // Re-initialize reCAPTCHA, which will hide OTP inputs, then show them again
      await initializeRecaptcha();

      isResending.value = false;
      isLoading.value = false;
    };

    return {
      otpDigits,
      isLoading,
      isResending,
      errorMessage,
      successMessage,
      phoneNumberDisplay,
      isRecaptchaLoading,
      showRecaptchaContainer,
      handleOtpVerification,
      resendOtp,
      onOtpInput,
      onOtpBackspace,
      goBack,
      otpInputs // Make otpInputs ref available in template
    };
  },
};
</script>

<style scoped>
/* Tambahkan atau sesuaikan gaya CSS sesuai kebutuhan */
.error {
  color: red;
}
</style>