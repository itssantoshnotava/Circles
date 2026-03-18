import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs, serverTimestamp, writeBatch, onSnapshot, arrayUnion, arrayRemove, orderBy, limit, addDoc } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';
import { Room, RoomMessage, UserProfile } from "../types";

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
      if (data.photoURL) localStorage.setItem('circles_profile_pic', data.photoURL);
      if (data.displayName) localStorage.setItem('circles_display_name', data.displayName);
      if (data.profileSetupComplete) localStorage.setItem('circles_profile_setup_complete', 'true');
      
      // Fetch private data if it's the current user
      if (auth.currentUser?.uid === userId) {
        const privateRef = doc(db, "users", userId, "private", "data");
        const privateDoc = await getDoc(privateRef);
        if (privateDoc.exists()) {
          const privateData = privateDoc.data();
          if (privateData.dob) localStorage.setItem('circles_dob', privateData.dob);
        }
      }
      
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
    const batch = writeBatch(db);
    
    // Public profile
    const userRef = doc(db, "users", userId);
    const publicData = {
      uid: userId,
      displayName: profileData.name,
      username: profileData.username.toLowerCase(),
      photoURL: profileData.profilePic,
      profileSetupComplete: true,
      updatedAt: serverTimestamp()
    };
    batch.set(userRef, publicData, { merge: true });

    // Private data (PII)
    const privateRef = doc(db, "users", userId, "private", "data");
    const privateData = {
      email: auth.currentUser?.email || null,
      dob: profileData.dob,
      updatedAt: serverTimestamp()
    };
    batch.set(privateRef, privateData, { merge: true });

    await batch.commit();
    
    localStorage.setItem('circles_display_name', profileData.name);
    localStorage.setItem('circles_username', profileData.username.toLowerCase());
    localStorage.setItem('circles_dob', profileData.dob);
    localStorage.setItem('circles_profile_pic', profileData.profilePic);
    localStorage.setItem('circles_profile_setup_complete', 'true');
    
    console.log("Username set:", profileData.username.toLowerCase());
    console.log("Profile completed");
    return publicData;
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

// --- ROOMS SYSTEM ---

export const createRoom = async (userId: string): Promise<string> => {
  const roomId = Math.floor(10000 + Math.random() * 90000).toString();
  const roomRef = doc(db, "rooms", roomId);
  
  const roomData: Room = {
    roomId,
    hostId: userId,
    participants: [userId],
    createdAt: serverTimestamp(),
    active: true,
    timerState: {
      timeLeft: 25 * 60,
      isRunning: false,
      mode: 'pomodoro',
      lastUpdated: serverTimestamp()
    }
  };

  await setDoc(roomRef, roomData);
  console.log(`Room ${roomId} created by ${userId}`);
  return roomId;
};

export const joinRoom = async (userId: string, roomId: string): Promise<boolean> => {
  const roomRef = doc(db, "rooms", roomId);
  const roomDoc = await getDoc(roomRef);

  if (!roomDoc.exists() || !roomDoc.data().active) {
    throw new Error("Room not found or inactive");
  }

  await updateDoc(roomRef, {
    participants: arrayUnion(userId)
  });
  
  console.log(`User ${userId} joined room ${roomId}`);
  return true;
};

export const leaveRoom = async (userId: string, roomId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    participants: arrayRemove(userId)
  });
  console.log(`User ${userId} left room ${roomId}`);
};

export const kickUser = async (roomId: string, userId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    participants: arrayRemove(userId)
  });
  console.log(`User ${userId} kicked from room ${roomId}`);
};

export const syncRoomTimer = async (roomId: string, timerState: any) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    timerState: {
      ...timerState,
      lastUpdated: serverTimestamp()
    }
  });
};

export const sendRoomMessage = async (roomId: string, userId: string, username: string, profilePic: string | null | undefined, message: string) => {
  const messagesRef = collection(db, "roomMessages");
  await addDoc(messagesRef, {
    roomId,
    userId,
    username,
    profilePic: profilePic || null,
    message,
    createdAt: serverTimestamp()
  });
};

export const listenToRoom = (roomId: string, callback: (room: Room) => void) => {
  const roomRef = doc(db, "rooms", roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Room);
    }
  });
};

export const listenToRoomMessages = (roomId: string, callback: (messages: RoomMessage[]) => void) => {
  const messagesRef = collection(db, "roomMessages");
  const q = query(
    messagesRef, 
    where("roomId", "==", roomId)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RoomMessage)).sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeA - timeB;
    });
    callback(messages);
  }, (error) => {
    console.error("Error listening to room messages:", error);
  });
};

