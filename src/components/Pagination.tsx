import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 4) {
      // Nếu tổng số trang <= 4, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Hiển thị 2 số đầu và 2 số cuối với dấu "..." ở giữa
      pages.push(1);
      pages.push(2);
      pages.push("...");
      pages.push(totalPages - 1);
      pages.push(totalPages);
    }

    return pages.map((page, index) => (
      <button
        key={index}
        className={`px-4 lg:py-2 md:py-1 rounded ${
          page === currentPage
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700"
        } ${
          typeof page === "number"
            ? "hover:bg-gray-300"
            : "cursor-default text-gray-400"
        }`}
        onClick={() => typeof page === "number" && handlePageChange(page)}
        disabled={typeof page !== "number"}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="flex justify-center items-center mt-4 gap-2">
      {/* Nút Trước */}
      <button
        className={`px-4 lg:py-2 md:py-1 rounded ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        &lt; &lt;
      </button>

      {/* Các số trang */}
      {renderPageNumbers()}

      {/* Nút Sau */}
      <button
        className={`px-4 lg:py-2 md:py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        &gt; &gt;
      </button>
    </div>
  );
};

export default Pagination;
