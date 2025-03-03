'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUsersByRole } from '@/lib/users';
import { getTransferRequests } from '@/lib/transferRequests';
import { AccountActivity, TransferRequest, User, BoxType } from '@/types';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingRequests: { '1': 0, '2': 0 },
    totalBalance: { '1': 0, '2': 0, total: 0 },
    recentActivities: [] as AccountActivity[],
  });
  const [members, setMembers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TransferRequest[]>([]);
  const [selectedBox, setSelectedBox] = useState<BoxType>('1');

  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'moderator') {
      router.push('/dashboard');
      return;
    }
  
    async function fetchAdminData() {
      try {
        setLoading(true);
        
        // Get members with null check
        const members = await getUsersByRole('member') || [];
        const moderators = await getUsersByRole('moderator') || [];
        
        // Fetch transfer requests for each box with pending status
        const box1Requests = await getTransferRequests('pending', '1') || [];
        const box2Requests = await getTransferRequests('pending', '2') || [];
        
        // Calculate balance data (assuming this would come from an API)
        // This is a placeholder - you should replace with actual implementation
        const balanceData = {
          '1': 0, // Initialize with default values
          '2': 0,
          total: 0
        };
        
        // You would typically fetch the actual balance data from your API
        // Example: const balanceData = await getTotalBalances();
        
        // Update stats with safe values
        setStats(prevStats => ({
          ...prevStats,
          totalMembers: (members?.length || 0) + (moderators?.length || 0),
          pendingRequests: { 
            '1': box1Requests.length, 
            '2': box2Requests.length 
          },
          totalBalance: {
            '1': balanceData['1'] || 0,
            '2': balanceData['2'] || 0,
            total: balanceData.total
          },
          recentActivities: [], // Initialize empty for now
        }));
        
        setMembers([...members]);
        setPendingRequests([...box1Requests, ...box2Requests]);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchAdminData();
  }, [userProfile, router]);

  const handleBoxChange = (boxId: BoxType) => {
    setSelectedBox(boxId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">لوحة المشرف</h1>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <Link 
            href="/admin/users" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            إدارة المستخدمين
          </Link>
          <Link 
            href="/admin/transfers" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            طلبات التحويل
          </Link>
        </div>
      </div>
      
      {/* Box Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">اختر الصندوق</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => handleBoxChange('1')}
            className={`px-4 py-2 rounded-lg ${
              selectedBox === '1' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            الصندوق الأول
          </button>
          <button
            onClick={() => handleBoxChange('2')}
            className={`px-4 py-2 rounded-lg ${
              selectedBox === '2' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            الصندوق الثاني
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-indigo-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الأعضاء</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">طلبات التحويل المعلقة</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pendingRequests[selectedBox]}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الرصيد</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalBalance[selectedBox]?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">النشاطات الأخيرة</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصندوق</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentActivities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {activity.createdAt.toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {members.find(m => m.id === activity.userId)?.name || activity.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {`صندوق ${activity.boxId}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      activity.type === 'deposit' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.type === 'deposit' ? 'إيداع' : 'سحب'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${activity.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {activity.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">طلبات التحويل المعلقة</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصندوق</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الملاحظات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingRequests
                .filter(request => request.boxId === selectedBox)
                .map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {request.createdAt.toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {members.find(m => m.id === request.userId)?.name || request.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {`صندوق ${request.boxId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${request.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {request.notes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/transfers/${request.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        مراجعة
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