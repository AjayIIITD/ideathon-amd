import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from '@/types';

export const createUserDocument = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newUser: UserProfile = {
      uid,
      name: data.name || 'User',
      currentStreak: 0,
      longestStreak: 0,
      healthScore: 0,
      createdAt: Date.now(),
      ...data,
    };
    await setDoc(userRef, newUser);
    return newUser;
  }
  return snap.data() as UserProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};
