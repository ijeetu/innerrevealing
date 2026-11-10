"use client"
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import DataNotFound from '@/components/commonComp/DataNotFound';
import NotificationSkeleton from '@/components/skeletons/NotificationSkeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import TeamInvitationModal from '@/components/modals/TeamInvitationModal';
import { Notification } from '@/utils/api/user/notification/getNotification';

interface NotificationsTableProps {
    notifications: Notification[];
    isLoading?: boolean;
}

const NotificationsTable = ({ notifications, isLoading = false }: NotificationsTableProps) => {

    const { t } = useTranslation();
    const router = useRouter();

    const notificationRedirection = (notification: Notification) => {
        if (notification.notification_type === 'course') {
            router.push(`/course-details/${notification.slug}`);
        } else if (notification.notification_type === 'instructor') {
            router.push(`/instructors/${notification.slug}`);
        } else if (notification.notification_type === 'url') {
            router.push(notification.type_link || '');
        } else {
            return null;
        }
    }

    return (
        <>
            <div className="title p-4 border-b borderColor flex items-center justify-between">
                <h2 className="font-semibold">{t("notifications_list")}</h2>
            </div>

            <div className="p-0">
                {isLoading ? (
                    <div className="p-4 md:p-6">
                        <NotificationSkeleton />
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 border-b borderColor last:border-b-0 flex gap-3 md:gap-4 ${notification.notification_type === 'url' || notification.notification_type === 'instructor' || notification.notification_type === 'course' ? 'cursor-pointer' : ''}`}
                            onClick={() => notificationRedirection(notification)}
                        >
                            {/* Notification icon */}
                            <div className="w-14 h-14 bg-gray-300 rounded-md shrink-0">
                                <CustomImageTag
                                    src={notification.image}
                                    alt={notification.title}
                                    className="w-14 h-14 rounded-md"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col lg:flex-row md:justify-between md:items-start  mb-1 gap-5">
                                    <div>
                                        <span className="text-sm text-[#010211] whitespace-nowrap lg:hidden block">
                                            {notification.time_ago}
                                        </span>
                                        <h3 className="font-semibold text-gray-900 mb-1 md:mb-0 line-clamp-1" style={{ lineBreak: 'anywhere' }}>
                                            {notification.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2" style={{ lineBreak: 'anywhere' }}>
                                            {notification.message}
                                        </p>
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
                    ))
                ) : (
                    !isLoading && <DataNotFound />
                )}
            </div>
        </>
    )
}

export default NotificationsTable
