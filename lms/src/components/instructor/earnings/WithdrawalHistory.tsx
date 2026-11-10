import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BiSearchAlt } from "react-icons/bi";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import TransactionTable from '../commonCommponents/earningsComps/TransactionTable';
import CustomPagination from '../commonCommponents/pagination/CustomPagination';
import { getWithdrawalHistory, GetWithdrawalHistoryParams, WithdrawalItem } from '@/utils/api/instructor/earnings/getWithdrawalHistory';
import { extractErrorMessage } from "@/utils/helpers";
import { useTranslation } from '@/hooks/useTranslation';
import { setInstructorWithdrawal } from '@/redux/reducers/helpersReducer';

const WithdrawalHistory = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    // Local state for withdrawal data
    const [transactionData, setTransactionData] = useState<WithdrawalItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch withdrawal history function (following the same pattern as fetchAddedCourses)
    const fetchWithdrawalHistory = async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
    }) => {
        setIsLoading(true);

        try {
            // Build API parameters based on current filters
            const apiParams: GetWithdrawalHistoryParams = {
                per_page: params?.per_page || rowsPerPage,
                page: params?.page || currentPage,
            };

            // Add search parameter if provided
            if (params?.search !== undefined) {
                // Note: API might not support search, but keeping for consistency
                // apiParams.search = params.search;
            } else if (searchQuery.trim()) {
                // Note: API might not support search, but keeping for consistency
                // apiParams.search = searchQuery.trim();
            }

            // Fetch withdrawal history with server-side filtering and pagination
            const response = await getWithdrawalHistory(apiParams);

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data?.withdrawals) {
                        setTransactionData(response.data.withdrawals);
                    }
                    if (response.data) {
                        dispatch(setInstructorWithdrawal({
                            totalwithdrawal: response.data.total_withdrawal.value,
                            availableToWithdrawal: response.data.available_to_withdraw.value,
                        }));
                    }
                    // Set pagination data directly from response
                    if (response.data?.pagination) {
                        setTotalItems(response.data.pagination.total);
                        setTotalPages(response.data.pagination.last_page);
                    } else {
                        setTotalItems(0);
                        setTotalPages(0);
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch withdrawal history");
                    setTransactionData([]);
                    setTotalItems(0);
                    setTotalPages(0);
                }
            } else {
                console.log("response is null in component", response);
                setTransactionData([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (error) {
            extractErrorMessage(error);
            setTransactionData([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler functions for search and pagination
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchWithdrawalHistory({ page });
    };

    const handleRowsPerPageChange = (newRowsPerPage: string) => {
        const newRows = parseInt(newRowsPerPage);
        setRowsPerPage(newRows);
        setCurrentPage(1); // Reset to first page when changing rows per page
        fetchWithdrawalHistory({ per_page: newRows, page: 1 });
    };

    // Fetch withdrawal history on component mount
    useEffect(() => {
        fetchWithdrawalHistory();
    }, []);

    // Handle search with debounce (similar to CoursesTable pattern)
    useEffect(() => {
        if (searchQuery.trim()) {
            const timer = setTimeout(() => {
                setCurrentPage(1);
                fetchWithdrawalHistory({ search: searchQuery, page: 1 });
            }, 1500); // 1.5s delay
            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    return (
        <div className="bg-white rounded-2xl border borderColor" >
            <div className="flex flex-col sm:flex-row justify-between p-4 items-start sm:items-center border-b borderColor gap-4">
                <h2 className="font-semibold">{t("transaction_history")}</h2>
                {/* NOTE: Instant of normal search add date range picker */}
                {/* <div className="flex items-center w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Input
                            type="search"
                            placeholder={t("search_for_transaction")}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-2 w-full rounded-bl-[5px] rounded-br-[0px] sectionBg rounded-tl-[5px] rounded-tr-[0px]"
                        />
                    </div>
                    <Button className="bg-gray-800 hover:bg-gray-700 text-white font-light h-9 rounded-bl-[0px] rounded-br-[5px]  rounded-tl-[0px] rounded-tr-[5px]`">
                        {t("search")} <BiSearchAlt className="ml-2" size={18} />
                    </Button>
                </div> */}
            </div>

            {/* Transaction table */}
            <TransactionTable data={transactionData} isLoading={isLoading} />

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="p-4 sm:p-6 border-t borderColor">
                    <CustomPagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        totalItems={totalItems}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        showResultText={true}
                    />
                </div>
            )}
        </div>
    )
}

export default WithdrawalHistory
