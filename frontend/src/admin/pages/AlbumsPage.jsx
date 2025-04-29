import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlbums,
  addAlbum,
  updateAlbum,
  deleteAlbum,
} from "../redux/albums/albumSlice";
import { fetchArtists } from "../redux/artists/artistSlice";
import { BsGrid, BsList } from 'react-icons/bs';
import { IoMdAdd } from 'react-icons/io';
import Pagination from '../components/Pagination';
import PageLayout from '../components/PageLayout';
import { getImageUrl } from "../utils/imageUtils";
const AlbumsPage = () => {
  const dispatch = useDispatch();
  const {
    albums,
    status: albumStatus,
    error: albumError,
  } = useSelector((state) => state.albums);
  const { artists } = useSelector((state) => state.artists);
  const [modalState, setModalState] = useState({
    isOpen: false,
    isEdit: false,
    album: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    release_date: "",
    image: null,
    artist: "",
  });
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    albumId: null
  });
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 9;

  useEffect(() => {
    dispatch(fetchAlbums());
    dispatch(fetchArtists());
  }, [dispatch]);

  const openModal = (album = null) => {
    setModalState({
      isOpen: true,
      isEdit: !!album,
      album,
    });
    setFormData(
      album
        ? {
            name: album.name,
            release_date: album.release_date,
            image: null,
            artist: album.artist || "",
          }
        : { name: "", release_date: "", image: null, artist: "" }
    );
  };

  const closeModal = () => {
    setModalState({ isOpen: false, isEdit: false, album: null });
    setFormData({ name: "", release_date: "", image: null, artist: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const albumData = new FormData();
    albumData.append("name", formData.name);
    albumData.append("release_date", formData.release_date);
    
    // Handle image path with /albums/ prefix
    if (formData.image) {
      if (typeof formData.image === 'string') {
        albumData.append("image", formData.image);
      } else {
        albumData.append("image", `/albums/${formData.image.name}`);
      }
    }
    albumData.append("artist", formData.artist);

    if (modalState.isEdit) {
      dispatch(updateAlbum({ id: modalState.album.id, albumData }));
    } else {
      dispatch(addAlbum(albumData));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setDeleteModalState({ isOpen: true, albumId: id });
  };

  const confirmDelete = () => {
    if (deleteModalState.albumId) {
      dispatch(deleteAlbum(deleteModalState.albumId));
      setDeleteModalState({ isOpen: false, albumId: null });
    }
  };

  const getArtistName = (id) => {
    const artist = artists.find((a) => a.id === id);
    return artist ? artist.name : "Không xác định";
  };

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * albumsPerPage;
    const indexOfFirstItem = indexOfLastItem - albumsPerPage;
    return albums.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (albumStatus === "loading") {
    return <div className="text-center text-gray-500 py-10">Đang tải...</div>;
  }
  if (albumStatus === "failed") {
    return (
      <div className="text-center text-red-500 py-10">Lỗi: {albumError}</div>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Danh sách album</h2>
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
              title="Thêm album"
            >
              <IoMdAdd size={20} />
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentItems().map((album) => (
              <div
                key={album.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4 hover:shadow-lg transition-all duration-200"
              >
                <img
                  src={getImageUrl(album.image)}
                  alt={album.name}
                  className="w-full h-40 object-cover rounded-md border border-gray-200"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {album.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Ngày phát hành: {album.release_date}
                  </p>
                  <p className="text-sm text-gray-500">
                    Nghệ sĩ: {getArtistName(album.artist)}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openModal(album)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(album.id)}
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
                  <th className="p-4 text-sm font-medium text-gray-700">Tên Album</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Hình ảnh</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Ngày phát hành</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Nghệ sĩ</th>
                  <th className="p-4 text-sm font-medium text-gray-700 text-right w-[200px]">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((album) => (
                  <tr key={album.id} className="border-t hover:bg-gray-50 transition-all duration-200">

                    <td className="p-4 text-sm text-gray-800">{album.name}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {album.image || "Không có ảnh"}
                    </td>
                    <td className="p-4 text-sm text-gray-500">{album.release_date}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {getArtistName(album.artist)}
                    </td>
                    <td className="p-4 text-sm w-[200px]">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(album)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(album.id)}
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
                      {modalState.isEdit ? "Chỉnh sửa album" : "Thêm album mới"}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tên album
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Nhập tên album"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày phát hành (YYYY-MM-DD)
                        </label>
                        <input
                          type="date"
                          name="release_date"
                          value={formData.release_date}
                          onChange={(e) =>
                            setFormData({ ...formData, release_date: e.target.value })
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
                          name="image"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFormData({ 
                                ...formData, 
                                image: file // Store the file object, will be processed in handleSubmit
                              });
                            }
                          }}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                        />
                        {modalState.isEdit && (
                          <p className="text-xs text-gray-500 mt-1">
                            Để trống nếu không muốn thay đổi ảnh
                          </p>
                        )}
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

        <Transition appear show={deleteModalState.isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={() => setDeleteModalState({ isOpen: false, albumId: null })}
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
                        Bạn có chắc chắn muốn xóa album này? Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        onClick={() => setDeleteModalState({ isOpen: false, albumId: null })}
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

      <Pagination
        totalItems={albums.length}
        itemsPerPage={albumsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  );
};

export default AlbumsPage;
