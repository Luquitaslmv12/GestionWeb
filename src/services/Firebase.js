import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdeq-cdcDFD2Tti-_Tkg1exvhcnZKkQ_Y",
  authDomain: "gestion-flota-camiones.firebaseapp.com",
  projectId: "gestion-flota-camiones",
  storageBucket: "gestion-flota-camiones.firebasestorage.app",
  messagingSenderId: "306418625238",
  appId: "1:306418625238:web:065ba8155d02fdb4447777",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
