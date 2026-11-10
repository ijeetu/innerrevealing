'use client'
import React, { useState, useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import {
    notificationDataSelector,
    notificationLimitSelector,
    notificationPageSelector,
    notificationLoadMoreSelector,
    setNotificationData,
    setTotalNotifications,
    totalNotificationsSelector,
    resetNotificationState,
    isInvitationStatusUpdatedSelector,
    setAllTotalNotifications,
    setNextPageUrl
} from '@/redux/reducers/nottificationSlice';
import { getNotification, Notification } from '@/utils/api/user/notification/getNotification';
import { extractErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { isLoginSelector, userDataSelector } from '@/redux/reducers/userSlice';
import DataNotFound from '../commonComp/DataNotFound';
import Link from 'next/link';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';
import type { UserDetails } from "@/utils/api/user/getUserDetails";
import { getDirection } from '@/utils/helpers';

const NotificationDropdown = ({ isMobileNav }: { isMobileNav?: boolean }) => {

    const { t } = useTranslation();

    const isLogin = useSelector(isLoginSelector)
    const currentLanguageCode = useSelector(currentLanguageSelector)
    // Redux state management
    const dispatch = useDispatch();
    const notificationsData = useSelector(notificationDataSelector) as Notification[]
    const notificationLimit = useSelector(notificationLimitSelector) as number
    const totalNotificationsCount = useSelector(totalNotificationsSelector) as number
    const page = useSelector(notificationPageSelector) as number
    const isLoadMoreNotifications = useSelector(notificationLoadMoreSelector) as boolean
    const isInvitationStatusUpdated = useSelector(isInvitationStatusUpdatedSelector) as boolean

    const [isClient, setIsClient] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false)
    const router = useRouter()
    const pathname = usePathname();
    const { slug } = useParams<{ slug: string }>();
    const userData = useSelector(userDataSelector) as UserDetails | null;
    const isInstructor = userData?.is_instructor;

    useEffect(() => {
        setIsClient(true)
    }, [])
    // Fetch notifications data function - follows same pattern as fetchCategoriesData
    const fetchNotificationsData = async () => {
        try {
            const response = await getNotification({
                per_page: notificationLimit,
                page: page,
            });

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data?.data) {
                        const extractedNotifications = response.data.data;

                        // Update total notifications count
                        dispatch(setTotalNotifications(response.data.unread_count))
                        dispatch(setAllTotalNotifications(response.data.total))
                        dispatch(setNextPageUrl(response.data.next_page_url))

                        if (extractedNotifications) {
                            if (!isLoadMoreNotifications) {
                                dispatch(setNotificationData(extractedNotifications))
                            } else {
                                // Load more - append data
                                dispatch(setNotificationData([...notificationsData, ...extractedNotifications]))
                            }
                        }
                    } else {
                        dispatch(setNotificationData([]));
                    }
                } else {
                    toast.error(response.message || "Failed to fetch notifications");
                    dispatch(setNotificationData([]));
                }
            } else {
                dispatch(setNotificationData([]));
            }
        } catch (error) {
            dispatch(setNotificationData([]))
            extractErrorMessage(error);
        }
    }

    // useEffect for fetch notificatiosn data
    useEffect(() => {
        if (isLogin || isInvitationStatusUpdated) {
            fetchNotificationsData();
        }
    }, [page, isLogin, isInvitationStatusUpdated])

    useEffect(() => {
        dispatch(resetNotificationState());
    }, [isNotificationOpen])

    const handleViewAllNotifications = () => {
        if (pathname.includes('instructor') && isInstructor) {
            router.push(`/instructor/notifications?lang=${currentLanguageCode}`);
        } else if (pathname.includes('my-teams')) {
            router.push(`/my-teams/${slug}/notifications?lang=${currentLanguageCode}`);
        } else {
            router.push(`/notifications?lang=${currentLanguageCode}`);
        }
    }


    const notificationRedirection = (notification: Notification) => {
        if (notification.notification_type === 'course') {
            return `/course-details/${notification.slug}?lang=${currentLanguageCode}`;
        } else if (notification.notification_type === 'instructor') {
            return `/instructors/${notification.slug}?lang=${currentLanguageCode}`;
        } else if (notification.notification_type === 'url') {
            return notification.type_link;
        } else {
            return `/?lang=${currentLanguageCode}`;
        }
    }

    return (
        isClient &&
        <div
            className="relative h-full"
            onMouseLeave={() => { setIsNotificationOpen(false) }}
        >
            <DropdownMenu
                open={isNotificationOpen}
                onOpenChange={setIsNotificationOpen}
                dir={getDirection() as "ltr" | "rtl"}
            >
                <DropdownMenuTrigger asChild>
                    <div
                        className="col-span- w-max md:border md:borderColor md:bg-[#F8F8F9] flexCenter justify-start max-[400px]:p-1 p-3 rounded-[4px] h-full cursor-pointer hover:primaryBg hover:text-white transition-all duration-300"
                        onClick={() => {
                            setIsNotificationOpen(true);
                        }}
                    >
                        <Bell size={24} />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[250px] sm:w-[350px] max-h-[400px] overflow-y-auto customScrollbar sm:max-h-[650px] -mt-1 border-none shadow-lg notificationDropdown"
                    align={isMobileNav ? 'start' : 'end'}
                    onMouseLeave={() => setIsNotificationOpen(false)}
                >
                    <div className="flex flex-col bg-white p-4 shadow-[0px_7px_28px_2px_#ADB3B83D] rounded-md gap-2 md:gap-4" onMouseLeave={() => {
                        setIsNotificationOpen(false);
                    }}>
                        {isLogin && notificationsData && notificationsData.length > 0 ? (
                            notificationsData.slice(0, 4).map((notification) => (
                                <div
                                    key={notification.id}
                                    className="border-b borderColor cursor-pointer last-of-type:border-b-0"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            {notification.image ? (
                                                <img
                                                    src={notification.image}
                                                    alt={notification.title}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-300 rounded"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Link
                                                href={notificationRedirection(notification) || ''}
                                                target={notification.notification_type === 'url' ? '_blank' : '_self'}
                                                rel={notification.notification_type === 'url' ? 'noopener noreferrer' : ''}
                                                className="font-medium text-sm md:text-xl">
                                                {notification.title}
                                            </Link>
                                            <p className="text-gray-500 text-sm mt-1 md:text-base">
                                                {notification.message}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-2 text-right md:text-sm mb-2">
                                                {notification.time_ago}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-gray-500">
                                <DataNotFound />
                            </div>
                        )}

                        {isLogin && totalNotificationsCount > 4 && (
                            <button
                                className="commonBtn"
                                onClick={() => { handleViewAllNotifications() }}
                            >
                                {t("view_all")}
                            </button>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default NotificationDropdown
