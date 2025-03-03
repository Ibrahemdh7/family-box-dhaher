'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getUserAccountActivities } from '@/lib/accountActivities';
import { AccountActivity } from '@/types';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<AccountActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      if (userProfile?.id) {
        try {
          const data = await getUserAccountActivities(userProfile.id);
          setActivities(data);
        } catch (error) {
          console.error('Error fetching activities:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchActivities();
  }, [userProfile?.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Get only the most recent 5 activities
  const recentActivities = [...activities].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  ).slice(0, 5);

  // Calculate statistics
  const totalDeposits = activities
    .filter(a => a.type === 'deposit')
    .reduce((sum, a) => sum + a.amount, 0);
  
  const totalWithdrawals = activities
    .filter(a => a.type === 'withdrawal')
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 mt-2 sm:mt-0">
          آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-indigo-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الرصيد الحالي</p>
=              <p className="text-2xl font-bold text-gray-900">
                ${((userProfile?.balance?.['1'] || 0) + (userProfile?.balance?.['2'] || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الإيداعات</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalDeposits.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي السحوبات</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalWithdrawals.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">النشاطات الأخيرة</h2>
            <Link href="/activities" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              عرض الكل
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.type === 'deposit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {activity.type === 'deposit' ? 'إيداع' : 'سحب'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${
                        activity.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      } font-medium`}>
                        ${activity.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.createdAt.toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    لا توجد نشاطات حديثة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}