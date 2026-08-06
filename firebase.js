import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaYwLBJgnwv8_LB9feIRumNUg-ttGZw34",
  authDomain: "breakfast-checklist-dc02f.firebaseapp.com",
  projectId: "breakfast-checklist-dc02f",
  storageBucket: "breakfast-checklist-dc02f.firebasestorage.app",
  messagingSenderId: "538543988908",
  appId: "1:538543988908:web:c1dcfe63c8fd3932c9ff09"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  doc,
  setDoc,
  onSnapshot
};