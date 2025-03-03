'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUsersByRole, updateUserRole, updateUserBoxes, createUser } from '@/lib/users';
import { User, BoxType, UserRole } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function AdminUsers() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'member' as UserRole,
    boxes: [] as BoxType[]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [userProfile, router]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const [members, moderators] = await Promise.all([
        getUsersByRole('member'),
        getUsersByRole('moderator')
      ]);
      setUsers([...members, ...moderators]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };
  const handleBoxesChange = async (userId: string, boxId: BoxType) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;
  
      const currentBoxes = user.boxes || [];
      const newBoxes = currentBoxes.includes(boxId)
        ? currentBoxes.filter(b => b !== boxId)
        : [...currentBoxes, boxId];
  
      await updateUserBoxes(userId, newBoxes);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, boxes: newBoxes } : user
      ));
    } catch (error) {
      console.error('Error updating user boxes:', error);
    }
  };
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await createUser(
        newUser.email,
        newUser.password,
        newUser.name,
        newUser.boxes,
        newUser.role
      );
      setIsAddUserOpen(false);
      fetchUsers();
      setNewUser({
        email: '',
        password: '',
        name: '',
        role: 'member',
        boxes: []
      });
    } catch (error) {
      setError('Failed to create user');
      console.error('Error creating user:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">إدارة المستخدمين</h1>
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          إضافة مستخدم جديد
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الاسم</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الدور</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الصناديق</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الرصيد</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700"
                    >
                      <option value="member">عضو</option>
                      <option value="moderator">مشرف</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {(['1', '2'] as BoxType[]).map((boxId) => (
                        <button
                          key={boxId}
                          onClick={() => handleBoxesChange(user.id, boxId)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            (user.boxes || []).includes(boxId)
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          صندوق {boxId}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${((user.balance?.['1'] || 0) + (user.balance?.['2'] || 0)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.createdAt instanceof Date 
                      ? user.createdAt.toLocaleDateString('ar-SA')
                      : user.createdAt?.toDate?.()?.toLocaleDateString('ar-SA') || 'غير متوفر'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    {/* Modal styles update */}
    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-right align-middle shadow-xl transition-all">
      <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 mb-6">
        إضافة مستخدم جديد
      </Dialog.Title>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAddUser} className="space-y-5">
        {/* Form fields with updated styles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم
          </label>
          <input
            type="text"
            required
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Similar updates for other form fields */}
        
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsAddUserOpen(false)}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إضافة
          </button>
        </div>
      </form>
    </Dialog.Panel>
    {/* Add User Modal */}
      <Transition appear show={isAddUserOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsAddUserOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-right align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    إضافة مستخدم جديد
                  </Dialog.Title>

                  {error && (
                    <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleAddUser} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        الاسم
                      </label>
                      <input
                        type="text"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        كلمة المرور
                      </label>
                      <input
                        type="password"
                        required
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        الدور
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="member">عضو</option>
                        <option value="moderator">مشرف</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        الصناديق
                      </label>
                      <div className="mt-2 flex gap-2">
                        {(['1', '2'] as BoxType[]).map((boxId) => (
                          <button
                            key={boxId}
                            type="button"
                            onClick={() => {
                              const newBoxes = newUser.boxes.includes(boxId)
                                ? newUser.boxes.filter(b => b !== boxId)
                                : [...newUser.boxes, boxId];
                              setNewUser({ ...newUser, boxes: newBoxes });
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              newUser.boxes.includes(boxId)
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            صندوق {boxId}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAddUserOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                      >
                        إضافة
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}