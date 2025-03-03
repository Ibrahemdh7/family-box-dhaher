'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getTransferRequests } from '@/lib/transferRequests';
import { getUsersByRole } from '@/lib/users';
import { TransferRequest, User, BoxType } from '@/types';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminTransfers() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedBox, setSelectedBox] = useState<BoxType>('1');
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'moderator') {
      router.push('/dashboard');
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const [requestsData, usersData] = await Promise.all([
          getTransferRequests(selectedStatus, selectedBox),
          getUsersByRole('member')
        ]);
        setRequests(requestsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userProfile, router, selectedBox, selectedStatus]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">إدارة طلبات التحويل</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex space-x-4 mb-6">
          <select
            value={selectedBox}
            onChange={(e) => setSelectedBox(e.target.value as BoxType)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="1">الصندوق الأول</option>
            <option value="2">الصندوق الثاني</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'pending' | 'approved' | 'rejected')}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="pending">معلق</option>
            <option value="approved">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الملاحظات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.createdAt.toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {users.find(u => u.id === request.userId)?.name || request.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${request.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.notes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'pending' ? 'معلق' : request.status === 'approved' ? 'مقبول' : 'مرفوض'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/transfers/${request.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {request.status === 'pending' ? 'مراجعة' : 'عرض التفاصيل'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}