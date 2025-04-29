import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from "react-redux";
import { fetchLikes, addLike, deleteLike } from "../redux/likes/likeSlice";
import { fetchUsers } from "../redux/users/userSlice";
import { fetchTracks } from "../redux/tracks/trackSlice";
import PageLayout from '../components/PageLayout';
import Pagination from '../components/Pagination';
import { BsGrid, BsList } from 'react-icons/bs';

const LikesPage = () => {
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const dispatch = useDispatch();
  const {
    likes,
    status: likeStatus,
    error: likeError,
  } = useSelector((state) => state.likes);
  const { users, status: userStatus } = useSelector((state) => state.users);
  const { tracks, status: trackStatus } = useSelector((state) => state.tracks);
  const [modalState, setModalState] = useState({ isOpen: false, track: null });
  const [formData, setFormData] = useState({ user: "" });
  const [viewMode, setViewMode] = useState("grid");
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    likeId: null
  });

  useEffect(() => {
    dispatch(fetchLikes());
    dispatch(fetchUsers());
    dispatch(fetchTracks());
  }, [dispatch]);

  const openModal = (track) => {
    setModalState({ isOpen: true, track });
    setFormData({ user: "" });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, track: null });
    setFormData({ user: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const likeData = {
      user: Number(formData.user),
      track: modalState.track.id,
    };
    dispatch(addLike(likeData)).then(() => {
      dispatch(fetchLikes());
    });
    setFormData({ user: "" });
  };

  const handleDelete = (id) => {
    setDeleteModalState({ isOpen: true, likeId: id });
  };

  const confirmDelete = () => {
    if (deleteModalState.likeId) {
      dispatch(deleteLike(deleteModalState.likeId)).then(() => {
        dispatch(fetchLikes());
      });
      setDeleteModalState({ isOpen: false, likeId: null });
    }
  };

  const getUserName = (id) => {
    const user = users.find((u) => u.id === Number(id));
    return user && user.username ? user.username : `ID: ${id}`;
  };

  const getTrackLikes = (trackId) => {
    return likes.filter((l) => l.track === trackId);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN"); // Định dạng: 04/03/2025
  };

  if (
    likeStatus === "loading" ||
    userStatus === "loading" ||
    trackStatus === "loading"
  ) {
    return <div className="text-center text-gray-500 py-10">Đang tải...</div>;
  }
  if (likeStatus === "failed") {
    return (
      <div className="text-center text-red-500 py-10">
        Lỗi likes: {likeError}
      </div>
    );
  }

  // Add pagination handlers
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return tracks.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Update return statement
  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Danh sách Lượt Thích Bài Hát
          </h2>
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
            title={viewMode === "grid" ? "Chuyển sang danh sách" : "Chuyển sang lưới"}
          >
            {viewMode === "grid" ? <BsList size={20} /> : <BsGrid size={20} />}
          </button>
        </div>

        {/* Grid/List Views - Update to use getCurrentItems() */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentItems().map((track) => {
              const trackLikes = getTrackLikes(track.id);
              return (
                <div
                  key={track.id}
                  className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-lg transition-all duration-200"
                >
                  {/* Main content container with fixed height */}
                  <div className="flex-1 flex flex-col min-h-[200px]">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {track.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Số lượt thích: {trackLikes.length}
                      </p>
                      {/* Scrollable likes list */}
                      <div className="mt-2 overflow-y-auto max-h-[120px]">
                        <ul className="text-sm text-gray-600">
                          {trackLikes.map((like) => (
                            <li key={like.id} className="py-1">
                              {getUserName(like.user)} ({formatDate(like.liked_at)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Fixed button container at bottom */}
                  <div className="mt-4 pt-2 border-t border-gray-100">
                    <div className="flex justify-end">
                      <button
                        onClick={() => openModal(track)}
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
                    Tên bài hát
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Số lượt thích
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Người thích
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((track) => {
                  const trackLikes = getTrackLikes(track.id);
                  return (
                    <tr
                      key={track.id}
                      className="border-t hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="p-4 text-sm text-gray-800">{track.name}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {trackLikes.length}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {trackLikes
                          .map(
                            (l) =>
                              `${getUserName(l.user)} (${formatDate(l.liked_at)})`
                          )
                          .join(", ")}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => openModal(track)}
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

        {/* Modal quản lý likes */}
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
                      Quản lý lượt thích "{modalState.track?.name}"
                    </Dialog.Title>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Người thích hiện tại:
                        </h4>
                        <ul className="mt-2 space-y-2">
                          {getTrackLikes(modalState.track?.id || 0).map((like) => (
                            <li key={like.id} className="flex justify-between items-center">
                              <span>
                                {getUserName(like.user)} ({formatDate(like.liked_at)})
                              </span>
                              <button
                                onClick={() => handleDelete(like.id)}
                                className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              >
                                Xóa
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

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

        {/* Add delete confirmation modal */}
        <Transition appear show={deleteModalState.isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={() => setDeleteModalState({ isOpen: false, likeId: null })}
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
                        Bạn có chắc chắn muốn xóa lượt thích này? Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        onClick={() => setDeleteModalState({ isOpen: false, likeId: null })}
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

      {/* Add Pagination */}
      <Pagination
        totalItems={tracks.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  );
};

export default LikesPage;
