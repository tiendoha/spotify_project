import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from "react-redux";
import PageLayout from '../components/PageLayout';
import Pagination from '../components/Pagination';
import { BsGrid, BsList } from 'react-icons/bs';
import { IoMdAdd } from 'react-icons/io';
import {
  fetchTracks,
  addTrack,
  updateTrack,
  deleteTrack,
} from "../redux/tracks/trackSlice";
import { fetchArtists } from "../redux/artists/artistSlice";
import { fetchAlbums } from "../redux/albums/albumSlice";
import { getImageUrl } from "../utils/imageUtils";
const TracksPage = () => {
  const dispatch = useDispatch();
  const {
    tracks,
    status: trackStatus,
    error: trackError,
  } = useSelector((state) => state.tracks);
  const { artists } = useSelector((state) => state.artists);
  const { albums } = useSelector((state) => state.albums);
  const [modalState, setModalState] = useState({
    isOpen: false,
    isEdit: false,
    track: null,
  });
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    trackId: null
  });
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    file: null,
    fileName: "",
    image: null,
    artist: "",
    album: "",
  });
  const [viewMode, setViewMode] = useState("grid"); // State để theo dõi chế độ hiển thị
  const [currentPage, setCurrentPage] = useState(1);
  const tracksPerPage = 9; // Adjust number as needed

  useEffect(() => {
    dispatch(fetchTracks());
    dispatch(fetchArtists());
    dispatch(fetchAlbums());
  }, [dispatch]);

  // Cập nhật hàm openModal để thêm fileName
  const openModal = (track = null) => {
    setModalState({
      isOpen: true,
      isEdit: !!track,
      track,
    });
    setFormData(
      track
        ? {
            name: track.name,
            duration: track.duration,
            file: null,
            fileName: track.file,
            image: track.image,
            artist: track.artist || "",
            album: track.album || "",
          }
        : { name: "", duration: "", file: null, fileName: "", image: null, artist: "", album: "" }
    );
  };

  const closeModal = () => {
    setModalState({ isOpen: false, isEdit: false, track: null });
    setFormData({ name: "", duration: "", file: null, fileName: "", image: null, artist: "", album: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trackData = new FormData();

    if (modalState.isEdit) {
      // Khi chỉnh sửa (PUT request)
      trackData.append("name", formData.name);
      trackData.append("duration", formData.duration);
      trackData.append("artist", formData.artist);
      if (formData.album) trackData.append("album", formData.album);

      // Handle file path
      if (formData.file) {
        trackData.append("file", `/tracks/${formData.file.name}`);
      } else {
        trackData.append("file", formData.fileName); // Keep existing file path
      }

      // Handle image path
      if (formData.image instanceof File) {
        trackData.append("image", `/tracks/images/${formData.image.name}`);
      } else if (formData.image) {
        trackData.append("image", formData.image); // Keep existing image path
      }

      dispatch(updateTrack({ id: modalState.track.id, trackData }));
      closeModal();
    } else {
      // Khi thêm mới (POST request)
      trackData.append("name", formData.name);
      trackData.append("duration", formData.duration);
      trackData.append("artist", formData.artist);
      if (formData.album) trackData.append("album", formData.album);
      
      // Add file path with prefix
      if (formData.file) {
        trackData.append("file", `/tracks/${formData.file.name}`);
      }

      // Add image path with prefix
      if (formData.image) {
        trackData.append("image", `/tracks/images/${formData.image.name}`);
      }

      dispatch(addTrack(trackData));
      closeModal();
    }
  };

  const handleDelete = (id) => {
    setDeleteModalState({ isOpen: true, trackId: id });
  };

  const confirmDelete = () => {
    if (deleteModalState.trackId) {
      dispatch(deleteTrack(deleteModalState.trackId));
      setDeleteModalState({ isOpen: false, trackId: null });
    }
  };

  const getArtistName = (id) => {
    const artist = artists.find((a) => a.id === id);
    return artist ? artist.name : "Không xác định";
  };

  const getAlbumName = (id) => {
    const album = albums.find((a) => a.id === id);
    return album ? album.name : "Không có album";
  };

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * tracksPerPage;
    const indexOfFirstItem = indexOfLastItem - tracksPerPage;
    // Sắp xếp tracks theo ID tăng dần
    const sortedTracks = [...tracks].sort((a, b) => a.id - b.id);
    return sortedTracks.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (trackStatus === "loading") {
    return <div className="text-center text-gray-500 py-10">Đang tải...</div>;
  }
  if (trackStatus === "failed") {
    return (
      <div className="text-center text-red-500 py-10">Lỗi: {trackError}</div>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Tiêu đề và nút điều khiển */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Danh sách bài hát</h2>
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
              title="Thêm bài hát"
            >
              <IoMdAdd size={20} />
            </button>
          </div>
        </div>

        {/* Grid/List view */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentItems().map((track) => (
              <div
                key={track.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4 hover:shadow-lg transition-all duration-200"
              >
                {track.image && (
                  <img
                    src={getImageUrl(track.image)}
                    alt={track.name}
                    className="w-full h-40 object-cover rounded-md border border-gray-200"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {track.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Thời lượng: {track.duration}
                  </p>
                  <p className="text-sm text-gray-500">
                    Nghệ sĩ: {getArtistName(track.artist)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Album: {getAlbumName(track.album)}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openModal(track)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(track.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Xóa
                  </button>
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
                    Tên bài hát
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Hình ảnh
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Thời lượng
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">
                    Nghệ sĩ
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-700">Album</th>
                  <th className="p-4 text-sm font-medium text-gray-700 text-right w-[200px]">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((track) => (
                  <tr
                    key={track.id}
                    className="border-t hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="p-4 text-sm text-gray-800">{track.name}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {track.image || "Không có ảnh"}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {track.duration}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {getArtistName(track.artist)}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {getAlbumName(track.album)}
                    </td>
                    <td className="p-4 text-sm w-[200px]">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(track)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(track.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                      {modalState.isEdit ? "Chỉnh sửa bài hát" : "Thêm bài hát mới"}
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tên bài hát
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Nhập tên bài hát"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Thời lượng (HH:MM:SS)
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({ ...formData, duration: e.target.value })
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="VD: 00:03:34"
                          pattern="^[0-5][0-9]:[0-5][0-9]:[0-5][0-9]$"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          File âm thanh
                        </label>
                        <div className="mt-1">
                          {modalState.isEdit && formData.fileName && (
                            <p className="text-sm text-gray-600 mb-2">
                              File hiện tại: {formData.fileName}
                            </p>
                          )}
                          <input
                            type="file"
                            name="file"
                            accept="audio/*"
                            onChange={(e) =>
                              setFormData({ ...formData, file: e.target.files[0] })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                            required={!modalState.isEdit} // Thêm điều kiện này
                          />
                          {modalState.isEdit && (
                            <p className="text-xs text-gray-500 mt-1">
                              Để trống nếu không muốn thay đổi file
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Hình ảnh
                        </label>
                        <div className="mt-1">
                          {modalState.isEdit && formData.image && (
                            <p className="text-sm text-gray-600 mb-2">
                              Ảnh hiện tại: {formData.image}
                            </p>
                          )}
                          <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={(e) =>
                              setFormData({ ...formData, image: e.target.files[0] })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                          />
                          {modalState.isEdit && (
                            <p className="text-xs text-gray-500 mt-1">
                              Để trống nếu không muốn thay đổi ảnh
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nghệ sĩ
                        </label>
                        <select
                          name="artist"
                          value={formData.artist}
                          onChange={(e) =>
                            setFormData({ ...formData, artist: e.target.value })
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="">Chọn nghệ sĩ</option>
                          {artists.map((artist) => (
                            <option key={artist.id} value={artist.id}>
                              {artist.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Album (nếu có)
                        </label>
                        <select
                          name="album"
                          value={formData.album}
                          onChange={(e) =>
                            setFormData({ ...formData, album: e.target.value })
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Không có album</option>
                          {albums.map((album) => (
                            <option key={album.id} value={album.id}>
                              {album.name}
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

        {/* Add delete confirmation modal */}
        <Transition appear show={deleteModalState.isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={() => setDeleteModalState({ isOpen: false, trackId: null })}
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
                        Bạn có chắc chắn muốn xóa bài hát này? Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        onClick={() => setDeleteModalState({ isOpen: false, trackId: null })}
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
        itemsPerPage={tracksPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  );
};

export default TracksPage;
