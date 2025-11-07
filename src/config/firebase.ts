import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {

  apiKey: "AIzaSyBzp9MZ-KRdt234164sRmnaYTeWEO7Eefk",

  authDomain: "orca-pay.firebaseapp.com",

  projectId: "orca-pay",

  storageBucket: "orca-pay.firebasestorage.app",

  messagingSenderId: "947822787225",

  appId: "1:947822787225:web:14809d75855cfe9ee49608",

  measurementId: "G-TF5LGRMXLN"

};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
