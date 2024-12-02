import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Auth functions
export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

// Ticket functions
export const createTicket = async (ticketData: {
  userId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  customerEmail?: string;
  customerName?: string;
  isAnonymous?: boolean;
}) => {
  return addDoc(collection(db, 'tickets'), {
    ...ticketData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const getUserTickets = async (userId: string) => {
  const q = query(collection(db, 'tickets'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllTickets = async () => {
  const querySnapshot = await getDocs(collection(db, 'tickets'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTicketStatus = async (ticketId: string, status: string) => {
  const ticketRef = doc(db, 'tickets', ticketId);
  return updateDoc(ticketRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
};

export const addTicketResponse = async (ticketId: string, responseData: { content: string; adminId: string; createdAt: string }) => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (!ticketDoc.exists()) {
      throw new Error('Ticket not found');
    }
    
    const responses = ticketDoc.data().responses || [];
    await updateDoc(ticketRef, {
      responses: [...responses, { id: Date.now().toString(), ...responseData }],
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('Error adding ticket response:', error);
    throw error;
  }
};

export const getTicketById = async (ticketId: string, email: string) => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (!ticketDoc.exists()) {
      throw new Error('Ticket not found');
    }

    const ticketData = ticketDoc.data();
    // Verify the email matches
    if (ticketData.customerEmail !== email && ticketData.userId !== email) {
      throw new Error('Unauthorized access');
    }

    return { id: ticketDoc.id, ...ticketData };
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
};

export async function deleteTicket(ticketId: string): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await deleteDoc(ticketRef);
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
}