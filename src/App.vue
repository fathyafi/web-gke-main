<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style scoped>
#app {
  background-image: url('@/assets/background8.jpg');
  background-size: cover;  /* Menyesuaikan gambar untuk menutupi seluruh area */
  background-position: center; /* Memastikan gambar berada di tengah */
  min-height: 100vh; /* Pastikan gambar mengisi seluruh layar vertikal */
}
</style>
