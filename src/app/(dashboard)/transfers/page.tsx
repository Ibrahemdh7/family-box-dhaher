'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTransferRequest } from '@/lib/transferRequests';

// PrimeReact imports
import { Card } from 'primereact/card';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Message } from 'primereact/message';

export default function Transfers() {
  const { userProfile } = useAuth();
  const [amount, setAmount] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !userProfile?.id || !amount) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await createTransferRequest(
        userProfile.id,
        amount,
        file,
        notes
      );
      
      setSuccess('تم تقديم طلب التحويل بنجاح!');
      setAmount(null);
      setFile(null);
      setNotes('');
    } catch (err) {
      setError('فشل في تقديم طلب التحويل');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Fixed handler that safely handles undefined values
  const handleValueChange = (event: InputNumberValueChangeEvent) => {
    // Convert undefined to null before updating state
    setAmount(event.value === undefined ? null : event.value);
  };

  const handleFileSelect = (e: any) => {
    if (e.files && e.files.length > 0) {
      setFile(e.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <div dir="rtl" className="p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">طلب تحويل</h1>

      <Card className="max-w-2xl shadow-md">
        {error && (
          <Message severity="error" text={error} className="mb-4 w-full" />
        )}
        {success && (
          <Message severity="success" text={success} className="mb-4 w-full" />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المبلغ ($)
            </label>
            <InputNumber
              required
              value={amount}
              onValueChange={handleValueChange}
              mode="decimal"
              minFractionDigits={2}
              maxFractionDigits={2}
              min={0}
              placeholder="أدخل المبلغ"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              صورة الإيصال
            </label>
            <FileUpload
              mode="basic"
              name="receipt"
              accept="image/*"
              maxFileSize={1000000}
              chooseLabel="اختر الصورة"
              uploadLabel="رفع"
              cancelLabel="إلغاء"
              onSelect={handleFileSelect}
              onClear={clearFile}
              auto={false}
              customUpload
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات (اختياري)
            </label>
            <InputTextarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full"
              placeholder="أضف أي ملاحظات إضافية هنا"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            severity="success"
            icon="pi pi-check"
            label={loading ? 'جاري التقديم...' : 'تقديم طلب التحويل'}
          />
        </form>
      </Card>
    </div>
  );
}