import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, setDoc, doc } from 'firebase/firestore';

const DEMO_FIREBASE_CONFIG = {
  apiKey: "demo-api-key",
  authDomain: "demo-atelier.firebaseapp.com",
  projectId: "demo-atelier",
  storageBucket: "demo-atelier.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(DEMO_FIREBASE_CONFIG);
const db = getFirestore(app);

const q = collection(db, 'artworks');
onSnapshot(q, (snapshot) => {
  console.log('Received snapshot! Docs count:', snapshot.docs.length);
  process.exit(0);
}, (err) => {
  console.error('Snapshot error:', err);
  process.exit(1);
});

// Wait a bit to see if we get a snapshot
setTimeout(() => {
  console.log('Timeout waiting for snapshot');
  process.exit(1);
}, 5000);
