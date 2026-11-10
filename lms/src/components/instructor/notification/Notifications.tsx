"use client";
import React, { useState, useEffect } from 'react'
import toast from "react-hot-toast";
import NotificationsTable from '../commonCommponents/NotificationsTable';
import CustomPagination from '../commonCommponents/pagination/CustomPagination';
import { getNotifications, GetNotificationsParams, NotificationItem } from '@/utils/api/instructor/notifications/getNotifications';
import { extractErrorMessage } from "@/utils/helpers";
import { setTotalNotifications, setNotificationData } from '@/redux/reducers/nottificationSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Notification } from "@/utils/api/user/notification/getNotification";
import { instructorNotificationStatusSelector, setInstructorNotificationStatus } from '@/redux/reducers/helpersReducer';

const Notifications = ({ teamSlug }: { teamSlug?: string }) => {

    // Local state for notifications data
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const isInstructorNotificationStatus = useSelector(instructorNotificationStatusSelector);
    const dispatch = useDispatch();

    // Fetch notifications function (following the same pattern as fetchAddedCourses)
    const fetchNotifications = async (params?: {
        page?: number;
        per_page?: number;
    }) => {
        setIsLoading(true);

        try {
            // Build API parameters based on current filters
            const apiParams: GetNotificationsParams = {
                per_page: params?.per_page || rowsPerPage,
                page: params?.page || currentPage,
            };

            // Add team user slug parameter if provided
            if (teamSlug) {
                apiParams.team_user_slug = teamSlug;
            }

            // Fetch notifications with server-side filtering and pagination
            const response = await getNotifications(apiParams);

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data?.data) {
                        setNotifications(response.data.data);
                        dispatch(setTotalNotifications(response.data.unread_count))
                        dispatch(setNotificationData(response.data.data as Notification[]))
                    }
                    // Set pagination data directly from response
                    if (response.data) {
                        setTotalItems(response.data.total);
                        setTotalPages(response.data.last_page);
                    } else {
                        setTotalItems(0);
                        setTotalPages(0);
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch notifications");
                    setNotifications([]);
                    setTotalItems(0);
                    setTotalPages(0);
                }
            } else {
                console.log("response is null in component", response);
                setNotifications([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (error) {
            extractErrorMessage(error);
            setNotifications([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
            dispatch(setInstructorNotificationStatus(false));
        }
    };

    // Handler functions for pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchNotifications({ page });
    };

    const handleRowsPerPageChange = (newRowsPerPage: string) => {
        const newRows = parseInt(newRowsPerPage);
        setRowsPerPage(newRows);
        setCurrentPage(1); // Reset to first page when changing rows per page
        fetchNotifications({ per_page: newRows, page: 1 });
    };

    // Fetch notifications on component mount
    useEffect(() => {
        fetchNotifications();
    }, [isInstructorNotificationStatus]);

    return (
        <div className="bg-white rounded-2xl border borderColor my-6">
            {/* Notifications Table - child component */}
            <NotificationsTable
                notifications={notifications}
                isLoading={isLoading}
            />

            {/* Pagination - handled by parent */}
            {totalPages > 0 && (
                <div className="border-t borderColor p-4">
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

export default Notifications
