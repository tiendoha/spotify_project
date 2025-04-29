import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from "react-redux";
import PageLayout from '../components/PageLayout';
import Pagination from '../components/Pagination';
import {
  fetchPlaylists,
  addPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../redux/playlists/playlistSlice";
import { fetchUsers } from "../redux/users/userSlice";
import { fetchTracks } from "../redux/tracks/trackSlice";
import {
  fetchPlaylistTracks,
  addPlaylistTrack,
  deletePlaylistTrack,
} from "../redux/playlist-tracks/playlistTrackSlice";
import { BsGrid, BsList } from 'react-icons/bs';
import { IoMdAdd } from 'react-icons/io';
import { getImageUrl } from "../utils/imageUtils";
const PlaylistsPage = () => {
  const dispatch = useDispatch();
  const {
    playlists,
    status: playlistStatus,
    error: playlistError,
  } = useSelector((state) => state.playlists);
  const {
    users,
    status: userStatus,
    error: userError,
  } = useSelector((state) => state.users);
  const { tracks, status: trackStatus } = useSelector((state) => state.tracks);
  const { playlistTracks, status: playlistTrackStatus } = useSelector(
    (state) => state.playlistTracks
  );
  const [modalState, setModalState] = useState({
    isOpen: false,
    isEdit: false,
    playlist: null,
  });
  const [trackModalState, setTrackModalState] = useState({
    isOpen: false,
    playlist: null,
  });
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    playlistId: null
  });

  const [deleteTrackModalState, setDeleteTrackModalState] = useState({
    isOpen: false,
    trackId: null
  });
  const [formData, setFormData] = useState({ name: "", image: null, user: "" });
  const [trackFormData, setTrackFormData] = useState({
    track: "",
  });
  const [viewMode, setViewMode] = useState("grid");

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const playlistsPerPage = 9; // Adjust as needed

  useEffect(() => {
    dispatch(fetchPlaylists());
    dispatch(fetchUsers());
    dispatch(fetchTracks());
    dispatch(fetchPlaylistTracks());
  }, [dispatch]);

  const openModal = (playlist = null) => {
    setModalState({ isOpen: true, isEdit: !!playlist, playlist });
    setFormData(
      playlist
        ? { 
            name: playlist.name, 
            image: playlist.image, // Store the existing image path
            user: playlist.user.toString() 
          }
        : { 
            name: "", 
            image: null, 
            user: "" 
          }
    );
  };

  const closeModal = () => {
    setModalState({ isOpen: false, isEdit: false, playlist: null });
    setFormData({ name: "", image: null, user: "" });
  };

  const openTrackModal = (playlist) => {
    setTrackModalState({ isOpen: true, playlist });
    setTrackFormData({ track: "" });
  };

  const closeTrackModal = () => {
    setTrackModalState({ isOpen: false, playlist: null });
    setTrackFormData({ track: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const playlistData = new FormData();
    
    if (modalState.isEdit) {
      // When editing playlist
      playlistData.append("name", formData.name);
      playlistData.append("user", formData.user);
      
      // Handle image path
      if (formData.image instanceof File) {
        playlistData.append("image", `/playlists/${formData.image.name}`);
      } else if (formData.image) {
        playlistData.append("image", formData.image); // Keep existing image path
      }

      dispatch(updatePlaylist({ id: modalState.playlist.id, playlistData }))
        .unwrap()
        .then(() => {
          dispatch(fetchPlaylists());
          closeModal();
        })
        .catch((error) => {
          console.error('Error updating playlist:', error);
        });
    } else {
      // When adding new playlist
      playlistData.append("name", formData.name);
      playlistData.append("user", formData.user);
      
      // Add image path with /playlists/ prefix
      if (formData.image) {
        playlistData.append("image", `/playlists/${formData.image.name}`);
      }

      dispatch(addPlaylist(playlistData))
        .unwrap()
        .then(() => {
          dispatch(fetchPlaylists());
          closeModal();
        })
        .catch((error) => {
          console.error('Error adding playlist:', error);
        });
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    
    // Get current playlist tracks
    const currentTracks = getPlaylistTracks(trackModalState.playlist.id);
    // Calculate new track order (length of current tracks = next index)
    const newTrackOrder = currentTracks.length;

    const playlistTrackData = {
      playlist: trackModalState.playlist.id,
      track: Number(trackFormData.track),
      track_order: newTrackOrder, // Automatically set the order
    };

    dispatch(addPlaylistTrack(playlistTrackData)).then(() => {
      dispatch(fetchPlaylistTracks());
    });
    setTrackFormData({ track: "" }); // Reset only track selection
  };

  const handleDelete = (id) => {
    setDeleteModalState({ isOpen: true, playlistId: id });
  };

  const confirmDelete = () => {
    if (deleteModalState.playlistId) {
      dispatch(deletePlaylist(deleteModalState.playlistId));
      setDeleteModalState({ isOpen: false, playlistId: null });
    }
  };

  const handleDeleteTrack = (id) => {
    setDeleteTrackModalState({ isOpen: true, trackId: id });
  };

  const confirmDeleteTrack = () => {
    if (deleteTrackModalState.trackId) {
      dispatch(deletePlaylistTrack(deleteTrackModalState.trackId)).then(() => {
        dispatch(fetchPlaylistTracks());
      });
      setDeleteTrackModalState({ isOpen: false, trackId: null });
    }
  };

  const getUserName = (id) => {
    const user = users.find((u) => u.id === Number(id));
    return user && user.username ? user.username : `ID: ${id}`;
  };

  const getTrackName = (id) => {
    const track = tracks.find((t) => t.id === Number(id));
    return track && track.name ? track.name : `ID: ${id}`;
  };

  const getPlaylistTracks = (playlistId) => {
    return playlistTracks
      .filter((pt) => pt.playlist === playlistId)
      .sort((a, b) => a.track_order - b.track_order);
  };

  // Add pagination handlers
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * playlistsPerPage;
    const indexOfFirstItem = indexOfLastItem - playlistsPerPage;
    // Sort playlists by ID before pagination
    const sortedPlaylists = [...playlists].sort((a, b) => a.id - b.id);
    return sortedPlaylists.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (
    playlistStatus === "loading" ||
    userStatus === "loading" ||
    trackStatus === "loading" ||
    playlistTrackStatus === "loading"
  ) {
    return <div className="text-center text-gray-500 py-10">Đang tải...</div>;
  }
  if (playlistStatus === "failed")
    return (
      <div className="text-center text-red-500 py-10">
        Lỗi playlist: {playlistError}
      </div>
    );
  if (userStatus === "failed")
    return (
      <div className="text-center text-red-500 py-10">
        Lỗi users: {userError}
      </div>
    );

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Danh sách Playlist</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
              title={viewMode === "grid" ? "Chuyển sang danh sách" : "Chuyển sang lưới"}
            >
              {viewMode === "grid" ? <BsList size={20} /> : <BsGrid size={20} />}
            </button>
            <button
              onClick={() => openModal()}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md"
              title="Thêm Playlist"
            >
              <IoMdAdd size={20} />
            </button>
          </div>
        </div>

        {/* Grid/List Views - Update to use getCurrentItems() */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentItems().map((playlist) => (
              <div
                key={playlist.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-lg transition-all duration-200"
              >
                {/* Set chiều cao cố định cho container */}
                <div className="flex-1 flex flex-col min-h-[400px]">
                  <img
                    src={getImageUrl(playlist.image)}
                    alt={playlist.name}
                    className="w-full h-40 object-cover rounded-md border border-gray-200"
                  />
                  <div className="flex-1 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Người tạo: {getUserName(playlist.user)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Số bài hát: {getPlaylistTracks(playlist.id).length}
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 overflow-y-auto max-h-[120px]">
                      {getPlaylistTracks(playlist.id).map((pt) => (
                        <li key={pt.id}>
                          {pt.track_order + 1}. {getTrackName(pt.track)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Button container fixed at bottom */}
                <div className="mt-4 pt-2 border-t border-gray-100">
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => openModal(playlist)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => openTrackModal(playlist)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      Quản lý bài hát
                    </button>
                    <button
                      onClick={() => handleDelete(playlist.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Hình ảnh
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Tên Playlist
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Người tạo
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Số bài hát
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((playlist) => (
                  <tr
                    key={playlist.id}
                    className="border-t hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="p-4 text-sm text-gray-500">
                      {playlist.image || "Không có ảnh"}
                    </td>
                    <td className="p-4 text-sm text-gray-800">{playlist.name}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {getUserName(playlist.user)}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {getPlaylistTracks(playlist.id).length}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => openModal(playlist)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => openTrackModal(playlist)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                      >
                        Quản lý bài hát
                      </button>
                      <button
                        onClick={() => handleDelete(playlist.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        )}

        {/* Modal chỉnh sửa/thêm playlist */}
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
                      {modalState.isEdit ? "Chỉnh sửa Playlist" : "Thêm Playlist mới"}
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tên Playlist
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Hình ảnh
                        </label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFormData({ 
                                ...formData, 
                                image: file // Store the File object, will be processed in handleSubmit
                              });
                            }
                          }}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {modalState.isEdit && (
                          <p className="text-xs text-gray-500 mt-1">
                            Để trống nếu không muốn thay đổi ảnh
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Người tạo
                        </label>
                        <select
                          value={formData.user}
                          onChange={(e) =>
                            setFormData({ ...formData, user: e.target.value })
                          }
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
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          onClick={closeModal}
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          {modalState.isEdit ? "Cập nhật" : "Thêm"}
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Modal quản lý bài hát trong playlist */}
        <Transition appear show={trackModalState.isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={closeTrackModal}
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
                      Quản lý bài hát trong "{trackModalState.playlist?.name}"
                    </Dialog.Title>
                    <div className="space-y-4">
                      {/* Danh sách bài hát hiện tại */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Bài hát hiện tại:
                        </h4>
                        <ul className="mt-2 space-y-2">
                          {getPlaylistTracks(trackModalState.playlist?.id || 0).map(
                            (pt) => (
                              <li
                                key={pt.id}
                                className="flex justify-between items-center"
                              >
                                <span>
                                  {pt.track_order + 1}. {getTrackName(pt.track)}
                                </span>
                                <button
                                  onClick={() => handleDeleteTrack(pt.id)}
                                  className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                  Xóa
                                </button>
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {/* Thêm bài hát mới */}
                      <form onSubmit={handleTrackSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Chọn bài hát
                          </label>
                          <select
                            value={trackFormData.track}
                            onChange={(e) =>
                              setTrackFormData({
                                ...trackFormData,
                                track: e.target.value,
                              })
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          >
                            <option value="">Chọn bài hát</option>
                            {tracks.map((track) => (
                              <option key={track.id} value={track.id}>
                                {track.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            onClick={closeTrackModal}
                          >
                            Đóng
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Thêm bài hát
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

        {/* Delete confirmation modal */}
        <Transition appear show={deleteModalState.isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={() => setDeleteModalState({ isOpen: false, playlistId: null })}
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
                        Bạn có chắc chắn muốn xóa playlist này? Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        onClick={() => setDeleteModalState({ isOpen: false, playlistId: null })}
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

        {/* Delete track confirmation modal */}
        <Transition appear show={deleteTrackModalState.isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={() => setDeleteTrackModalState({ isOpen: false, trackId: null })}
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
                        Bạn có chắc chắn muốn xóa bài hát này khỏi playlist? Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        onClick={() => setDeleteTrackModalState({ isOpen: false, trackId: null })}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        onClick={confirmDeleteTrack}
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
        totalItems={playlists.length}
        itemsPerPage={playlistsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  );
};

export default PlaylistsPage;
