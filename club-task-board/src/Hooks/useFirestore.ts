import { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  updateDoc, 
  doc,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';

type UseFirestoreReturn<T> = [
  T[],
  (newItem: Omit<T, 'id'> & { id?: string }) => Promise<void>,
  (id: string, updates: Partial<T>) => Promise<void>
];

export default function useFirestore<T extends { id?: string }>(
  collectionName: string
): UseFirestoreReturn<T> {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    // Safety check: if db didn't initialize, don't try to query
    if (!db) {
      console.error("Firebase Firestore (db) is not initialized.");
      return;
    }

    // 1. Reference the collection in Firestore
    const q = query(collection(db, collectionName));

    // 2. Set up a real-time listener
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      setData(results);
    }, (error) => {
      console.error("Firestore listener error:", error);
    });

    // 3. Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [collectionName]);

  // Function to add a new document
  const addData = async (newItem: Omit<T, 'id'> & { id?: string }) => {
    try {
      await addDoc(collection(db, collectionName), newItem);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Function to update an existing document
  const updateData = async (id: string, updates: Partial<T>) => {
    try {
      const itemRef = doc(db, collectionName, id);
      await updateDoc(itemRef, updates as any);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return [data, addData, updateData];
}
