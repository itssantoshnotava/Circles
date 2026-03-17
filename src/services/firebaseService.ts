import { db } from "../firebase";
import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'circles_user_id';

export const getOrCreateUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const saveOnboardingData = async (userId: string, data: any) => {
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
