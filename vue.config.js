const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://project3am.42n.fun', // Ganti dengan URL API yang sesuai
        changeOrigin: true,
        secure: true, // Nonaktifkan verifikasi SSL jika diperlukan
        pathRewrite: {
          '^/api': '', // Jika perlu menghapus prefix '/api' dari URL yang diproksikan
        },
      },
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
});
