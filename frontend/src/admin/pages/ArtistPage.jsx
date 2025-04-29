import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from "react-redux";
import { BsGrid, BsList } from 'react-icons/bs';
import { IoMdAdd } from 'react-icons/io';
import PageLayout from '../components/PageLayout';
import Pagination from '../components/Pagination';
import {
  fetchArtists,
  addArtist,
  updateArtist,
  deleteArtist,
} from "../redux/artists/artistSlice";
import { getImageUrl } from "../utils/imageUtils";
const ArtistsPage = () => {
  const dispatch = useDispatch();
  const { artists, status, error } = useSelector((state) => state.artists);
  const [viewMode, setViewMode] = useState("grid");

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Combined modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    isEdit: false,
    artist: null
  });

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    artistId: null
  });

  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]);

  // Sửa lại hàm openModal
  const openModal = (artist = null) => {
    const isEdit = artist !== null;
    setModalState({
      isOpen: true,
      isEdit: isEdit,
      artist: artist || null
    });
    setFormData({
      name: isEdit ? artist.name : "",
      image: isEdit ? artist.image : null // Lưu đường dẫn ảnh cũ khi edit
    });
  };

  // Sửa lại hàm closeModal
  const closeModal = () => {
    setModalState({
      isOpen: false,
      isEdit: false,
      artist: null,
    });
    // Reset form data
    setFormData({
      name: "",
      image: null,
    });
  };

  // Sửa lại hàm handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (modalState.isEdit) {
      // Chỉ gửi thông tin ảnh mới nếu có thay đổi
      const updateData = {
        name: formData.name,
        image: formData.image !== modalState.artist.image ? formData.image : undefined
      };
      
      await dispatch(updateArtist({
        id: modalState.artist.id,
        artistData: updateData
      }));
    } else {
      await dispatch(addArtist(formData));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setDeleteModalState({ isOpen: true, artistId: id });
  };

  const confirmDelete = () => {
    if (deleteModalState.artistId) {
      dispatch(deleteArtist(deleteModalState.artistId));
      setDeleteModalState({ isOpen: false, artistId: null });
    }
  };

  // Add pagination handlers
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // Sắp xếp artists theo ID tăng dần
    const sortedArtists = [...artists].sort((a, b) => a.id - b.id);
    return sortedArtists.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Sửa lại hàm xử lý onChange của input file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ 
        ...formData, 
        image: `/artists/${file.name}` 
      });
    }
  };

  if (status === "loading") {
    return <div className="text-center text-gray-500 py-10">Đang tải...</div>;
  }
  if (status === "failed") {
    return <div className="text-center text-red-500 py-10">Lỗi: {error}</div>;
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Danh sách nghệ sĩ</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
              title={viewMode === "grid" ? "Chuyển sang danh sách" : "Chuyển sang lưới"}
            >
              {viewMode === "grid" ? <BsList size={20} /> : <BsGrid size={20} />}
            </button>

            <button
              onClick={() => openModal()} // Thêm arrow function
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md"
              title="Thêm nghệ sĩ"
            >
              <IoMdAdd size={20} />
            </button>
          </div>
        </div>

        {/* Grid/List Views - Update to use getCurrentItems() */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentItems().map((artist) => (
              <div
                key={artist.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4 hover:shadow-lg transition-all duration-200"
              >
                <img
                
                src={(() => {
                  const imageUrl = getImageUrl(artist.image);
                  // console.log('List View Image URL:', {
                  //   originalPath: artist.image,
                  //   fullUrl: imageUrl
                  // });
                  return imageUrl;
                })()}
                  alt={artist.name}
                  className="w-full h-40 object-cover rounded-md border border-gray-200"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {artist.name}
                  </h3>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openModal(artist)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(artist.id)}
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
                  <th className="p-3 text-sm font-medium text-gray-700">
                    Tên nghệ sĩ
                  </th>
                  <th className="p-3 text-sm font-medium text-gray-700">
                    Hình ảnh
                  </th>
                  <th className="p-3 text-sm font-medium text-gray-700 text-right w-[200px]">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((artist) => (
                  <tr
                    key={artist.id}
                    className="border-t hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="p-3 text-sm text-gray-800">{artist.name}</td>
                    <td className="p-3 text-sm text-gray-500">
                      {artist.image || "Không có ảnh"}
                    </td>
                    <td className="p-3 text-sm w-[200px]">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(artist)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(artist.id)}
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

        {/* Edit/Add Modal */}
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
                      {modalState.isEdit ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tên nghệ sĩ
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Hình ảnh
                        </label>
                        <input
                          type="file"
                          onChange={handleImageChange}
                          className="mt-1 w-full"
                          accept="image/*"
                        />
                        {modalState.isEdit && (
                          <p className="text-xs text-gray-500 mt-1">
                            Đường dẫn hiện tại: {modalState.artist?.image}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
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

        {/* Delete Confirmation Modal */}
        <Transition appear show={deleteModalState.isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-[1000]" 
            onClose={() => setDeleteModalState({ isOpen: false, artistId: null })}
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
                        Bạn có chắc chắn muốn xóa nghệ sĩ này? Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        onClick={() => setDeleteModalState({ isOpen: false, artistId: null })}
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
        totalItems={artists.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  );
};

export default ArtistsPage;
