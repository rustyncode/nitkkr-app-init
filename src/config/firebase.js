import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// These keys are safe for public use in a client-side app
const firebaseConfig = {
    apiKey: "AIzaSyCyaVgPzAgS-1g6CtzsJ4itv-gJ0A1xjKI",
    authDomain: "rustinet-66cb0.firebaseapp.com",
    projectId: "rustinet-66cb0",
    storageBucket: "rustinet-66cb0.firebasestorage.app",
    messagingSenderId: "1037894151160", // Derived from client_id/app_id prefix
    appId: "1:1037894151160:web:48657fd5c64c78440182ce" // Placeholder, user might need to update this
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
