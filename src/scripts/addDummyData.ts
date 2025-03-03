import { db, auth } from '../lib/firebase';
import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Function to add dummy users
async function addDummyUsers() {
  try {
    // Create admin user
    const adminCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@familybox.com',
      'admin123'
    );
    
    const adminId = adminCredential.user.uid;
    
    await setDoc(doc(db, 'users', adminId), {
      email: 'admin@familybox.com',
      name: 'مدير النظام',
      role: 'admin',
      balance: 10000,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Admin user created with ID:', adminId);
    
    // Create regular users
    const users = [
      {
        email: 'ahmed@familybox.com',
        password: 'ahmed123',
        name: 'أحمد محمد',
        balance: 5000
      },
      {
        email: 'fatima@familybox.com',
        password: 'fatima123',
        name: 'فاطمة علي',
        balance: 3500
      },
      {
        email: 'omar@familybox.com',
        password: 'omar123',
        name: 'عمر خالد',
        balance: 2800
      }
    ];
    
    const userIds = [];
    
    for (const user of users) {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      
      const userId = userCredential.user.uid;
      userIds.push(userId);
      
      await setDoc(doc(db, 'users', userId), {
        email: user.email,
        name: user.name,
        role: 'member',
        balance: user.balance,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('User created with ID:', userId);
      
      // Add account activities for each user
      await addDummyActivities(userId, user.balance);
    }
    
    console.log('All dummy users added successfully');
    
    // Now add transfer requests with actual user IDs
    await addDummyTransferRequests(userIds, adminId);
    
  } catch (error) {
    console.error('Error adding dummy users:', error);
  }
}

// Function to add dummy activities for a user
async function addDummyActivities(userId: string, currentBalance: number) {
  try {
    const activities = [
      {
        type: 'deposit',
        amount: 1000,
        description: 'إيداع شهري',
        balance: currentBalance - 2500
      },
      {
        type: 'deposit',
        amount: 1500,
        description: 'تحويل من حساب آخر',
        balance: currentBalance - 1000
      },
      {
        type: 'withdrawal',
        amount: 500,
        description: 'سحب نقدي',
        balance: currentBalance - 500
      },
      {
        type: 'deposit',
        amount: 2000,
        description: 'إيداع راتب',
        balance: currentBalance
      }
    ];
    
    for (const activity of activities) {
      const activityRef = await addDoc(collection(db, 'accountActivities'), {
        userId,
        type: activity.type,
        amount: activity.amount,
        description: activity.description,
        balance: activity.balance,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
      
      console.log('Activity added with ID:', activityRef.id);
    }
    
    console.log('All activities added for user:', userId);
  } catch (error) {
    console.error('Error adding activities:', error);
  }
}

// Function to add dummy transfer requests
async function addDummyTransferRequests(userIds: string[], adminId: string) {
  try {
    const transferRequests = [
      {
        userId: userIds[0],
        amount: 1500,
        status: 'pending',
        notes: 'تحويل شهري',
        receiptUrl: 'https://example.com/receipt1.jpg'
      },
      {
        userId: userIds[1],
        amount: 2000,
        status: 'approved',
        notes: 'إيداع راتب',
        receiptUrl: 'https://example.com/receipt2.jpg',
        reviewedBy: adminId,
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: userIds[2],
        amount: 800,
        status: 'rejected',
        notes: 'تحويل طارئ',
        receiptUrl: 'https://example.com/receipt3.jpg',
        reviewedBy: adminId,
        reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
    
    for (const request of transferRequests) {
      const requestRef = await addDoc(collection(db, 'transferRequests'), {
        ...request,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
      });
      
      console.log('Transfer request added with ID:', requestRef.id);
    }
    
    console.log('All transfer requests added successfully');
  } catch (error) {
    console.error('Error adding transfer requests:', error);
  }
}

// Execute the functions
async function populateDummyData() {
  try {
    console.log('Starting to populate dummy data...');
    await addDummyUsers();
    console.log('All dummy data added successfully!');
  } catch (error) {
    console.error('Error populating dummy data:', error);
  } finally {
    setTimeout(() => process.exit(), 1000); // Give Firebase operations time to complete
  }
}

// Run the script
populateDummyData();