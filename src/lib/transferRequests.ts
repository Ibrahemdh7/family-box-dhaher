import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { TransferRequest, BoxType } from '../types';

// Create a new transfer request
export async function createTransferRequest(userId: string, amount: number, receiptFile: File, notes?: string): Promise<string> {
  try {
    // Upload receipt image to Firebase Storage
    const storageRef = ref(storage, `receipts/${userId}/${Date.now()}_${receiptFile.name}`);
    await uploadBytes(storageRef, receiptFile);
    const receiptUrl = await getDownloadURL(storageRef);
    
    // Create transfer request in Firestore
    const requestData = {
      userId,
      amount,
      receiptUrl,
      notes: notes || '',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'transferRequests'), requestData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating transfer request:', error);
    throw error;
  }
}

// Get a transfer request by ID
export async function getTransferRequest(requestId: string): Promise<TransferRequest | null> {
  try {
    const docRef = doc(db, 'transferRequests', requestId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
          id: docSnap.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate(),
          reviewedAt: data.reviewedAt ? (data.reviewedAt as Timestamp).toDate() : undefined
      } as unknown as TransferRequest;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting transfer request:', error);
    throw error;
  }
}

// Get all transfer requests for a user
export async function getUserTransferRequests(userId: string): Promise<TransferRequest[]> {
  try {
    const q = query(
      collection(db, 'transferRequests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests: TransferRequest[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate(),
          reviewedAt: data.reviewedAt ? (data.reviewedAt as Timestamp).toDate() : undefined
      } as unknown as TransferRequest);
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting user transfer requests:', error);
    throw error;
  }
}

// Get all pending transfer requests (for admin)
export async function getPendingTransferRequests(): Promise<TransferRequest[]> {
  try {
    const q = query(
      collection(db, 'transferRequests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests: TransferRequest[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate(),
          reviewedAt: data.reviewedAt ? (data.reviewedAt as Timestamp).toDate() : undefined
      } as unknown as TransferRequest);
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting pending transfer requests:', error);
    throw error;
  }
}

// Approve or reject a transfer request (admin only)
export async function reviewTransferRequest(
  requestId: string,
  status: 'approved' | 'rejected',
  adminId: string,
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'transferRequests', requestId);
    
    await updateDoc(docRef, {
      status,
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
      notes: notes || '',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error reviewing transfer request:', error);
    throw error;
  }
}

// Combine both getTransferRequest functions into one
export async function getTransferRequests(
  status: 'pending' | 'approved' | 'rejected',
  boxId: BoxType
): Promise<TransferRequest[]> {
  try {
    const q = query(
      collection(db, 'transferRequests'),
      where('status', '==', status),
      where('boxId', '==', boxId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      reviewedAt: doc.data().reviewedAt ? doc.data().reviewedAt.toDate() : undefined
    })) as unknown as TransferRequest[];
  } catch (error) {
    console.error('Error getting transfer requests:', error);
    throw error;
  }
}

// Remove the duplicate getTransferRequest function