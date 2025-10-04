import React, { useState, useEffect, createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFirebaseConfig, getAppId } from "../config/firebase";
import { getStorageClient, checkStorageConfig } from "../config/storage";

const FirebaseContext = createContext(null);

export function FirebaseProvider({ children }) {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [storage, setStorage] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [appId, setAppId] = useState("default-app-id");

  useEffect(() => {
    const currentAppId = getAppId();
    setAppId(currentAppId);

    const firebaseConfig = getFirebaseConfig();
    const app = initializeApp(firebaseConfig);
    const firestoreDb = getFirestore(app);
    const firebaseAuth = getAuth(app);

    // Usar MinIO en lugar de Firebase Storage
    checkStorageConfig(); // Verificar configuración de MinIO
    const minioStorage = getStorageClient();

    setDb(firestoreDb);
    setAuth(firebaseAuth);
    setStorage(minioStorage);

    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
      } else {
        setUser(null);
        setUserId(null);
      }
      setLoadingFirebase(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Auth no está inicializado");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const logout = async () => {
    if (!auth) throw new Error("Auth no está inicializado");
    await signOut(auth);
  };

  if (loadingFirebase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <div className="text-gray-700 text-lg font-medium">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider
      value={{
        db,
        auth,
        storage,
        user,
        userId,
        appId,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}
