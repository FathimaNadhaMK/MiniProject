// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXQ8dTFjHS2BSTqEb7VFHF6DzC-RTyajo",
  authDomain: "localstream-6cf08.firebaseapp.com",
  projectId: "localstream-6cf08",
  storageBucket: "localstream-6cf08.firebasestorage.app",
  messagingSenderId: "208493595088",
  appId: "1:208493595088:web:1eda674c9220f1a41451d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
export {auth};