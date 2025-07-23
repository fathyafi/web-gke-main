import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/views/Login/LoginPage.vue';  
import RegisterPage from '@/views/Register/index.vue';
import OtpPage from '@/views/Verifikasioke/OtpVerification.vue';
import Dashboard from '@/views/Dashboard/index.vue';
import ForgotPassword from '@/views/ForgotPassword/index.vue';  // Import ForgotPassword

const routes = [
  { path: '/', name: 'login', component: LoginPage },
  { path: '/login', name: 'login-page', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },
  {
    path: '/otp', // Path sederhana, tidak ada parameter di URL
    name: 'OTP',
    component: OtpPage,
    // props: true dihapus karena kita tidak lagi meneruskan data via props dari params
    meta: { requiresPhoneAuthInitiation: true }
  },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPassword },  // Rute Forgot Password
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
