<template>
  <div>
    <h1>Data dari API</h1>
    <div v-if="isLoading">Memuat data...</div>
    <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ApiDataComponent',
  data() {
    return {
      data: null, // Menyimpan data dari API
      isLoading: false, // Menyimpan status loading
      errorMessage: '', // Menyimpan pesan error
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.isLoading = true; // Menandakan proses sedang berlangsung
      this.errorMessage = ''; // Reset pesan error
      try {
        // Menggunakan URL dari variabel lingkungan
        const apiUrl = process.env.VUE_APP_SERVICE_API;
        
        // Membuat permintaan GET menggunakan axios
        const response = await axios.get(`${apiUrl}/v1/register`); // Gantilah `/endpoint` dengan endpoint yang sesuai
        
        this.data = response.data; // Menyimpan data yang didapat dari API
      } catch (error) {
        this.errorMessage = 'Terjadi kesalahan saat mengambil data dari API'; // Menampilkan error
      } finally {
        this.isLoading = false; // Menandakan proses selesai
      }
    },
  },
};
</script>

<style scoped>
/* Styling */
</style>
