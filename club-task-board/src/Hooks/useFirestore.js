import { useState, useEffect } from 'react';
import { db } from '../firebase'; // This assumes your firebase.js is in /src
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  updateDoc, 
  doc 
} from 'firebase/firestore';

export default function useFirestore(collectionName) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // 1. Reference the collection in Firestore
    const q = query(collection(db, collectionName));

    // 2. Set up a real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(results);
    });

    // 3. Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [collectionName]);

  // Function to add a new document
  const addData = async (newItem) => {
    try {
      await addDoc(collection(db, collectionName), newItem);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Function to update an existing document
  const updateData = async (id, updates) => {
    try {
      const itemRef = doc(db, collectionName, id);
      await updateDoc(itemRef, updates);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return [data, addData, updateData];
}