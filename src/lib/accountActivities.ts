import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp, runTransaction, doc } from 'firebase/firestore';
import { db } from './firebase';
import { AccountActivity, TransferRequest, BoxType } from '../types';

// Create a new account activity record
export async function createAccountActivity(
  userId: string,
  boxId: BoxType,
  type: 'deposit' | 'withdrawal',
  amount: number,
  description: string,
  relatedRequestId?: string
): Promise<string> {
  try {
    // Get current user balance and update it in a transaction
    return await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const currentBalance = userData.balance[boxId] || 0;
      const newBalance = type === 'deposit' 
        ? currentBalance + amount 
        : currentBalance - amount;
      
      // Update user balance for specific box
      const balanceUpdate = {
        [`balance.${boxId}`]: newBalance,
        updatedAt: serverTimestamp()
      };
      
      transaction.update(userRef, balanceUpdate);
      
      // Create activity record
      const activityData = {
        userId,
        boxId,
        type,
        amount,
        balance: newBalance,
        description,
        relatedRequestId,
        createdAt: serverTimestamp()
      };
      
      const activityRef = await addDoc(collection(db, 'accountActivities'), activityData);
      return activityRef.id;
    });
  } catch (error) {
    console.error('Error creating account activity:', error);
    throw error;
  }
}

// Get account activities for a user
export async function getUserAccountActivities(userId: string, boxId?: BoxType): Promise<AccountActivity[]> {
  try {
    let q;
    
    if (boxId) {
      q = query(
        collection(db, 'accountActivities'),
        where('userId', '==', userId),
        where('boxId', '==', boxId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'accountActivities'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const activities: AccountActivity[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate()
      } as AccountActivity);
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting user account activities:', error);
    throw error;
  }
}

// Process an approved transfer request
export async function processApprovedTransferRequest(request: TransferRequest): Promise<void> {
  try {
    // Create a deposit activity for the user
    await createAccountActivity(
      request.userId,
      request.boxId,
      'deposit',
      request.amount,
      `Transfer request approved by admin`,
      request.id
    );
  } catch (error) {
    console.error('Error processing approved transfer request:', error);
    throw error;
  }
}

// Get recent account activities (for admin dashboard)
export async function getRecentAccountActivities(limit: number = 10, boxId?: BoxType): Promise<AccountActivity[]> {
  try {
    let q;
    
    if (boxId) {
      q = query(
        collection(db, 'accountActivities'),
        where('boxId', '==', boxId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'accountActivities'),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const activities: AccountActivity[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate()
      } as AccountActivity);
    });
    
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent account activities:', error);
    throw error;
  }
}

// Get total balance for all users or by box
export async function getTotalBalance(boxId?: BoxType): Promise<{[key in BoxType]?: number} & {total: number}> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const result: {[key in BoxType]?: number} & {total: number} = { total: 0 };
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.balance) {
        if (boxId) {
          const boxBalance = userData.balance[boxId] || 0;
          result[boxId] = (result[boxId] || 0) + boxBalance;
          result.total += boxBalance;
        } else {
          // Sum all boxes
          Object.entries(userData.balance).forEach(([box, amount]) => {
            const boxKey = box as BoxType;
            result[boxKey] = (result[boxKey] || 0) + (amount as number);
            result.total += (amount as number);
          });
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error getting total balance:', error);
    throw error;
  }
}