// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyB1BdL7kWtHLPWpPBPjY1HSv1jgrZZZJ38',
  authDomain: 'pink-or-blue.firebaseapp.com',
  databaseURL: 'https://pink-or-blue-default-rtdb.firebaseio.com',
  projectId: 'pink-or-blue',
  storageBucket: 'pink-or-blue.firebasestorage.app',
  messagingSenderId: '1078549529740',
  appId: '1:1078549529740:web:0078bbce50f8b99dd467a9',
  measurementId: 'G-QSDCTH6XVP',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const realtimeDb = getDatabase(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, realtimeDb, auth };
