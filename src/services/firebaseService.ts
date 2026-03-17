import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'circles_user_id';
const ACCESS_GRANTED_KEY = 'circles_access_granted';
const IS_GUEST_KEY = 'circles_is_guest';
const AUTH_USER_KEY = 'circles_auth_user';

export const getOrCreateUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const setAccessGranted = (granted: boolean) => {
  localStorage.setItem(ACCESS_GRANTED_KEY, granted ? 'true' : 'false');
};

export const isAccessGranted = (): boolean => {
  return localStorage.getItem(ACCESS_GRANTED_KEY) === 'true';
};

export const setGuestMode = (isGuest: boolean) => {
  localStorage.setItem(IS_GUEST_KEY, isGuest ? 'true' : 'false');
  if (isGuest) {
    localStorage.setItem(AUTH_USER_KEY, 'guest');
  }
};

export const isGuestUser = (): boolean => {
  return localStorage.getItem(IS_GUEST_KEY) === 'true';
};

export const getAuthUser = (): string | null => {
  return localStorage.getItem(AUTH_USER_KEY);
};

export const setAuthUser = (user: string | null) => {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, user);
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(IS_GUEST_KEY);
    // Note: We DO NOT remove ACCESS_GRANTED_KEY as per requirements
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export const signInWithGoogle = async () => {
  console.log("Google login clicked");
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    setAuthUser(user.uid);
    setGuestMode(false);
    
    // Check if profile exists and sync
    await checkUserProfileExists(user.uid);
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const getCurrentUserProfile = () => {
  const user = auth.currentUser;
  const isGuest = isGuestUser();
  
  console.log("User data fetched");
  
  const profile = {
    uid: user?.uid || 'guest',
    displayName: localStorage.getItem('circles_display_name') || user?.displayName || (isGuest ? 'Guest User' : null),
    username: localStorage.getItem('circles_username') || null,
    email: user?.email || (isGuest ? 'guest@circles.app' : null),
    photoURL: localStorage.getItem('circles_profile_pic') || user?.photoURL || null,
    dob: localStorage.getItem('circles_dob') || null,
    isGuest,
    profileSetupComplete: localStorage.getItem('circles_profile_setup_complete') === 'true'
  };

  return profile;
};

export const checkUserProfileExists = async (userId: string): Promise<boolean> => {
  console.log("Checking user profile in Firestore");
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("User exists → skipping setup");
      
      // Sync to localStorage
      if (data.username) localStorage.setItem('circles_username', data.username);
      if (data.dob) localStorage.setItem('circles_dob', data.dob);
      if (data.photoURL) localStorage.setItem('circles_profile_pic', data.photoURL);
      if (data.displayName) localStorage.setItem('circles_display_name', data.displayName);
      if (data.profileSetupComplete) localStorage.setItem('circles_profile_setup_complete', 'true');
      
      return true;
    }
    
    console.log("New user → going to setup");
    return false;
  } catch (error) {
    console.error("Error checking user profile:", error);
    return false;
  }
};

export const checkUsernameUnique = async (username: string): Promise<boolean> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username.toLowerCase()));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

export const saveUserProfile = async (userId: string, profileData: { name: string; username: string; dob: string; profilePic: string }) => {
  console.log("Profile setup started");
  try {
    const userRef = doc(db, "users", userId);
    const data = {
      uid: userId,
      displayName: profileData.name,
      username: profileData.username.toLowerCase(),
      dob: profileData.dob,
      photoURL: profileData.profilePic,
      profileSetupComplete: true,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, data, { merge: true });
    
    localStorage.setItem('circles_display_name', data.displayName);
    localStorage.setItem('circles_username', data.username);
    localStorage.setItem('circles_dob', data.dob);
    localStorage.setItem('circles_profile_pic', data.photoURL);
    localStorage.setItem('circles_profile_setup_complete', 'true');
    
    console.log("Username set:", data.username);
    console.log("Profile completed");
    return data;
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.warn("Cloudinary not configured. Falling back to local URL.");
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

// Seed function to generate 100 codes (to be called once)
export const seedAccessCodes = async () => {
  const codesRef = collection(db, "accessCodes");
  const snapshot = await getDocs(query(codesRef, where("code", "!=", "")));
  
  if (snapshot.empty) {
    console.log("Seeding access codes...");
    const batch = writeBatch(db);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const generatedCodes = new Set<string>();

    while (generatedCodes.size < 100) {
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      generatedCodes.add(code);
    }

    generatedCodes.forEach(code => {
      const docRef = doc(codesRef, code);
      batch.set(docRef, {
        code,
        isUsed: false,
        usedBy: null,
        usedAt: null
      });
    });

    await batch.commit();
    console.log("100 access codes seeded.");
  }
};

export const validateAccessCode = async (code: string): Promise<{ valid: boolean; error?: string }> => {
  // --- DEVELOPER BACKDOOR (TEST ACCESS CODE) ---
  // This code is for testing purposes only and bypasses database checks.
  if (code.toUpperCase() === "1234567890") {
    console.log("Test access code used");
    return { valid: true };
  }
  // ---------------------------------------------

  try {
    const codeRef = doc(db, "accessCodes", code.toUpperCase());
    const codeDoc = await getDoc(codeRef);

    if (!codeDoc.exists()) {
      return { valid: false, error: "Invalid access code" };
    }

    const data = codeDoc.data();
    if (data.isUsed) {
      return { valid: false, error: "Code already used" };
    }

    // Mark as used immediately to prevent race conditions
    await updateDoc(codeRef, {
      isUsed: true,
      usedAt: serverTimestamp()
    });

    console.log("Access code validated");
    console.log("Access code used");
    return { valid: true };
  } catch (error) {
    console.error("Error validating access code:", error);
    return { valid: false, error: "Validation failed. Try again." };
  }
};

export const linkUserToCode = async (userId: string, code: string) => {
  // Skip linking for the test access code as it's not stored in Firestore
  if (code.toUpperCase() === "1234567890") {
    return;
  }

  try {
    const codeRef = doc(db, "accessCodes", code.toUpperCase());
    await updateDoc(codeRef, {
      usedBy: userId
    });
    console.log("User linked to code");
  } catch (error) {
    console.error("Error linking user to code:", error);
  }
};

export const saveOnboardingData = async (userId: string, data: any) => {
  if (isGuestUser()) return;
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      userId,
      class: data.classLevel,
      stream: data.stream,
      subjects: data.subjects,
      examsSelected: data.competitiveExams,
      createdAt: serverTimestamp()
    }, { merge: true });
    console.log("User Saved to Firebase");
  } catch (error) {
    console.error("Error saving onboarding data to Firebase:", error);
  }
};

export const updateChapterProgress = async (userId: string, type: string, subject: string, completedChapters: string[]) => {
  if (isGuestUser()) return;
  try {
    const progressId = `${userId}_${type}_${subject.replace(/\s/g, '_')}`;
    const progressRef = doc(db, "progress", progressId);
    await setDoc(progressRef, {
      userId,
      type,
      subject,
      completedChapters,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log("Progress Updated in Firebase");
  } catch (error) {
    console.error("Error updating progress in Firebase:", error);
  }
};

export const saveTimerMode = async (userId: string, mode: string) => {
  if (isGuestUser()) return;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      selectedTimerMode: mode,
      updatedAt: serverTimestamp()
    });
    console.log("Timer Mode Saved to Firebase");
  } catch (error) {
    console.error("Error saving timer mode to Firebase:", error);
  }
};
