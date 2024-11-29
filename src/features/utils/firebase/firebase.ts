// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyA1WV3NwSU6ADpF63bijgkAnxcU_yq3Ayg',
  authDomain: 'emekdeporg.firebaseapp.com',
  projectId: 'emekdeporg',
  storageBucket: 'emekdeporg.appspot.com',
  messagingSenderId: '963880719815',
  appId: '1:963880719815:web:f804dd69ef4c9ab617f5e2',
  measurementId: 'G-KB0BWE918V'
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
export default firebaseApp
