// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqkthuqSjfIYNphtVzaTfC9OrWkRdyInI",
  authDomain: "the-creator-ai---extension.firebaseapp.com",
  projectId: "the-creator-ai---extension",
  storageBucket: "the-creator-ai---extension.appspot.com",
  messagingSenderId: "880822858438",
  appId: "1:880822858438:web:858b3ee79f18fd7985ddc7",
  measurementId: "G-GHB1S5QL2Y"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
