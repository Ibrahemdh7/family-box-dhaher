'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getUserAccountActivities } from '@/lib/accountActivities';
import { AccountActivity } from '@/types';
import Link from 'next/link';

// PrimeReact imports
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Chart } from 'primereact/chart';
import { ChartData, ChartOptions } from 'chart.js';

// Define the chart context type
interface ChartTooltipContext {
  dataset: {
    label: string;
  };
  raw: number;
}

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<AccountActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });
  const [chartOptions, setChartOptions] = useState<ChartOptions>({});
  
  useEffect(() => {
    async function fetchActivities() {
      if (userProfile?.id) {
        try {
          const data = await getUserAccountActivities(userProfile.id);
          setActivities(data);
          
          // Prepare data for chart
          prepareChartData(data);
        } catch (error) {
          console.error('Error fetching activities:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchActivities();
  }, [userProfile?.id]);
  
  const prepareChartData = (activityData: AccountActivity[]) => {
    // Group by month for last 6 months
    const months: string[] = [];
    const deposits: number[] = [];
    const withdrawals: number[] = [];
    
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const monthName = date.toLocaleDateString('ar-SA', { month: 'short' });
      months.push(monthName);
      
      // Calculate total for this month
      const monthActivities = activityData.filter(a => {
        const activityDate = new Date(a.createdAt);
        return activityDate.getMonth() === date.getMonth() && 
               activityDate.getFullYear() === date.getFullYear();
      });
      
      const monthDeposits = monthActivities
        .filter(a => a.type === 'deposit')
        .reduce((sum, a) => sum + a.amount, 0);
        
      const monthWithdrawals = monthActivities
        .filter(a => a.type === 'withdrawal')
        .reduce((sum, a) => sum + a.amount, 0);
        
      deposits.push(monthDeposits);
      withdrawals.push(monthWithdrawals);
    }
    
    const data = {
      labels: months,
      datasets: [
        {
          label: 'الإيداعات',
          data: deposits,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 2
        },
        {
          label: 'السحوبات',
          data: withdrawals.map(v => -v), // Negative for visual effect
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2
        }
      ]
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context: ChartTooltipContext) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.raw < 0) {
                label += `$${Math.abs(context.raw).toFixed(2)}`;
              } else {
                label += `$${context.raw.toFixed(2)}`;
              }
              return label;
            }
          }
        }
      }
    };
    
    setChartData(data as ChartData);
    setChartOptions(options as ChartOptions);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" animationDuration=".5s" />
      </div>
    );
  }

  // Get only the most recent 5 activities
  const recentActivities = [...activities]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  // Calculate statistics
  const totalDeposits = activities
    .filter(a => a.type === 'deposit')
    .reduce((sum, a) => sum + a.amount, 0);
  
  const totalWithdrawals = activities
    .filter(a => a.type === 'withdrawal')
    .reduce((sum, a) => sum + a.amount, 0);
  
  const balance = (userProfile?.balance?.['1'] || 0) + (userProfile?.balance?.['2'] || 0);

  // Template for activity type
  const typeTemplate = (rowData: AccountActivity) => {
    return (
      <Badge 
        value={rowData.type === 'deposit' ? 'إيداع' : 'سحب'} 
        severity={rowData.type === 'deposit' ? 'success' : 'danger'} 
        className="text-xs"
      />
    );
  };

  // Template for amount
  const amountTemplate = (rowData: AccountActivity) => {
    return (
      <span className={`${rowData.type === 'deposit' ? 'text-green-600' : 'text-red-600'} font-medium`}>
        {rowData.amount.toFixed(2)} $
      </span>
    );
  };

  // Template for date
  const dateTemplate = (rowData: AccountActivity) => {
    return rowData.createdAt.toLocaleDateString('ar-SA');
  };

  // Header for activities card
  const activitiesHeader = (
    <div className="flex justify-between items-center py-3">
      <div className="flex items-center">
        <i className="pi pi-history text-lg text-blue-500 mr-2"></i>
        <h2 className="text-xl font-semibold text-gray-800">النشاطات الأخيرة</h2>
      </div>
      <Button 
        label="عرض الكل"
        text
        icon="pi pi-external-link"
        className="text-indigo-600 p-0"
        onClick={() => window.location.href = '/activities'}
      />
    </div>
  );

  return (
    <div className="p-5" dir="rtl">
      {/* Header with welcome message */}
      <div className="bg-gradient-to-l from-indigo-700 to-blue-500 text-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">مرحباً {userProfile?.name || 'بك'}</h1>
            <p className="mt-2 text-indigo-100">
              نظرة عامة على حسابك وأحدث المعاملات
            </p>
          </div>
          <div className="mt-4 sm:mt-0 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-sm font-medium">آخر تحديث</p>
            <p className="text-lg font-bold">{new Date().toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md border-r-4 border-indigo-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="ml-4 p-4 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <i className="pi pi-wallet text-2xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">الرصيد الحالي</p>
              <p className="text-2xl font-bold text-gray-900">{balance.toFixed(2)} $</p>
              <p className="text-xs text-gray-500 mt-1">حتى تاريخ اليوم</p>
            </div>
          </div>
        </Card>
        
        <Card className="shadow-md border-r-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="ml-4 p-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white">
              <i className="pi pi-arrow-up text-2xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الإيداعات</p>
              <p className="text-2xl font-bold text-green-600">{totalDeposits.toFixed(2)} $</p>
              <p className="text-xs text-gray-500 mt-1">منذ إنشاء الحساب</p>
            </div>
          </div>
        </Card>
        
        <Card className="shadow-md border-r-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="ml-4 p-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white">
              <i className="pi pi-arrow-down text-2xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي السحوبات</p>
              <p className="text-2xl font-bold text-red-600">{totalWithdrawals.toFixed(2)} $</p>
              <p className="text-xs text-gray-500 mt-1">منذ إنشاء الحساب</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Chart */}
      <Card className="shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <i className="pi pi-chart-bar text-blue-500 mr-2"></i>
            <h2 className="text-xl font-semibold text-gray-800">تحليل الإيداعات والسحوبات</h2>
          </div>
        </div>
        <Divider className="my-3" />
        <div className="h-80">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
      </Card>

      {/* Recent Activities */}
      <Card header={activitiesHeader} className="shadow-md">
        <Divider className="mb-3" />
        <DataTable 
          value={recentActivities} 
          emptyMessage="لا توجد نشاطات حديثة"
          className="p-datatable-sm" 
          stripedRows 
          rowHover
          responsiveLayout="scroll"
        >
          <Column field="type" header="النوع" body={typeTemplate} className="text-right" />
          <Column field="amount" header="المبلغ" body={amountTemplate} className="text-right" />
          <Column field="description" header="الوصف" className="text-right" />
          <Column field="createdAt" header="التاريخ" body={dateTemplate} className="text-right" />
          <Column body={() => (
            <Button icon="pi pi-eye" className="p-button-text p-button-rounded" />
          )} />
        </DataTable>
      </Card>
    </div>
  );
}