export const getUserProfiles = async (userIds: string[]): Promise<UserProfile[]> => {
  if (userIds.length === 0) return [];
  
  const usersRef = collection(db, "users");
  // Firestore 'in' query limit is 10 (or 30 in some cases), but let's assume small rooms for now.
  // For larger rooms, we'd need to chunk this.
  const q = query(usersRef, where("uid", "in", userIds));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as UserProfile);
};

// --- FRIEND SYSTEM ---

export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  if (!searchTerm.trim()) return [];
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("username", ">=", searchTerm.toLowerCase()),
    where("username", "<=", searchTerm.toLowerCase() + "\uf8ff"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as UserProfile);
};

export const sendFriendRequest = async (fromUserId: string, toUserId: string, fromUsername: string) => {
  if (fromUserId === toUserId) return;
  
  // Check if request already exists
  const requestsRef = collection(db, "friendRequests");
  const q = query(
    requestsRef,
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", toUserId),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return;

  await addDoc(requestsRef, {
    fromUserId,
    toUserId,
    status: "pending",
    createdAt: serverTimestamp()
  });

  // Add notification
  const notificationsRef = collection(db, "notifications");
  await addDoc(notificationsRef, {
    type: "friend_request",
    fromUserId,
    toUserId,
    message: `@${fromUsername} sent you a friend request`,
    createdAt: serverTimestamp(),
    read: false
  });
  
  console.log("Friend request sent");
};

export const acceptFriendRequest = async (requestId: string, fromUserId: string, toUserId: string) => {
  const batch = writeBatch(db);
  
  // Update request status
  const requestRef = doc(db, "friendRequests", requestId);
  batch.update(requestRef, { status: "accepted" });
  
  // Add to friends collection (both ways)
  const friendsRef = collection(db, "friends");
  batch.set(doc(friendsRef), {
    userId: fromUserId,
    friendId: toUserId,
    createdAt: serverTimestamp()
  });
  batch.set(doc(friendsRef), {
    userId: toUserId,
    friendId: fromUserId,
    createdAt: serverTimestamp()
  });
  
  await batch.commit();
  console.log("Friend request accepted");
  console.log("Friend added");
};

export const rejectFriendRequest = async (requestId: string) => {
  const requestRef = doc(db, "friendRequests", requestId);
  await updateDoc(requestRef, { status: "rejected" });
};

export const getFriendshipStatus = async (userId: string, otherUserId: string): Promise<'none' | 'pending_sent' | 'pending_received' | 'friends'> => {
  if (userId === otherUserId) return 'none';

  // Check if friends
  const friendsRef = collection(db, "friends");
  const qFriends = query(friendsRef, where("userId", "==", userId), where("friendId", "==", otherUserId));
  const snapshotFriends = await getDocs(qFriends);
  if (!snapshotFriends.empty) return 'friends';

  // Check if request sent
  const requestsRef = collection(db, "friendRequests");
  const qSent = query(requestsRef, where("fromUserId", "==", userId), where("toUserId", "==", otherUserId), where("status", "==", "pending"));
  const snapshotSent = await getDocs(qSent);
  if (!snapshotSent.empty) return 'pending_sent';

  // Check if request received
  const qReceived = query(requestsRef, where("fromUserId", "==", otherUserId), where("toUserId", "==", userId), where("status", "==", "pending"));
  const snapshotReceived = await getDocs(qReceived);
  if (!snapshotReceived.empty) return 'pending_received';

  return 'none';
};

export const listenToNotifications = (userId: string, callback: (notifications: any[]) => void) => {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("toUserId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA; // Descending order
    }).slice(0, 50);
    callback(notifications);
  }, (error) => {
    console.error("Error listening to notifications:", error);
  });
};

export const getFriends = async (userId: string): Promise<UserProfile[]> => {
  const friendsRef = collection(db, "friends");
  const q = query(friendsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const friendIds = snapshot.docs.map(doc => doc.data().friendId);
  
  if (friendIds.length === 0) return [];
  
  // Fetch profiles
  return getUserProfiles(friendIds);
};

export const getPendingRequests = async (userId: string): Promise<any[]> => {
  const requestsRef = collection(db, "friendRequests");
  const q = query(requestsRef, where("toUserId", "==", userId), where("status", "==", "pending"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
