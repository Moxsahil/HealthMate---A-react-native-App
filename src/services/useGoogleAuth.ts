import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./AuthService";
import type { AuthUser } from "./AuthService";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectUri = makeRedirectUri({
    scheme: "healthmate",
    path: "redirect",
  });

  console.log("Redirect URI:", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.idToken) {
        handleGoogleSignIn(authentication.idToken);
      }
    } else if (response?.type === "error") {
      setError("Google Sign-In failed");
      console.error("Google auth error:", response.error);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      console.log("Signing in with Google ID token...");
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || "User",
        avatar: firebaseUser.photoURL || undefined,
        emailVerified: firebaseUser.emailVerified,
      };

      console.log("Google Sign-In successful:", authUser);
      setUser(authUser);
    } catch (error: any) {
      console.error("Firebase Google Sign-In error:", error);
      setError(error.message);
    }
  };

  return {
    request,
    promptAsync,
    user,
    error,
  };
}
