import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-white p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-indigo-800 mb-6">صندوق العائلة ظاهر</h1>
        <p className="text-xl text-gray-700 mb-10">
          منصة آمنة لإدارة الأموال العائلية وتتبع المعاملات المالية
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/signin" 
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
          >
            تسجيل الدخول
          </Link>
          <Link 
            href="/signup" 
            className="px-8 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-lg font-medium"
          >
            إنشاء حساب جديد
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-indigo-700 mb-3">إدارة الأموال</h3>
            <p className="text-gray-600">
              تتبع الإيداعات والسحوبات بسهولة مع تحديثات فورية للرصيد
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-indigo-700 mb-3">طلبات التحويل</h3>
            <p className="text-gray-600">
              إرسال طلبات التحويل بسهولة مع إمكانية إرفاق الإيصالات
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-indigo-700 mb-3">لوحة تحكم المشرف</h3>
            <p className="text-gray-600">
              إدارة الأعضاء والموافقة على طلبات التحويل ومراقبة النشاطات
            </p>
          </div>
        </div>
      </div>
      
      <footer className="mt-16 text-center text-gray-500">
        <p>© {new Date().getFullYear()} صندوق العائلة ظاهر. جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
