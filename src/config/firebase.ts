import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
// Usa variáveis de ambiente se disponíveis, senão usa as credenciais diretas
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBzp9MZ-KRdt234164sRmnaYTeWEO7Eefk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "orca-pay.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "orca-pay",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "orca-pay.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "947822787225",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:947822787225:web:14809d75855cfe9ee49608",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TF5LGRMXLN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
