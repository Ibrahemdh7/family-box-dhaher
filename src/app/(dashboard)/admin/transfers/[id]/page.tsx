'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getTransferRequest, reviewTransferRequest } from '@/lib/transferRequests';
import { getUsersByRole } from '@/lib/users';
import { processApprovedTransferRequest } from '@/lib/accountActivities';
import { TransferRequest, User } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TransferRequestDetails({
  params
}: {
  params: { id: string }
}) {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<TransferRequest | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'moderator') {
      router.push('/dashboard');
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const requestData = await getTransferRequest(params.id);
        
        if (!requestData) {
          setError('Transfer request not found');
          setLoading(false);
          return;
        }
        
        setRequest(requestData);
        
        // Get user information
        const members = await getUsersByRole('member');
        const user = members.find(m => m.id === requestData.userId);
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching transfer request:', error);
        setError('Failed to load transfer request data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userProfile, router, params.id]);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!userProfile || !request) return;
    
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      // First, update the request status
      await reviewTransferRequest(
        request.id,
        status,
        userProfile.id,
        reviewNotes
      );
      
      // If approved, process the transfer
      if (status === 'approved') {
        await processApprovedTransferRequest({
          ...request,
          status: 'approved',
          reviewedBy: userProfile.id,
          reviewedAt: new Date()
        });
      }
      
      setSuccess(`Transfer request has been ${status === 'approved' ? 'approved' : 'rejected'}`);
      
      // Refresh the request data
      const updatedRequest = await getTransferRequest(params.id);
      if (updatedRequest) {
        setRequest(updatedRequest);
      }
    } catch (error) {
      console.error('Error processing transfer request:', error);
      setError(`Failed to ${status} transfer request`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !request) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">تفاصيل طلب التحويل</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          العودة للقائمة
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">معلومات الطلب</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">المستخدم</span>
                <span className="block mt-1 text-lg">{user?.name || request?.userId}</span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">المبلغ</span>
                <span className="block mt-1 text-lg font-semibold text-green-600">
                  ${request?.amount.toFixed(2)}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">تاريخ الطلب</span>
                <span className="block mt-1 text-lg">
                  {request?.createdAt.toLocaleDateString('ar-SA')}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">الحالة</span>
                <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                  request?.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : request?.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request?.status === 'pending' ? 'معلق' : 
                   request?.status === 'approved' ? 'مقبول' : 'مرفوض'}
                </span>
              </div>
              
              {request?.reviewedAt && (
                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-500">تاريخ المراجعة</span>
                  <span className="block mt-1 text-lg">
                    {request.reviewedAt.toLocaleDateString('ar-SA')}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">الصندوق</span>
                <span className="block mt-1 text-lg">صندوق {request?.boxId}</span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">ملاحظات المستخدم</span>
                <span className="block mt-1 text-lg">
                  {request?.notes || 'لا توجد ملاحظات'}
                </span>
              </div>
              
              {request?.reviewedBy && (
                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-500">تمت المراجعة بواسطة</span>
                  <span className="block mt-1 text-lg">{request.reviewedBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Image */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">صورة الإيصال</h2>
        </div>
        
        <div className="p-6 flex justify-center">
          {request?.receiptUrl ? (
            <a 
              href={request.receiptUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                src={request.receiptUrl} 
                alt="Receipt" 
                className="max-w-full max-h-96 object-contain border border-gray-200 rounded"
              />
            </a>
          ) : (
            <div className="text-gray-500">لا توجد صورة إيصال</div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      {request?.status === 'pending' && userProfile && (userProfile.role === 'admin' || userProfile.role === 'moderator') && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">مراجعة الطلب</h2>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات المراجعة (اختياري)
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="أضف ملاحظاتك هنا..."
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleReview('approved')}
                disabled={processing}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
              >
                {processing ? 'جاري المعالجة...' : 'قبول الطلب'}
              </button>
              
              <button
                onClick={() => handleReview('rejected')}
                disabled={processing}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400"
              >
                {processing ? 'جاري المعالجة...' : 'رفض الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}