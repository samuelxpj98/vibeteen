import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// SUBSTITUA COM SUAS CHAVES DO CONSOLE DO FIREBASE
// Vá em: console.firebase.google.com -> Seu Projeto -> Configurações do Projeto -> Geral -> Apps -> Web
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI", 
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "SEU_MESSAGING_ID",
  appId: "SEU_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o Banco de Dados (Firestore)
export const db = getFirestore(app);