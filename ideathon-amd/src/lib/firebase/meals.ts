import { collection, addDoc, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import { Meal } from '@/types';

export const uploadMealImage = async (userId: string, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `meals/${userId}/${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, fileName);
  
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const createMeal = async (mealData: Meal) => {
  const mealsRef = collection(db, 'meals');
  const docRef = await addDoc(mealsRef, mealData);
  return docRef.id;
};

export const getRecentMeals = async (maxResults = 20): Promise<Meal[]> => {
  const mealsRef = collection(db, 'meals');
  const q = query(mealsRef, orderBy('createdAt', 'desc'), limit(maxResults));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Meal[];
};
