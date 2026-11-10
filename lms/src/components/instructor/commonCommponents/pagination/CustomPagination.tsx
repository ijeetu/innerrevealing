import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { useTranslation } from '@/hooks/useTranslation';
import { getDirection } from '@/utils/helpers';

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (value: string) => void;
    showResultText?: boolean;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
    currentPage,
    totalPages,
    rowsPerPage,
    totalItems,
    onPageChange,
    onRowsPerPageChange,
    showResultText = true,
}) => {

    const { t } = useTranslation();
    const direction = getDirection();
    const isRTL = direction === "rtl";

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show pages around current page
            if (currentPage <= 3) {
                // Show first 5 pages
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                if (totalPages > 5) {
                    pages.push('ellipsis');
                    pages.push(totalPages);
                }
            } else if (currentPage >= totalPages - 2) {
                // Show last 5 pages
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show pages around current page
                pages.push(1);
                pages.push('ellipsis');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    // Pagination Controls Component
    const PaginationControls = () => (
        <div className="flex items-center justify-end w-full md:w-auto">
            <div className='flex items-center gap-1 md:gap-2 flex-wrap'>
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border border-gray-300 rounded p-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 flex items-center justify-center shrink-0"
                >
                    {isRTL ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
                </button>

                {getPageNumbers().map((page, index) => (
                    <div key={index} className="shrink-0">
                        {page === 'ellipsis' ? (
                            <span className="border border-gray-300 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded hover:bg-gray-50 text-xs md:text-sm">
                                ...
                            </span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page as number)}
                                className={`border border-gray-300 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded text-xs md:text-sm ${currentPage === page
                                    ? "bg-[var(--primary-color)] text-white"
                                    : "hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </button>
                        )}
                    </div>
                ))}

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="border border-gray-300 rounded p-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 flex items-center justify-center shrink-0"
                >
                    {isRTL ? <BiChevronLeft size={20} /> : <BiChevronRight size={20} />}
                </button>
            </div>
        </div>
    );

    // Result Display Component
    const ResultDisplay = () => (
        <div className="flex items-center justify-between md:justify-start w-full md:w-auto text-sm gap-3">
            <span className="whitespace-nowrap text-gray-500 font-medium">{t("showing_result")}</span>
            <div className='flex items-center gap-2'>
                <Select value={rowsPerPage.toString()} onValueChange={onRowsPerPageChange}>
                    <SelectTrigger className="w-[70px] h-9 text-xs border-gray-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
                <span className="whitespace-nowrap text-gray-500 font-medium">{t("of")} {totalItems}</span>
            </div>
        </div>
    );

    // If no pagination needed
    if (totalPages <= 1) {
        return showResultText ? <ResultDisplay /> : null;
    }

    // Layout
    return (
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 mt-6">
            {showResultText && <ResultDisplay />}
            <PaginationControls />
        </div>
    );
};

export default CustomPagination;
