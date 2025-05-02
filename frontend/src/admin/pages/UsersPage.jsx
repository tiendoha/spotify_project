import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, addUser, updateUser, deleteUser } from "../redux/users/userSlice";
import { fetchProfiles, updateProfile } from "../redux/profiles/profileSlice";
import { formatDate } from "../utils/formatDate";
import { Dialog, Transition } from '@headlessui/react';
import Pagination from '../components/Pagination';
import PageLayout from '../components/PageLayout';
import { getImageUrl } from "../utils/imageUtils";

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, status, error } = useSelector((state) => state.users);
  const { profiles } = useSelector((state) => state.profiles);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Change to 1-based
  const usersPerPage = 10;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    date_joined: '',
    date_of_birth: '',
    profile_image: null,
    role: 1 // Default to regular user
  });
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    userId: null
  });
  const [createModalState, setCreateModalState] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    date_joined: new Date().toISOString().split('T')[0], 
    date_of_birth: '',
    profile_image: null,
    role: 1 // Default to regular user
  });

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProfiles());
  }, [dispatch]);

  if (status === "loading")
    return <p className="text-center text-gray-500 py-10">Đang tải...</p>;
  if (status === "failed")
    return <p className="text-center text-red-500 py-10">Lỗi: {error}</p>;

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * usersPerPage;
    const indexOfFirstItem = indexOfLastItem - usersPerPage;
    // Sắp xếp users theo ID trước khi phân trang
    const sortedUsers = [...users].sort((a, b) => a.id - b.id);
    return sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenProfile = (userId) => {
    const profile = profiles.find(p => p.user.id === userId);
    if (profile) {
      console.log('Opening profile:', profile); // Debug log
      setSelectedProfile(profile);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      username: selectedProfile?.user?.username || '',
      email: selectedProfile?.user?.email || '',
      date_joined: selectedProfile?.user?.date_joined || '',
      date_of_birth: selectedProfile?.date_of_birth || '',
      profile_image: selectedProfile?.profile_image || null,
      role: selectedProfile?.user?.role || 1
    });
  };

  const handleSave = async () => {
    try {
      // Cập nhật thông tin người dùng với tất cả các trường
      const userData = {
        username: editForm.username,
        email: editForm.email,
        password: selectedProfile.user.password, // Giữ lại mật khẩu cũ
        date_joined: selectedProfile.user.date_joined, // Giữ lại ngày tham gia cũ
        role: editForm.role
      };

      // Cập nhật thông tin profile
      const profileData = {
        date_of_birth: editForm.date_of_birth,
        user: selectedProfile.user.id,
        // Xử lý ảnh đại diện
        profile_image: editForm.profile_image instanceof File 
          ? `/profiles/${editForm.profile_image.name}`
          : selectedProfile.profile_image
      };

      // Gọi API cập nhật user
      await dispatch(updateUser({ 
        id: selectedProfile.user.id, 
        userData 
      })).unwrap();

      // Cập nhật profile
      await dispatch(updateProfile({ 
        id: selectedProfile.id, 
        profileData 
      })).unwrap();

      // Tải lại dữ liệu
      await Promise.all([
        dispatch(fetchUsers()),
        dispatch(fetchProfiles())
      ]);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
    }
  };

  const handleDelete = (id) => {
    setDeleteModalState({ isOpen: true, userId: id });
  };

  const confirmDelete = () => {
    if (deleteModalState.userId) {
      // Implement your delete logic here
      dispatch(deleteUser(deleteModalState.userId));
      setDeleteModalState({ isOpen: false, userId: null });
      setSelectedProfile(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const userData = new FormData();
      userData.append('username', createForm.username);
      userData.append('email', createForm.email);
      userData.append('password', createForm.password);
      userData.append('date_joined', createForm.date_joined);
      userData.append('date_of_birth', createForm.date_of_birth);
      userData.append('role', createForm.role);
      
      // Add /profiles/ prefix to image path
      if (createForm.profile_image) {
        userData.append('profile_image', `/profiles/${createForm.profile_image.name}`);
      }
  
      await dispatch(addUser(userData));
      setCreateModalState(false);
      // Reset form
      setCreateForm({
        username: '',
        email: '',
        password: '',
        date_joined: new Date().toISOString().split('T')[0],
        date_of_birth: '',
        profile_image: null,
        role: 1
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const openCreateModal = () => {
    setCreateModalState(true);
  };

  const closeCreateModal = () => {
    setCreateModalState(false);
    setCreateForm({ username: '', email: '', password: '', date_joined: new Date().toISOString().split('T')[0], date_of_birth: '', profile_image: null, role: 1 });
  };

  return (
    <PageLayout>
      {/* Main content with padding */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Danh sách người dùng</h2>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md"
          >
            Thêm người dùng
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-700">ID</th>
                <th className="p-4 text-sm font-medium text-gray-700">
                  Tên người dùng
                </th>
                <th className="p-4 text-sm font-medium text-gray-700">Email</th>
                <th className="p-4 text-sm font-medium text-gray-700">Vai trò</th>
                <th className="p-4 text-sm font-medium text-gray-700">
                  Ngày tham gia
                </th>
                <th className="p-4 text-sm font-medium text-gray-700 text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="p-4 text-sm text-gray-800">{user.id}</td>
                  <td className="p-4 text-sm text-gray-800">
                    {user.username || "-"}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {user.email || "-"}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {user.role === 1 ? "Người dùng" : "Quản trị viên"}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {user.date_joined ? formatDate(user.date_joined) : "-"}
                  </td>
                  <td className="p-4 text-center">
                    {user.username && (
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        onClick={() => handleOpenProfile(user.id)}
                      >
                        Xem chi tiết
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Profile */}
        <Transition appear show={!!selectedProfile} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={() => {
              setSelectedProfile(null);
              setIsEditing(false);
            }}
          >
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="flex min-h-full items-center justify-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title className="text-lg font-bold flex justify-between items-center mb-4">
                      Thông tin người dùng
                      <button 
                        onClick={() => {
                          setSelectedProfile(null);
                          setIsEditing(false);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </Dialog.Title>

                    <div className="space-y-4">
                      {/* User Image */}
                      <div className="flex justify-center">
                        {(() => {
                          // Access the correct path from the profile object
                          const imageUrl = getImageUrl(selectedProfile?.profile_image);
                          // console.log('Profile Image Debug:', {
                          //   profile: selectedProfile,
                          //   originalPath: selectedProfile?.profile_image,
                          //   processedUrl: imageUrl,
                          //   editingMode: isEditing,
                          //   editFormImage: editForm?.profile_image
                          // });
                          
                          // Use the correct form field for editing mode
                          const displayImage = isEditing 
                            ? (editForm.profile_image instanceof File 
                                ? URL.createObjectURL(editForm.profile_image) 
                                : getImageUrl(editForm.profile_image))
                            : (imageUrl || '/default-avatar.png');

                          return (
                            <img 
                              src={displayImage}
                              alt="User avatar"
                              className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.target.src = '/default-avatar.png';
                                e.target.onerror = null;
                              }}
                            />
                          );
                        })()}
                      </div>

                      {isEditing ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleSave();
                        }} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
                            <input
                              type="text"
                              value={editForm.username}
                              onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                            <input
                              type="date"
                              value={editForm.date_of_birth}
                              onChange={(e) => setEditForm({...editForm, date_of_birth: e.target.value})}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
                            <input
                              type="file"
                              onChange={(e) => setEditForm({...editForm, profile_image: e.target.files[0]})}
                              className="mt-1 w-full"
                              accept="image/*"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                            <select
                              value={editForm.role}
                              onChange={(e) => setEditForm({...editForm, role: Number(e.target.value)})}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value={1}>Người dùng</option>
                              <option value={2}>Quản trị viên</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                              Lưu
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Tên người dùng</h3>
                            <p className="mt-1 text-sm text-gray-900">{selectedProfile?.user?.username}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                            <p className="mt-1 text-sm text-gray-900">{selectedProfile?.user?.email}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Ngày tham gia</h3>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedProfile?.user?.date_joined ? formatDate(selectedProfile.user.date_joined) : '-'}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Ngày sinh</h3>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedProfile?.date_of_birth ? formatDate(selectedProfile.date_of_birth) : '-'}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Vai trò</h3>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedProfile?.user?.role === 1 ? "Người dùng" : "Quản trị viên"}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Move buttons to bottom */}
                      {!isEditing && (
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                          <button 
                            onClick={handleEdit}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDelete(selectedProfile?.user?.id)}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Delete Confirmation Modal */}
        <Transition appear show={deleteModalState.isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={() => setDeleteModalState({ isOpen: false, userId: null })}
          >
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="flex min-h-full items-center justify-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title className="text-xl font-bold text-gray-800 mb-4">
                      Xác nhận xóa
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        onClick={() => setDeleteModalState({ isOpen: false, userId: null })}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        onClick={confirmDelete}
                      >
                        Xóa
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Create User Modal */}
        <Transition appear show={createModalState} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={closeCreateModal}
          >
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="flex min-h-full items-center justify-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title className="text-xl font-bold text-gray-800 mb-4">
                      Thêm người dùng mới
                    </Dialog.Title>
                    
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tên người dùng *
                        </label>
                        <input
                          type="text"
                          value={createForm.username}
                          onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                          maxLength={150}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={createForm.email}
                          onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Mật khẩu *
                        </label>
                        <input
                          type="password"
                          value={createForm.password}
                          onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                          minLength={8}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Tối thiểu 6 ký tự
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày tham gia
                        </label>
                        <input
                          type="date"
                          value={createForm.date_joined}
                          onChange={(e) => setCreateForm({...createForm, date_joined: e.target.value})}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          value={createForm.date_of_birth}
                          onChange={(e) => setCreateForm({...createForm, date_of_birth: e.target.value})}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ảnh đại diện
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCreateForm({...createForm, profile_image: e.target.files[0]})}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Vai trò *
                        </label>
                        <select
                          value={createForm.role}
                          onChange={(e) => setCreateForm({...createForm, role: Number(e.target.value)})}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value={1}>Người dùng</option>
                          <option value={2}>Quản trị viên</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          type="button"
                          onClick={closeCreateModal}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Thêm
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

      {/* Pagination */}
      <Pagination
        totalItems={users.length}
        itemsPerPage={usersPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  );
};

export default UsersPage;
