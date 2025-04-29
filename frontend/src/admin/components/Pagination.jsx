import React from "react";
import PropTypes from "prop-types";

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  maxPageNumbers = 5,
}) => {
  // Tính toán tổng số trang, đảm bảo luôn có ít nhất 1 trang
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Luôn hiển thị pagination nếu có items
  if (totalItems === 0) return null;

  return (
    <div className="flex justify-center items-center space-x-1">
      {/* First page button */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className={`px-3 py-1 rounded-lg ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        «
      </button>

      {/* Previous page button */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-3 py-1 rounded-lg ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        ‹
      </button>

      {/* Always show page 1 */}
      <button
        onClick={() => onPageChange(1)}
        className={`px-3 py-1 rounded-lg ${
          currentPage === 1
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        1
      </button>

      {/* Next page button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-3 py-1 rounded-lg ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        ›
      </button>

      {/* Last page button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        className={`px-3 py-1 rounded-lg ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        »
      </button>
    </div>
  );
};

Pagination.propTypes = {
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxPageNumbers: PropTypes.number,
};

export default Pagination;