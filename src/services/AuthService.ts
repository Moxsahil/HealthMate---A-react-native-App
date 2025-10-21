import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  AuthError,
  OAuthProvider,
} from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

// Enable WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// Firebase configuration - Real Firebase setup
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyA8kVwTl7FZmS8xVr1K2L3J4H9G5F2E1D0",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "healthmate-demo-12345.firebaseapp.com",
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "healthmate-demo-12345",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "healthmate-demo-12345.appspot.com",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:123456789012:web:abcdef1234567890",
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

// Initialize Firebase (only once)
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");
} else {
  app = getApps()[0];
  console.log("Using existing Firebase app");
}

// Initialize Auth (Firebase automatically uses AsyncStorage in React Native)
auth = getAuth(app);
console.log("Firebase Auth initialized");

export { auth };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: boolean;
}

export class AuthService {
  // Email/Password Registration
  static async registerWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<AuthUser> {
    try {
      console.log("Firebase registration attempt for:", email, name);

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      console.log("Firebase user created:", firebaseUser.uid);

      // Update user profile with display name
      await updateProfile(firebaseUser, {
        displayName: name,
      });

      console.log("User profile updated with name:", name);

      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: name,
        avatar: firebaseUser.photoURL || undefined,
        emailVerified: firebaseUser.emailVerified,
      };

      console.log("User registered successfully:", authUser);
      return authUser;
    } catch (error: any) {
      console.error("Registration error:", error);
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  // Email/Password Login
  static async loginWithEmail(
    email: string,
    password: string
  ): Promise<AuthUser> {
    try {
      console.log("Firebase login attempt for:", email);

      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      console.log("Firebase user signed in:", firebaseUser.uid);

      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || "User",
        avatar: firebaseUser.photoURL || undefined,
        emailVerified: firebaseUser.emailVerified,
      };

      console.log("User logged in successfully:", authUser);
      return authUser;
    } catch (error: any) {
      console.error("Login error:", error);
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  // Apple Sign In (iOS only)
  static async loginWithApple(): Promise<AuthUser> {
    try {
      if (Platform.OS !== "ios") {
        throw new Error("Apple Sign-In is only available on iOS devices");
      }

      // Check if Apple Sign-In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Apple Sign-In is not available on this device");
      }

      console.log("Apple Sign-In attempt started");

      // Generate a random nonce for security
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      // Request Apple ID credential
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      console.log("Apple Sign-In successful:", appleCredential.user);

      // Create an Apple credential for Firebase
      const provider = new OAuthProvider("apple.com");
      const credential = provider.credential({
        idToken: appleCredential.identityToken!,
        rawNonce: nonce,
      });

      // Sign in to Firebase with the Apple credential
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      console.log("Firebase Apple Sign-In successful:", firebaseUser.uid);

      // Apple doesn't always provide name and email, so use what's available
      const displayName =
        appleCredential.fullName?.givenName &&
        appleCredential.fullName?.familyName
          ? `${appleCredential.fullName.givenName} ${appleCredential.fullName.familyName}`
          : firebaseUser.displayName || "User";

      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || appleCredential.email || "",
        name: displayName,
        avatar: firebaseUser.photoURL || undefined,
        emailVerified: firebaseUser.emailVerified,
      };

      // Update profile if we got name from Apple but Firebase doesn't have it
      if (displayName !== firebaseUser.displayName && displayName !== "User") {
        await updateProfile(firebaseUser, { displayName });
      }

      console.log("Apple user authenticated:", authUser);
      return authUser;
    } catch (error: any) {
      console.error("Apple Sign-In error:", error);

      if (error.code === "ERR_CANCELED") {
        throw new Error("Apple Sign-In was cancelled");
      } else if (error.code === "ERR_INVALID_RESPONSE") {
        throw new Error("Invalid response from Apple");
      } else if (error.code === "ERR_NOT_HANDLED") {
        throw new Error("Apple Sign-In not handled");
      } else if (error.code === "ERR_UNKNOWN") {
        throw new Error("Unknown Apple Sign-In error");
      }

      throw new Error("Apple Sign-In failed: " + error.message);
    }
  }

  // Password Reset
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  // Sign Out
  static async logout(): Promise<void> {
    try {
      console.log("Signing out user...");
      await signOut(auth);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Failed to sign out");
    }
  }

  // Update User Profile
  static async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user signed in");

      await updateProfile(user, updates);
    } catch (error) {
      throw new Error("Failed to update profile");
    }
  }

  // Get Current User
  static getCurrentUser(): AuthUser | null {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || "User",
        avatar: firebaseUser.photoURL || undefined,
        emailVerified: firebaseUser.emailVerified,
      };
    }
    return null;
  }

  // Auth State Listener
  static onAuthStateChange(
    callback: (user: AuthUser | null) => void
  ): () => void {
    console.log("Setting up Firebase auth state listener...");

    return onAuthStateChanged(auth, (firebaseUser) => {
      console.log(
        "Auth state changed:",
        firebaseUser ? firebaseUser.uid : "null"
      );

      if (firebaseUser) {
        const authUser: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || "User",
          avatar: firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified,
        };
        console.log("User authenticated:", authUser);
        callback(authUser);
      } else {
        console.log("User not authenticated");
        callback(null);
      }
    });
  }

  // Error message mapping
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      default:
        return "An error occurred. Please try again.";
    }
  }

  // Demo/Development Methods
  static async createDemoAccount(): Promise<AuthUser> {
    // For development/demo purposes
    const demoEmail = `demo_${Date.now()}@healthmate.app`;
    const demoPassword = "demo123456";
    const demoName = "Demo User";

    return this.registerWithEmail(demoEmail, demoPassword, demoName);
  }

  static async loginAsDemoUser(): Promise<AuthUser> {
    // For development/demo purposes
    const demoEmail = "demo@healthmate.app";
    const demoPassword = "demo123456";

    try {
      return await this.loginWithEmail(demoEmail, demoPassword);
    } catch (error) {
      // If demo user doesn't exist, create it
      return this.registerWithEmail(demoEmail, demoPassword, "Demo User");
    }
  }
}

export default AuthService;
