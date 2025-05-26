import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  // Tính số mục hiện tại
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push(2);
      if (currentPage > 2 && currentPage < totalPages - 1) {
        pages.push("...");
        pages.push(currentPage);
        pages.push("...");
      } else {
        pages.push("...");
      }
      pages.push(totalPages - 1);
      pages.push(totalPages);
    }

    return pages.map((page, index) => (
      <button
        key={index}
        className={`px-2 py-1 rounded text-sm ${
          page === currentPage
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        } ${
          typeof page === "number"
            ? ""
            : "cursor-default text-gray-400 bg-gray-100"
        }`}
        onClick={() => typeof page === "number" && handlePageChange(page)}
        disabled={typeof page !== "number"}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="flex items-center mt-4 justify-between">
      {/* Hàng chữ thông tin */}
      <div className="text-gray-600 text-sm ml-0">
        Hiện thị <span className="font-bold">{startItem}</span> -{" "}
        <span className="font-bold">{endItem}</span> trong tổng số{" "}
        <span className="font-bold">{totalItems}</span> mục
      </div>

      {/* Thanh phân trang */}
      <div className="flex items-center gap-2">
        {/* Nút Trước */}
        <button
          className={`px-2 py-1 rounded text-sm ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          &lt;&lt;
        </button>

        {/* Các số trang */}
        {renderPageNumbers()}

        {/* Nút Sau */}
        <button
          className={`px-2 py-1 rounded text-sm ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
