import { collection, updateDoc, doc, getDocs, query, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { User, UserRole, BoxType } from '../types';

// Create a new user (admin only)
export async function createUser(
  email: string,
  password: string,
  name: string,
  boxes: BoxType[],
  role: UserRole = 'member'
): Promise<string> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    await setDoc(doc(db, 'users', userId), {
      email,
      name,
      role,
      boxes,
      balance: {
        '1': 0,
        '2': 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return userId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user role (admin only)
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Update user boxes (admin only)
export async function updateUserBoxes(userId: string, boxes: BoxType[]): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      boxes,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user boxes:', error);
    throw error;
  }
}

// Get users by role
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        ...data
      } as User);
    });
    
    return users;
  } catch (error) {
    console.error(`Error getting users by role ${role}:`, error);
    return []; // Return empty array instead of null
  }
}