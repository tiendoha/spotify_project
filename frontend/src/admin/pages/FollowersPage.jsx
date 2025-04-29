import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFollowers,
  addFollower,
  deleteFollower,
} from "../redux/followers/followerSlice";
import { fetchUsers } from "../redux/users/userSlice";
import { fetchArtists } from "../redux/artists/artistSlice";
import Pagination from '../components/Pagination';
import PageLayout from '../components/PageLayout';
import { BsGrid, BsList } from 'react-icons/bs';
import { getImageUrl } from "../utils/imageUtils";

const FollowersPage = () => {
  const dispatch = useDispatch();
  const {
    followers,
    status: followerStatus,
    error: followerError,
  } = useSelector((state) => state.followers);
  const { users, status: userStatus } = useSelector((state) => state.users);
  const { artists, status: artistStatus } = useSelector(
    (state) => state.artists
  );
  const [modalState, setModalState] = useState({ isOpen: false, artist: null });
  const [formData, setFormData] = useState({ user: "" });
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 items cho grid view, có thể điều chỉnh
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    followerId: null
  });

  useEffect(() => {
    dispatch(fetchFollowers());
    dispatch(fetchUsers());
    dispatch(fetchArtists());
  }, [dispatch]);

  const openModal = (artist) => {
    setModalState({ isOpen: true, artist });
    setFormData({ user: "" });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, artist: null });
    setFormData({ user: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const followerData = {
      user: Number(formData.user),
      artist: modalState.artist.id,
    };
    dispatch(addFollower(followerData)).then(() => {
      dispatch(fetchFollowers());
    });
    setFormData({ user: "" });
  };

  const handleDelete = (id) => {
    setDeleteModalState({ isOpen: true, followerId: id });
  };

  const confirmDelete = () => {
    if (deleteModalState.followerId) {
      dispatch(deleteFollower(deleteModalState.followerId)).then(() => {
        dispatch(fetchFollowers());
      });
      setDeleteModalState({ isOpen: false, followerId: null });
    }
  };

  const getUserName = (id) => {
    const user = users.find((u) => u.id === Number(id));
    return user && user.username ? user.username : `ID: ${id}`;
  };

  const getArtistFollowers = (artistId) => {
    return followers.filter((f) => f.artist === artistId);
  };

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return artists.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (
    followerStatus === "loading" ||
    userStatus === "loading" ||
    artistStatus === "loading"
  ) {
    return <div className="text-center text-gray-500 py-10">Đang tải...</div>;
  }
  if (followerStatus === "failed") {
    return (
      <div className="text-center text-red-500 py-10">
        Lỗi followers: {followerError}
      </div>
    );
  }

  return (
    <PageLayout>
      {/* Main content with padding */}
      <div className="space-y-6">
        {/* Tiêu đề và nút điều khiển */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Danh sách Theo dõi Nghệ sĩ
          </h2>
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
            title={viewMode === "grid" ? "Chuyển sang danh sách" : "Chuyển sang lưới"}
          >
            {viewMode === "grid" ? <BsList size={20} /> : <BsGrid size={20} />}
          </button>
        </div>

        {/* Grid/List view */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentItems().map((artist) => {
              const artistFollowers = getArtistFollowers(artist.id);
              return (
                <div
                  key={artist.id}
                  className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-lg transition-all duration-200"
                > 
                  {/* Set chiều cao cố định cho container */}
                  <div className="flex-1 flex flex-col min-h-[300px]">
                    <img
                      src={getImageUrl(artist.image) || "https://via.placeholder.com/150"}
                      alt={artist.name}
                      className="w-full h-40 object-cover rounded-md border border-gray-200"
                    />
                    <div className="flex-1 mt-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {artist.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Số người theo dõi: {artistFollowers.length}
                      </p>
                      <ul className="text-sm text-gray-600 mt-2">
                        {artistFollowers.map((f) => (
                          <li key={f.id}>{getUserName(f.user)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Button container fixed at bottom */}
                  <div className="mt-4 pt-2 border-t border-gray-100">
                    <div className="flex justify-end">
                      <button
                        onClick={() => openModal(artist)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                      >
                        Quản lý
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Ảnh nghệ sĩ
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Tên nghệ sĩ
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Số người theo dõi
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Người theo dõi
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((artist) => {
                  const artistFollowers = getArtistFollowers(artist.id);
                  return (
                    <tr
                      key={artist.id}
                      className="border-t hover:bg-gray-50 transition-all duration-200"
                    >

                      <td className="p-4 text-sm text-gray-800">{artist.name}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {artist.image || "Không có đường dẫn ảnh"}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {artistFollowers.length}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {artistFollowers
                          .map((f) => getUserName(f.user))
                          .join(", ")}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => openModal(artist)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                        >
                          Quản lý
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        <Transition appear show={modalState.isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={closeModal}
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
                      Quản lý người theo dõi "{modalState.artist?.name}"
                    </Dialog.Title>
                    
                    <div className="space-y-4">
                      {/* Danh sách người theo dõi hiện tại */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Người theo dõi hiện tại:
                        </h4>
                        <ul className="mt-2 space-y-2">
                          {getArtistFollowers(modalState.artist?.id || 0).map((f) => (
                            <li key={f.id} className="flex justify-between items-center">
                              <span>{getUserName(f.user)}</span>
                              <button
                                onClick={() => handleDelete(f.id)}
                                className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              >
                                Xóa
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Thêm người theo dõi mới */}
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Chọn người dùng
                          </label>
                          <select
                            value={formData.user}
                            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          >
                            <option value="">Chọn người dùng</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.username}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            Đóng
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Thêm
                          </button>
                        </div>
                      </form>
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
            onClose={() => setDeleteModalState({ isOpen: false, followerId: null })}
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
                        Bạn có chắc chắn muốn xóa lượt theo dõi này? Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        onClick={() => setDeleteModalState({ isOpen: false, followerId: null })}
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
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={artists.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  );
};

export default FollowersPage;
