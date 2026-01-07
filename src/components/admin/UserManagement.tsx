import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  getAllUsers, 
  getUserDetails, 
  updateUser, 
  deleteUser,
  createUser,
  type User,
  type CreateUserData
} from '../../services/adminService';
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function UserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserData>({
    username: '',
    email: '',
    password: '',
    companyName: '',
    address: '',
    contactPerson: '',
    phone: '',
  });

  useEffect(() => {
    loadUsers();
  }, [kycFilter, riskFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers(1, 100, {
        kycStatus: kycFilter || undefined,
        riskLevel: riskFilter || undefined,
        search: searchTerm || undefined,
      });
      setUsers(response.users);
    } catch (err: any) {
      setError(err.message || t('errorLoadingUsers'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      companyName: user.companyName,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleViewDetails = async (user: User) => {
    try {
      const details = await getUserDetails(user.id);
      setUserDetails(details);
      setIsDetailsModalOpen(true);
    } catch (err: any) {
      setError(err.message || t('errorLoadingUserDetails'));
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    try {
      setError(null);
      setSuccessMessage(null);
      await updateUser(selectedUser.id, editForm);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setSuccessMessage(t('userUpdatedSuccessfully'));
      loadUsers();
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || t('errorUpdatingUser'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setError(null);
      setSuccessMessage(null);
      await deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      setSuccessMessage(t('userDeletedSuccessfully'));
      loadUsers();
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || t('errorDeletingUser'));
    }
  };

  const handleCreateUser = () => {
    setCreateForm({
      username: '',
      email: '',
      password: '',
      companyName: '',
      address: '',
      contactPerson: '',
      phone: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = async () => {
    if (!createForm.username || !createForm.email) {
      setError(t('requiredField'));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email)) {
      setError(t('invalidEmail'));
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      await createUser(createForm);
      setIsCreateModalOpen(false);
      setSuccessMessage(t('userCreatedSuccessfully'));
      loadUsers();
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || t('errorCreatingUser'));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getKycStatusBadge = (status?: string) => {
    const statusColors: Record<string, string> = {
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      in_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      needs_update: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    
    const colorClass = statusColors[status || 'pending'] || statusColors.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status || 'pending'}
      </span>
    );
  };

  const getRiskLevelBadge = (level?: string) => {
    const levelColors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    
    const colorClass = levelColors[level || 'low'] || levelColors.low;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {level || 'low'}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('userManagement')}
          </h2>
          <button
            onClick={handleCreateUser}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('createUser')}
          </button>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchUsers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">{t('allKycStatuses')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="in_review">{t('inReview')}</option>
            <option value="approved">{t('approved')}</option>
            <option value="rejected">{t('rejected')}</option>
            <option value="needs_update">{t('needsUpdate')}</option>
          </select>
          
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">{t('allRiskLevels')}</option>
            <option value="low">{t('low')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="high">{t('high')}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('username')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('kycStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('riskLevel')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('createdAt')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t('noUsersFound')}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getKycStatusBadge(user.kycStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getRiskLevelBadge(user.riskLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title={t('viewDetails')}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('editUser')}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('deleteUser')}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <Transition show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {t('editUser')}
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('email')}
                      </label>
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('companyName')}
                      </label>
                      <input
                        type="text"
                        value={editForm.companyName || ''}
                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                    >
                      {t('save')}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsDeleteModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {t('confirmDelete')}
                  </Dialog.Title>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {t('deleteUserConfirmation', { username: selectedUser?.username })}
                  </p>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* User Details Modal */}
      <Transition show={isDetailsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsDetailsModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {t('userDetails')}
                  </Dialog.Title>
                  
                  {userDetails && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('username')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{userDetails.username}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('email')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{userDetails.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('kycStatus')}</p>
                          {getKycStatusBadge(userDetails.kycStatus)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('riskLevel')}</p>
                          {getRiskLevelBadge(userDetails.riskLevel)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('createdAt')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{formatDate(userDetails.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('updatedAt')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{formatDate(userDetails.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                    >
                      {t('close')}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Create User Modal */}
      <Transition show={isCreateModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsCreateModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {t('createNewUser')}
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('username')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createForm.username}
                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('password')} ({t('passwordOptional')})
                      </label>
                      <input
                        type="password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('passwordOptionalHint')}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('companyName')}
                      </label>
                      <input
                        type="text"
                        value={createForm.companyName}
                        onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('address')}
                      </label>
                      <textarea
                        value={createForm.address}
                        onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                        rows={2}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('contactPerson')}
                      </label>
                      <input
                        type="text"
                        value={createForm.contactPerson}
                        onChange={(e) => setCreateForm({ ...createForm, contactPerson: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('phone')}
                      </label>
                      <input
                        type="text"
                        value={createForm.phone}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCreate}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                    >
                      {t('createUser')}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

