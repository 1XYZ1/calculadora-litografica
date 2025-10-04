// Firebase configuration from environment variables
export const getFirebaseConfig = () => {
  // Check if running in build mode with global variables
  if (typeof __firebase_config !== "undefined") {
    return JSON.parse(__firebase_config);
  }

  // Use environment variables
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
};

export const getAppId = () => {
  if (typeof __app_id !== "undefined") {
    return __app_id;
  }
  return import.meta.env.VITE_APP_ID || "default-app-id";
};

export const getInitialAuthToken = () => {
  if (typeof __initial_auth_token !== "undefined") {
    return __initial_auth_token;
  }
  return import.meta.env.VITE_INITIAL_AUTH_TOKEN || null;
};
