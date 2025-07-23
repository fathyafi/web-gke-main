<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-24 w-auto" src="@/assets/3AM.png" alt="3AM Logo" />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Buat Kata Sandi Baru
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600 max-w">
        Masukkan token reset dan kata sandi baru Anda.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10
                  hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ease-in-out
                  animate-fade-in-down">
        <AlertMessage
          :message="alertMessage"
          :type="alertType"
          :isVisible="showAlert"
        />

        <form class="space-y-6" @submit.prevent="handleSetNewPassword">
          <BaseInput
            id="resetToken"
            label="Token Reset"
            type="text"
            placeholder="Masukkan token reset Anda"
            required
            v-model="resetToken"
            @input="validateForm"
            :error="tokenError"
          />

          <BaseInput
            id="password"
            label="Kata Sandi Baru"
            type="password"
            placeholder="Minimal 8 karakter"
            required
            v-model="newPassword"
            @input="validateForm"
            :error="passwordError"
          />

          <BaseInput
            id="confirmPassword"
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            placeholder="Ketik ulang kata sandi baru Anda"
            required
            v-model="confirmPassword"
            @input="validateForm"
            :error="confirmPasswordError"
          />

          <div>
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     transition-all duration-300 ease-in-out"
              :class="{ 'opacity-50 cursor-not-allowed': isLoading || !isFormValid }"
            >
              <span v-if="!isLoading">Setel Kata Sandi</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memuat...
              </span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Kembali ke
            <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out">
              Login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // useRoute masih diperlukan untuk routing secara umum, tapi tidak untuk membaca token
import BaseInput from '@/components/BaseInput.vue';
import AlertMessage from '@/components/AlertMessage.vue';

export default {
  name: 'SetNewPassword',
  components: {
    BaseInput,
    AlertMessage,
  },
  setup() {
    const route = useRoute(); // Tetap import jika ada kebutuhan lain membaca route params
    const router = useRouter();
    const newPassword = ref('');
    const confirmPassword = ref('');
    const isLoading = ref(false);
    const showAlert = ref(false);
    const alertMessage = ref('');
    const alertType = ref('info');
    const passwordError = ref('');
    const confirmPasswordError = ref('');
    const resetToken = ref(''); // Akan diisi manual oleh user

    const validateForm = () => {
      tokenError.value = '';
      passwordError.value = '';
      confirmPasswordError.value = '';

      if (!resetToken.value.trim()) {
        tokenError.value = 'Token reset diperlukan.';
      }

      if (newPassword.value.length < 8) {
        passwordError.value = 'Kata sandi minimal 8 karakter.';
      }

      if (newPassword.value !== confirmPassword.value) {
        confirmPasswordError.value = 'Kata sandi tidak cocok.';
      }
    };

    const isFormValid = computed(() => {
      return (
        resetToken.value.trim() !== '' &&
        newPassword.value.length >= 8 &&
        newPassword.value === confirmPassword.value
      );
    });

    const displayAlert = (message, type, duration = 3000) => {
      alertMessage.value = message;
      alertType.value = type;
      showAlert.value = true;
      if (duration > 0) {
        setTimeout(() => {
          showAlert.value = false;
          alertMessage.value = '';
        }, duration);
      }
    };

    const resetAlert = () => {
      showAlert.value = false;
      alertMessage.value = '';
      alertType.value = 'info';
    };

    const handleSetNewPassword = async () => {
      resetAlert();
      validateForm(); // Validasi final sebelum submit

      if (!isFormValid.value) {
        displayAlert('Harap perbaiki kesalahan input Anda.', 'error');
        return;
      }

      if (!resetToken.value) {
        displayAlert('Token reset tidak ditemukan atau tidak valid. Silakan coba lagi proses reset kata sandi.', 'error');
        return;
      }

      isLoading.value = true;

      // --- SIMULASI PEMROSESAN RESET PASSWORD ---
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulasi penundaan

      // LOGIKA DUMMY UNTUK RESET PASSWORD
      // Dalam aplikasi nyata, Anda akan mengirim token dan password ke backend
      // Sekarang resetToken.value akan berisi input manual dari user
      if (resetToken.value.startsWith('DUMMY_RESET_TOKEN_') && newPassword.value === confirmPassword.value) {
        displayAlert('Kata sandi berhasil diubah! Silakan masuk dengan kata sandi baru Anda.', 'success', 5000);
        resetToken.value = ''; // Bersihkan input
        newPassword.value = '';
        confirmPassword.value = '';
        setTimeout(() => {
          router.push('/login'); // Redirect ke halaman login setelah berhasil
        }, 2000);
      } else {
        // Jika token tidak cocok dengan format dummy yang kita harapkan,
        // atau kata sandi tidak cocok, berikan error.
        displayAlert('Token tidak valid atau kata sandi tidak cocok. Silakan coba lagi.', 'error');
      }

      isLoading.value = false;
    };

    // --- BAGIAN INI DIHAPUS ATAU DIUBAH ---
    onMounted(() => {
      // Hapus atau komentari baris ini agar token tidak diisi otomatis dari URL
      // const tokenFromUrl = route.query.token;
      // if (tokenFromUrl) {
      //   resetToken.value = tokenFromUrl;
      //   displayAlert('Token reset telah diisi dari URL.', 'info', 3000);
      // } else {
      //   displayAlert('Harap masukkan token reset Anda secara manual.', 'info', 0); // Pesan jika URL kosong
      // }

      // Opsional: Anda bisa menambahkan pesan info awal jika ingin
      displayAlert('Harap masukkan token reset Anda secara manual.', 'info', 0);
    });

    const tokenError = ref(''); // Pastikan ini tetap ada

    return {
      resetToken,
      newPassword,
      confirmPassword,
      isLoading,
      showAlert,
      alertMessage,
      alertType,
      tokenError,
      passwordError,
      confirmPasswordError,
      isFormValid,
      handleSetNewPassword,
      displayAlert,
      resetAlert,
      validateForm,
    };
  },
};
</script>

<style scoped>
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}
</style>