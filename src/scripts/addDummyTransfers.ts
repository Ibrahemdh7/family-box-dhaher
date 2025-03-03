import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BoxType } from '../types';

async function addDummyTransferRequests() {
  try {
    console.log('Starting to add dummy transfer requests...');

    const dummyRequests = [
      {
        userId: 'user1', // Replace with actual user IDs from your database
        boxId: '1' as BoxType,
        amount: 1500,
        status: 'pending',
        notes: 'تحويل شهري لصندوق 1',
        receiptUrl: 'https://example.com/dummy-receipt-1.jpg',
        createdAt: serverTimestamp()
      },
      {
        userId: 'user2',
        boxId: '2' as BoxType,
        amount: 2000,
        status: 'pending',
        notes: 'تحويل شهري لصندوق 2',
        receiptUrl: 'https://example.com/dummy-receipt-2.jpg',
        createdAt: serverTimestamp()
      },
      {
        userId: 'user3',
        boxId: '1' as BoxType,
        amount: 1000,
        status: 'approved',
        notes: 'تحويل تم قبوله',
        receiptUrl: 'https://example.com/dummy-receipt-3.jpg',
        createdAt: serverTimestamp(),
        reviewedBy: 'admin1',
        reviewedAt: serverTimestamp()
      },
      {
        userId: 'user4',
        boxId: '2' as BoxType,
        amount: 500,
        status: 'rejected',
        notes: 'تحويل تم رفضه',
        receiptUrl: 'https://example.com/dummy-receipt-4.jpg',
        createdAt: serverTimestamp(),
        reviewedBy: 'admin1',
        reviewedAt: serverTimestamp()
      }
    ];

    for (const request of dummyRequests) {
      const docRef = await addDoc(collection(db, 'transferRequests'), request);
      console.log('Added transfer request with ID:', docRef.id);
    }

    console.log('Successfully added all dummy transfer requests!');
  } catch (error) {
    console.error('Error adding dummy transfer requests:', error);
  } finally {
    setTimeout(() => process.exit(), 1000); // Give Firebase operations time to complete
  }
}

// Execute the function
addDummyTransferRequests();