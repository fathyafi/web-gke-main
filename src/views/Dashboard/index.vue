<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="bg-orange-200 shadow-sm p-4 flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <img class="h-24 w-auto" src="@/assets/BNI.webp" alt="Logo BNI" />
      </div>
      <div class="flex items-center space-x-6">
        <a href="#" class="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200 ease-in-out">Beranda</a>
        <a href="#" class="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200 ease-in-out">Transaksi</a>
        <a href="#" class="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200 ease-in-out">Profil</a>
        <button @click="handleLogout" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          Logout
        </button>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header Selamat Datang -->
      <h1 class="text-3xl font-bold text-gray-900 mb-6 animate-fade-in-up">Selamat Datang, {{ authStore.user ? authStore.user.fullName : 'Pengguna' }}!</h1>

      <!-- Grafik Saldo -->
      <div class="chart-container mb-8">
        <canvas id="balanceChart"></canvas>
      </div>

      <!-- Card Saldo Rekening -->
      <div class="hover-card mb-8 bg-gradient-to-r from-green-400 via-green-500 to-green-600">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-white mb-2">Saldo Rekening Anda</h3>
          <div class="mt-1 text-5xl font-extrabold text-white">
            Rp 12.345.678,90
          </div>
          <p class="mt-2 text-sm text-white">Per 09 Juli 2025 21:17 WIB</p>
        </div>
      </div>

      <!-- Card Transaksi Terakhir, Poin Reward, Tagihan -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="hover-card bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
          <dl class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-white">Transaksi Terakhir</dt>
            <dd class="mt-1 text-3xl font-semibold text-white">Rp 500.000</dd>
            <p class="text-xs text-white">Pembelian online</p>
          </dl>
        </div>

        <div class="hover-card bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
          <dl class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-white">Poin Reward</dt>
            <dd class="mt-1 text-3xl font-semibold text-white">1.250</dd>
            <p class="text-xs text-white">Dapat ditukar dengan voucher</p>
          </dl>
        </div>

        <div class="hover-card bg-gradient-to-r from-red-400 via-red-500 to-red-600">
          <dl class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-white">Tagihan Jatuh Tempo</dt>
            <dd class="mt-1 text-3xl font-semibold text-white">Rp 750.000</dd>
            <p class="text-xs text-white">Listrik, 15 Juli 2025</p>
            <progress id="tagihan" value="75" max="100"></progress>
          </dl>
        </div>
      </div>

      <!-- Riwayat Transaksi -->
      <div class="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ease-in-out">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Riwayat Transaksi Terbaru</h3>
          <ul class="divide-y divide-gray-200">
            <li class="py-4 flex justify-between items-center hover:bg-gray-50 rounded px-2">
              <div>
                <p class="text-sm font-medium text-gray-900">Transfer ke Budi Santoso</p>
                <p class="text-sm text-gray-500">08 Juli 2025, 14:30 WIB</p>
              </div>
              <span class="text-red-600 font-semibold">- Rp 2.000.000</span>
            </li>
            <li class="py-4 flex justify-between items-center hover:bg-gray-50 rounded px-2">
              <div>
                <p class="text-sm font-medium text-gray-900">Pembelian Kopi Starbucks</p>
                <p class="text-sm text-gray-500">07 Juli 2025, 10:15 WIB</p>
              </div>
              <span class="text-red-600 font-semibold">- Rp 50.000</span>
            </li>
            <li class="py-4 flex justify-between items-center hover:bg-gray-50 rounded px-2">
              <div>
                <p class="text-sm font-medium text-gray-900">Penerimaan Gaji</p>
                <p class="text-sm text-gray-500">01 Juli 2025, 09:00 WIB</p>
              </div>
              <span class="text-green-600 font-semibold">+ Rp 7.500.000</span>
            </li>
          </ul>
          <div class="mt-6 text-center">
            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out">Lihat Semua Transaksi &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Chart, LinearScale, CategoryScale, LineElement, PointElement, Title, Tooltip, Legend, LineController } from 'chart.js';
import { useAuthStore } from '@/stores/auth'; // Import Pinia store Anda

// Mendaftarkan semua komponen yang digunakan dalam chart
Chart.register(
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  LineController
);

export default {
  name: 'DashboardPage',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore(); // Inisialisasi Pinia store

    // Fungsi untuk menangani logout
    const handleLogout = () => {
      authStore.logout(); // Panggil fungsi logout dari store
      router.push('/login'); // Redirect ke halaman login
    };

    // Memanggil fungsi getProfile dari store saat komponen dimuat
    onMounted(async () => {
      // Pastikan token sudah ada di store atau localStorage
      authStore.checkAuth();

      // Jika tidak terautentikasi, redirect ke halaman login
      if (!authStore.isAuthenticated) {
        router.push('/login');
        return; // Hentikan eksekusi lebih lanjut jika tidak terautentikasi
      }

      // Jika terautentikasi, coba ambil data profil
      const result = await authStore.getProfile();
      if (!result.success) {
        console.error("Failed to fetch profile:", result.message);
        // Jika pengambilan profil gagal (misal: token kedaluwarsa),
        // authStore.getProfile() sudah menangani logout dan redirect.
        // Anda bisa menambahkan logika tambahan di sini jika diperlukan.
      }
    });

    // Mengembalikan fungsi dan data ke template
    return {
      handleLogout,
      authStore // Ekspos authStore ke template
    };
  }
};
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.1); /* Efek hover untuk memberi kesan lebih interaktif */
}

.chart-container {
  max-width: 800px;
  margin: 0 auto;
}

progress {
  width: 100%;
  height: 20px;
  margin-top: 10px;
}
</style>
