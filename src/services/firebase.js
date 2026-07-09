/**
 * Firebase Authentication Service
 * Handles all Firebase Auth operations and syncs with Laravel backend
 */

import { API_BASE_URL } from './api';

// Firebase app and auth instances, cached after first initialization.
let appInstance = null;
let authInstance = null;

/**
 * Initialize Firebase with config from API.
 *
 * Safe to call multiple times; returns cached instances on subsequent calls.
 */
export const initFirebase = async (config) => {
  if (appInstance && authInstance) {
    return { app: appInstance, auth: authInstance };
  }

  try {
    // Dynamic import to avoid loading Firebase if not needed
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');

    const firebaseConfig = {
      apiKey: config['auth.firebase.api_key'],
      authDomain: config['auth.firebase.auth_domain'],
      projectId: config['auth.firebase.project_id'],
      storageBucket: `${config['auth.firebase.project_id']}.appspot.com`,
      messagingSenderId: config['auth.firebase.messaging_sender_id'],
      appId: config['auth.firebase.app_id'],
    };

    appInstance = initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);

    return { app: appInstance, auth: authInstance };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

/**
 * Get the initialized Firebase auth instance, if available.
 */
export const getFirebaseAuth = () => authInstance;

/**
 * Sync Firebase user with Laravel backend
 * This creates/updates the user in the Laravel database
 */
const syncUserWithBackend = async (idToken, provider = 'password', name = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/firebase/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        id_token: idToken,
        provider: provider,
        name: name,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw Object.assign(new Error(data.message || 'Failed to sync user with backend'), {
        status: response.status,
        errors: data.errors || null,
        code: data.error_code || null,
      });
    }

    // Store Laravel token
    if (data.data && data.data.token) {
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Backend sync error:', error);
    throw error;
  }
};

/**
 * Login with email/password using Firebase
 * Then syncs with Laravel backend
 */
export const firebaseLoginWithEmail = async (email, password, config) => {
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth } = await initFirebase(config);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Sync with Laravel backend
    return await syncUserWithBackend(idToken, 'password');
  } catch (error) {
    console.error('Firebase login error:', error);
    return {
      success: false,
      message: error.message || 'Login failed',
      errors: error.errors || null,
    };
  }
};

/**
 * Register with email/password using Firebase
 * Then syncs with Laravel backend
 */
export const firebaseRegisterWithEmail = async (email, password, name = '', config) => {
  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { auth } = await initFirebase(config);

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with name if provided
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
    }

    const idToken = await userCredential.user.getIdToken();

    // Sync with Laravel backend
    return await syncUserWithBackend(idToken, 'password', name);
  } catch (error) {
    console.error('Firebase register error:', error);
    return {
      success: false,
      message: error.message || 'Registration failed',
      errors: error.errors || null,
    };
  }
};

/**
 * Social login helper
 */
const socialLogin = async (config, providerFactory, providerName) => {
  try {
    const { auth } = await initFirebase(config);
    const provider = providerFactory();
    const { signInWithPopup } = await import('firebase/auth');

    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();

    return await syncUserWithBackend(idToken, providerName);
  } catch (error) {
    console.error(`Firebase ${providerName} login error:`, error);
    return {
      success: false,
      message: error.message || `${providerName} login failed`,
      errors: error.errors || null,
    };
  }
};

/**
 * Login with Google using Firebase
 */
export const firebaseLoginWithGoogle = async (config) => {
  const { GoogleAuthProvider } = await import('firebase/auth');
  return socialLogin(config, () => new GoogleAuthProvider(), 'google');
};

/**
 * Login with Apple using Firebase
 */
export const firebaseLoginWithApple = async (config) => {
  const { OAuthProvider } = await import('firebase/auth');
  return socialLogin(config, () => new OAuthProvider('apple.com'), 'apple');
};

/**
 * Login with Facebook using Firebase
 */
export const firebaseLoginWithFacebook = async (config) => {
  const { FacebookAuthProvider } = await import('firebase/auth');
  return socialLogin(config, () => new FacebookAuthProvider(), 'facebook');
};

/**
 * Login with GitHub using Firebase
 */
export const firebaseLoginWithGitHub = async (config) => {
  const { GithubAuthProvider } = await import('firebase/auth');
  return socialLogin(config, () => new GithubAuthProvider(), 'github');
};

/**
 * Logout from Firebase and clear Laravel token
 */
export const firebaseLogout = async () => {
  try {
    if (!authInstance) return;
    const { signOut } = await import('firebase/auth');
    await signOut(authInstance);
  } catch (error) {
    console.error('Firebase logout error:', error);
  } finally {
    // Clear Laravel token
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_preferences');
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentFirebaseUser = () => {
  return authInstance?.currentUser;
};

/**
 * Check if user is authenticated with Firebase
 */
export const isFirebaseAuthenticated = () => {
  return !!authInstance?.currentUser;
};

/**
 * Get Firebase ID token (useful for debugging)
 */
export const getFirebaseIdToken = async () => {
  if (!authInstance?.currentUser) return null;
  return await authInstance.currentUser.getIdToken();
};
