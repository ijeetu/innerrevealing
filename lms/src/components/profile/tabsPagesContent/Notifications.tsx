"use client";
import Layout from "@/components/layout/Layout";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useTranslation } from '@/hooks/useTranslation';
import { useDispatch, useSelector } from "react-redux";
import { isLoginSelector } from "@/redux/reducers/userSlice";
import DataNotFound from "@/components/commonComp/DataNotFound";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import TeamInvitationModal from "@/components/modals/TeamInvitationModal";
import NotificationSkeleton from "@/components/skeletons/NotificationSkeleton";
import { getNotification, Notification } from "@/utils/api/user/notification/getNotification";
import { instructorNotificationStatusSelector, setInstructorNotificationStatus } from '@/redux/reducers/helpersReducer';
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";

export default function Notifications() {
  const { t } = useTranslation();
  const isLogin = useSelector(isLoginSelector);
  const [notificationsData, setNotificationsData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const isInstructorNotificationStatus = useSelector(instructorNotificationStatusSelector);
  const dispatch = useDispatch();

  const fetchNotificationsData = async (loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const pageToFetch = loadMore ? currentPage + 1 : 1;
      const response = await getNotification({ page: pageToFetch, per_page: 5 });

      if (response) {
        if (!response.error) {
          if (response.data && response.data.data && response.data.data.length > 0) {
            const notifications = response.data.data;
            if (loadMore) {
              setNotificationsData((prev) => [...prev, ...notifications]);
            } else {
              setNotificationsData(notifications);
            }

            const currentPageNum = response.data.current_page;
            const lastPageNum = response.data.last_page;
            const hasMorePages = currentPageNum < lastPageNum;

            setHasMore(hasMorePages);
            setCurrentPage(pageToFetch);
          } else {
            setNotificationsData(prev => (loadMore ? prev : []));
            setHasMore(false);
          }
        } else {
          toast.error(response.message || "Failed to fetch notifications");
          setHasMore(false);
        }
      } else {
        toast.error("Failed to fetch notifications");
      }
    } catch (error) {
      extractErrorMessage(error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      dispatch(setInstructorNotificationStatus(false));
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchNotificationsData();
    }
  }, [isLogin, isInstructorNotificationStatus]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchNotificationsData(true);
    }
  };

  const notificationRedirection = (notification: Notification): string => {
    if (notification.notification_type === 'course') {
      return `/course-details/${notification.slug}`;
    } else if (notification.notification_type === 'instructor') {
      return `/instructors/${notification.slug}`;
    } else if (notification.notification_type === 'url') {
      return notification.type_link || '';
    } else {
      return '';
    }
  }

  return (
    <Layout>
      <div className="sectionBg py-8 md:py-12 border-b border-gray-200">
        <div className="container space-y-4">
          <div className="flexColCenter items-start gap-2">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
              {t("notifications")}
            </h1>
          </div>
          <div className="bg-white rounded-full py-2 px-4 inline-flex items-center gap-1 max-w-full flex-wrap">
            <Link href={"/"} className="primaryColor" title={t("home")}>
              {t("home")}
            </Link>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_profile")}</span>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("notifications")}</span>
          </div>
        </div>
      </div>

      <div className="sectionBg">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <ProfileSidebar />

            <div className="bg-white flex-1 w-full rounded-[10px]">
              <div className="flex justify-between items-center border-b border-gray-200 mb-0">
                <h2 className="text-lg font-semibold text-gray-800 py-4 px-6 ">
                  {t("notifications")}
                </h2>

                {/* {unReadNotificationsCount > 0 && (
                  <button onClick={handleMarkAllReadCompleted} className="mr-8 primaryBg font-medium text-white px-2 py-1 rounded-[8px] max-[366px]:text-[14px]">{t("mark_as_all_read")}</button>
                )} */}
              </div>
              {/* Notification list container */}
              {/* We now map over the notificationsData array to render each notification item */}
              <div className="p-4 md:p-6 space-y-4">
                {/* Check if there are notifications to display */}
                {loading ? (
                  <NotificationSkeleton />
                ) : notificationsData && notificationsData.length > 0 ? (
                  notificationsData.map((notification) => (
                    <NotificationItemRow 
                      key={notification.id} 
                      notification={notification} 
                      notificationRedirection={notificationRedirection}
                      t={t}
                    />
                  ))
                ) : (
                  // Display a message if there are no notifications
                  <div className="text-center text-gray-500">
                    <DataNotFound />
                  </div>
                )}
              </div>

              {/* Show loading skeleton when loading more data */}
              {loadingMore && (
                <div className="px-4 sm:px-6">
                  <NotificationSkeleton />
                </div>
              )}

              {/* Load More Button */}
              {/* Conditionally render the Load More button only if user is logged in and there are more notifications to load */}
              {isLogin && hasMore && (
                <div className="text-center pb-6">
                  <button
                    onClick={handleLoadMore}
                    className="commonBtn w-max disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loadingMore || loading}
                  >
                    {loadingMore ? t("loading") : t("load_more")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const NotificationItemRow = ({
  notification,
  notificationRedirection,
  t
}: {
  notification: Notification;
  notificationRedirection: (n: Notification) => string;
  t: (key: string) => string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messageThreshold, setMessageThreshold] = useState(90);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setMessageThreshold(72);
      } else if (width < 1024) {
        setMessageThreshold(120);
      } else {
        setMessageThreshold(180);
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLongMessage = notification.message && notification.message.length > messageThreshold;

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="sectionBg p-4 rounded-[10px] flex gap-3 md:gap-4"
    >
      {/* Notification icon */}
      <div className="w-16 h-16 bg-gray-300 rounded-md shrink-0">
        <CustomImageTag
          src={notification.image}
          alt={notification.title}
          className="w-16 h-16 rounded-md"
        />
      </div>
      <div className="flex-1">
        <div className="flex flex-col lg:flex-row md:justify-between md:items-start mb-1 gap-5">
          <div>
            <span className="text-sm text-[#010211] whitespace-nowrap lg:hidden block">
              {notification.time_ago}
            </span>
            <Link
              href={notificationRedirection(notification) || ''}
              className="font-semibold text-gray-900 mb-1 md:mb-0 line-clamp-1" style={{ lineBreak: 'anywhere' }}>
              {notification.title}
            </Link>
            <p className={`text-sm text-gray-600 ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`} style={{ lineBreak: 'anywhere' }}>
              {notification.message}
            </p>
            {isLongMessage && (
              <button
                onClick={toggleExpand}
                className="text-sm primaryColor font-medium mt-1 hover:underline focus:outline-none"
              >
                {isExpanded ? t("show_less") : t("read_more")}
              </button>
            )}
          </div>
          <div className="flex items-start justify-end gap-3">
            <span className="text-sm text-[#010211] whitespace-nowrap lg:block hidden">
              {notification.time_ago}
            </span>
            {
              notification.notification_type === 'team_invitation' && notification.invitation_status === 'pending' ?
                <TeamInvitationModal notification={notification} invitationToken={notification.team_members?.invitation_token as string} />
                :
                notification.notification_type === 'team_invitation' &&
                <span className={`${notification?.invitation_status !== "rejected" ? 'bg-[#83B8071F] text-[#83B807]' : 'bg-[#FF00001F] text-[#FF0000]'} font-medium capitalize primaryColor py-1 px-2 rounded-md text-sm max-[400px]:text-[12px]"`}>{notification.invitation_status}</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
};
