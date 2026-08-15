/* ==========================================
   Renu Store Pro - Firebase Authentication
   js/auth.js
========================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ==========================================
   1. FIREBASE CONFIGURATION
   (Replace with your actual Web App credentials)
========================================== */
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/* ==========================================
   2. UI & MESSAGE HELPERS
========================================== */

function showAuthMessage(elementId, text, type = "error") {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.style.display = "block";
        messageEl.style.color = type === "success" ? "#2e7d32" : "#d32f2f";
        messageEl.style.backgroundColor = type === "success" ? "#e8f5e9" : "#ffebee";
        messageEl.style.padding = "10px 14px";
        messageEl.style.borderRadius = "6px";
        messageEl.style.marginTop = "15px";
        messageEl.style.fontSize = "0.9rem";
    }

    if (typeof window.showToast === "function") {
        window.showToast((type === "success" ? "✅ " : "❌ ") + text);
    }
}

function getFirebaseErrorMessage(error) {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "This email is already registered.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Invalid email or password.";
        case "auth/weak-password":
            return "Password must be at least 6 characters long.";
        case "auth/popup-closed-by-user":
            return "Google sign-in popup was closed before completing.";
        case "auth/cancelled-popup-request":
            return "Google sign-in request was cancelled.";
        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";
        case "auth/operation-not-allowed":
            return "This sign-in method is not enabled in Firebase Console.";
        default:
            return error.message || "An authentication error occurred.";
    }
}

/* ==========================================
   3. LOGOUT FUNCTIONALITY
========================================== */

export async function logout() {
    try {
        await signOut(auth);
        if (typeof window.showToast === "function") {
            window.showToast("👋 Logged out successfully");
        }
        window.location.href = "login.html";
    } catch (error) {
        console.error("Firebase logout error:", error);
    }
}

// Make logout globally accessible for inline header buttons/events
window.logout = logout;

/* ==========================================
   4. SESSION LISTENER (onAuthStateChanged)
========================================== */

onAuthStateChanged(auth, (user) => {
    const loginNavLinks = document.querySelectorAll('a[href="login.html"]');

    if (user) {
        // User details available: user.uid, user.displayName, user.email, user.photoURL
        console.log("Firebase Session Active:", {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL
        });

        loginNavLinks.forEach((link) => {
            const shortName = user.displayName ? user.displayName.split(" ")[0] : "Account";
            link.textContent = `Hi, ${shortName}`;
            link.href = "#";
            link.onclick = (e) => {
                e.preventDefault();
                if (confirm("Do you want to log out?")) {
                    logout();
                }
            };
        });
    } else {
        console.log("No active Firebase user session.");
        loginNavLinks.forEach((link) => {
            link.textContent = "Login";
            link.href = "login.html";
            link.onclick = null;
        });
    }
});

/* ==========================================
   5. FORM EVENT HANDLERS
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 5.1 LOGIN FORM ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById("loginEmail");
            const passwordInput = document.getElementById("loginPassword");
            const rememberMe = document.getElementById("rememberMe")?.checked;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            const email = emailInput?.value.trim().toLowerCase();
            const password = passwordInput?.value;

            if (!email || !password) {
                showAuthMessage("loginMessage", "Please enter both email and password.");
                return;
            }

            // Set Loading State
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Logging in...";

            try {
                // Set Session Persistence based on Remember Me
                const persistenceMode = rememberMe ? browserLocalPersistence : browserSessionPersistence;
                await setPersistence(auth, persistenceMode);

                // Firebase Sign In
                await signInWithEmailAndPassword(auth, email, password);
                
                showAuthMessage("loginMessage", "Login successful! Redirecting...", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);
            } catch (error) {
                console.error("Login Error:", error);
                showAuthMessage("loginMessage", getFirebaseErrorMessage(error));
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // --- 5.2 GOOGLE LOGIN ---
    const googleBtn = document.querySelector(".google-login");
    if (googleBtn) {
        googleBtn.addEventListener("click", async () => {
            googleBtn.disabled = true;
            const originalText = googleBtn.textContent;
            googleBtn.textContent = "Connecting to Google...";

            try {
                await signInWithPopup(auth, googleProvider);
                showAuthMessage("loginMessage", "Google login successful! Redirecting...", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);
            } catch (error) {
                console.error("Google Auth Error:", error);
                showAuthMessage("loginMessage", getFirebaseErrorMessage(error));
                googleBtn.disabled = false;
                googleBtn.textContent = originalText;
            }
        });
    }

    // --- 5.3 CREATE ACCOUNT (SIGNUP FORM) ---
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById("signupName");
            const emailInput = document.getElementById("signupEmail");
            const passwordInput = document.getElementById("signupPassword");
            const confirmInput = document.getElementById("confirmPassword");
            const termsCheckbox = document.getElementById("termsCheckbox");
            const submitBtn = document.getElementById("signupButton");

            const name = nameInput?.value.trim();
            const email = emailInput?.value.trim().toLowerCase();
            const password = passwordInput?.value;
            const confirmPassword = confirmInput?.value;

            // Validations
            if (!name || name.length < 2) {
                showAuthMessage("signupMessage", "Please enter your full name.");
                nameInput?.focus();
                return;
            }
            if (!email) {
                showAuthMessage("signupMessage", "Please enter a valid email address.");
                emailInput?.focus();
                return;
            }
            if (!password || password.length < 6) {
                showAuthMessage("signupMessage", "Password must be at least 6 characters.");
                passwordInput?.focus();
                return;
            }
            if (password !== confirmPassword) {
                showAuthMessage("signupMessage", "Passwords do not match.");
                confirmInput?.focus();
                return;
            }
            if (termsCheckbox && !termsCheckbox.checked) {
                showAuthMessage("signupMessage", "Please accept the Terms & Conditions.");
                return;
            }

            // Loading State
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Creating Account...";

            try {
                // Create User
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Update Profile Display Name
                await updateProfile(userCredential.user, {
                    displayName: name
                });

                showAuthMessage("signupMessage", "Account created successfully! Redirecting...", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } catch (error) {
                console.error("Signup Error:", error);
                showAuthMessage("signupMessage", getFirebaseErrorMessage(error));
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // --- 5.4 FORGOT PASSWORD FORM ---
    const forgotForm = document.getElementById("forgotPasswordForm");
    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById("resetEmail");
            const submitBtn = document.getElementById("resetButton");

            const email = emailInput?.value.trim().toLowerCase();
            if (!email) {
                showAuthMessage("resetMessage", "Please enter your email address.");
                emailInput?.focus();
                return;
            }

            // Loading State
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Sending Email...";

            try {
                await sendPasswordResetEmail(auth, email);
                showAuthMessage("resetMessage", "Password reset link sent to your email!", "success");
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            } catch (error) {
                console.error("Password Reset Error:", error);
                showAuthMessage("resetMessage", getFirebaseErrorMessage(error));
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});
