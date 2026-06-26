/**
 * Firebase Authentication Service
 * Handles all Firebase Auth operations
 */

// Firebase config will be loaded from API
let firebaseConfig = null;
let app = null;
let auth = null;

/**
 * Initialize Firebase with config from API
 */
export const initFirebase = async (config) => {
  if (app) return { app, auth };
  
  try {
    // Dynamic import to avoid loading Firebase if not needed
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    
    firebaseConfig = {
      apiKey: config['auth.firebase.api_key'],
      authDomain: config['auth.firebase.auth_domain'],
      projectId: config['auth.firebase.project_id'],
      // These are optional but recommended
      storageBucket: `${config['auth.firebase.project_id']}.appspot.com`,
      messagingSenderId: config['auth.firebase.messaging_sender_id'],
      appId: config['auth.firebase.app_id'],
    };
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    return { app, auth };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

/**
 * Login with email/password using Firebase
 */
export const firebaseLoginWithEmail = async (email, password) => {
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth } = await initFirebase(firebaseConfig);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    
    return {
      success: true,
      data: {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || email.split('@')[0],
          email_verified: userCredential.user.emailVerified,
        },
        token: idToken,
        provider: 'firebase',
      },
    };
  } catch (error) {
    console.error('Firebase login error:', error);
    return {
      success: false,
      message: error.message || 'Login failed',
    };
  }
};

/**
 * Register with email/password using Firebase
 */
export const firebaseRegisterWithEmail = async (email, password, name = '') => {
  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { auth } = await initFirebase(firebaseConfig);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with name if provided
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    
    const idToken = await userCredential.user.getIdToken();
    
    return {
      success: true,
      data: {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: name || email.split('@')[0],
          email_verified: userCredential.user.emailVerified,
        },
        token: idToken,
        provider: 'firebase',
      },
    };
  } catch (error) {
    console.error('Firebase register error:', error);
    return {
      success: false,
      message: error.message || 'Registration failed',
    };
  }
};

/**
 * Login with Google using Firebase
 */
export const firebaseLoginWithGoogle = async () => {
  try {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const { auth } = await initFirebase(firebaseConfig);
    
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();
    
    return {
      success: true,
      data: {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          photo_url: userCredential.user.photoURL,
          email_verified: userCredential.user.emailVerified,
        },
        token: idToken,
        provider: 'firebase',
      },
    };
  } catch (error) {
    console.error('Firebase Google login error:', error);
    return {
      success: false,
      message: error.message || 'Google login failed',
    };
  }
};

/**
 * Login with Apple using Firebase
 */
export const firebaseLoginWithApple = async () => {
  try {
    const { OAuthProvider, signInWithPopup } = await import('firebase/auth');
    const { auth } = await initFirebase(firebaseConfig);
    
    const provider = new OAuthProvider('apple.com');
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();
    
    return {
      success: true,
      data: {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          email_verified: userCredential.user.emailVerified,
        },
        token: idToken,
        provider: 'firebase',
      },
    };
  } catch (error) {
    console.error('Firebase Apple login error:', error);
    return {
      success: false,
      message: error.message || 'Apple login failed',
    };
  }
};

/**
 * Login with Facebook using Firebase
 */
export const firebaseLoginWithFacebook = async () => {
  try {
    const { FacebookAuthProvider, signInWithPopup } = await import('firebase/auth');
    const { auth } = await initFirebase(firebaseConfig);
    
    const provider = new FacebookAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();
    
    return {
      success: true,
      data: {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          photo_url: userCredential.user.photoURL,
          email_verified: userCredential.user.emailVerified,
        },
        token: idToken,
        provider: 'firebase',
      },
    };
  } catch (error) {
    console.error('Firebase Facebook login error:', error);
    return {
      success: false,
      message: error.message || 'Facebook login failed',
    };
  }
};

/**
 * Login with GitHub using Firebase
 */
export const firebaseLoginWithGitHub = async () => {
  try {
    const { GithubAuthProvider, signInWithPopup } = await import('firebase/auth');
    const { auth } = await initFirebase(firebaseConfig);
    
    const provider = new GithubAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();
    
    return {
      success: true,
      data: {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          photo_url: userCredential.user.photoURL,
          email_verified: userCredential.user.emailVerified,
        },
        token: idToken,
        provider: 'firebase',
      },
    };
  } catch (error) {
    console.error('Firebase GitHub login error:', error);
    return {
      success: false,
      message: error.message || 'GitHub login failed',
    };
  }
};

/**
 * Logout from Firebase
 */
export const firebaseLogout = async () => {
  try {
    if (!auth) return;
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  } catch (error) {
    console.error('Firebase logout error:', error);
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentFirebaseUser = () => {
  return auth?.currentUser;
};

/**
 * Check if user is authenticated with Firebase
 */
export const isFirebaseAuthenticated = () => {
  return !!auth?.currentUser;
};
