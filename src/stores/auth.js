import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const baseURL = process.env.VUE_APP_SERVICE_API || 'http://localhost:8080';

  // --- Firebase Client SDK initialization ---
  const firebaseConfig = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_FIREBASE_APP_ID,
    measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
  };
  const firebaseApp = initializeApp(firebaseConfig);
  const firebaseAuth = getAuth(firebaseApp);
  // --- End Firebase Client SDK initialization ---

  let confirmationResult = null;
  const currentPhoneNumber = ref(null);

  const login = async (credentials) => {
    isLoading.value = true;
    try {
      const response = await fetch(`${baseURL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.phoneNumber) {
          currentPhoneNumber.value = data.phoneNumber;
          return {
            success: true,
            mfaRequired: true,
            message: data.message || 'OTP verification initiated.',
            username: data.username,
          };
        } else if (data.token) {
          token.value = data.token;
          user.value = data.user || { username: data.username };
          isAuthenticated.value = true;
          localStorage.setItem('auth_token', data.token);
          return {
            success: true,
            mfaRequired: false,
            message: data.message || 'Login successful.',
          };
        } else {
          return { success: false, message: data.message || 'Invalid server response.' };
        }
      } else {
        return { success: false, message: data.message || 'Login failed.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error or server unavailable.' };
    } finally {
      isLoading.value = false;
    }
  };

  const sendOtpFirebase = async (recaptchaContainerId = 'recaptcha-container') => {
    isLoading.value = true;
    if (!currentPhoneNumber.value) {
      isLoading.value = false;
      return { success: false, message: 'Phone number not available to send OTP.' };
    }
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, {
        'size': 'normal',
        'expired-callback': () => { /* Optional expired handler */ }
      });
      await window.recaptchaVerifier.render();

      confirmationResult = await signInWithPhoneNumber(firebaseAuth, currentPhoneNumber.value, window.recaptchaVerifier);
      return { success: true, message: 'OTP sent!' };
    } catch (error) {
      console.error("Error sending OTP via Firebase:", error);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      let errorMessage = error.message || 'Failed to send OTP via Firebase.';
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'Invalid phone number format.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many OTP requests. Please try again later.';
          break;
        case 'auth/argument-error':
          errorMessage = 'Internal error during OTP request. Please try again.';
          break;
        case 'auth/captcha-check-failed':
          errorMessage = 'reCAPTCHA challenge failed. Please try again.';
          break;
        case 'auth/web-storage-unsupported':
          errorMessage = 'Browser storage not supported. Use a different browser or enable cookies.';
          break;
      }
      return { success: false, message: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  const verifyOtpAndLoginWithFirebase = async (otpCode) => {
    isLoading.value = true;
    if (!confirmationResult) {
      isLoading.value = false;
      return { success: false, message: 'OTP flow not initiated. Please try again.' };
    }
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      const firebaseIdToken = await userCredential.user.getIdToken();

      const response = await fetch(`${baseURL}/api/v1/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: firebaseIdToken }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        token.value = data.token;
        user.value = data.user || { username: data.username };
        isAuthenticated.value = true;
        localStorage.setItem('auth_token', data.token);
        if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
        currentPhoneNumber.value = null;
        return { success: true, message: data.message || 'Login successful via OTP.' };
      } else {
        return { success: false, message: data.message || 'Backend verification failed.' };
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
      let errorMessage = error.message || 'OTP verification failed.';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Incorrect OTP code!';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP expired. Please resend.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Try again later.';
      }
      return { success: false, message: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  const getProfile = async () => {
    isLoading.value = true;
    try {
      if (!token.value) {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          token.value = storedToken;
          isAuthenticated.value = true;
        } else {
          isLoading.value = false;
          return { success: false, message: 'No authentication token found.' };
        }
      }

      const response = await fetch(`${baseURL}/api/v1/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        user.value = { ...user.value, ...data };
        return { success: true, profile: data, message: 'Profile fetched successfully.' };
      } else {
        if (response.status === 401) {
          logout();
          return { success: false, message: data.message || 'Unauthorized: Please log in again.' };
        }
        return { success: false, message: data.message || 'Failed to fetch profile.' };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, message: 'Network error or server unavailable.' };
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData) => {
    isLoading.value = true;
    try {
      const response = await fetch(`${baseURL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email,
          username: userData.username,
          phone: userData.phone,
          password: userData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Registration successful',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'An error occurred during registration. Please try again.',
        error: error.message,
      };
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ VERSI BARU - Logout panggil backend /logout dan bersihkan state frontend
  const logout = async () => {
    try {
      await fetch(`${baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        },
        credentials: 'include', // jika backend pakai cookie
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }

    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    currentPhoneNumber.value = null;
    localStorage.removeItem('auth_token');
  };

  const checkAuth = () => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      token.value = storedToken;
      isAuthenticated.value = true;
    } else {
      isAuthenticated.value = false;
    }
  };

  return {
    user,
    token,
    currentPhoneNumber,
    isAuthenticated,
    isLoading,
    login,
    sendOtpFirebase,
    verifyOtpAndLoginWithFirebase,
    getProfile,
    register,
    logout,
    checkAuth,
  };
});
