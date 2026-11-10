export interface CentreNotification { id: string; title: string; message: string; type_link: string | null; is_read: boolean; time_ago: string }
export interface NotificationPage { data: CentreNotification[]; unread_count: number; current_page: number; last_page: number; total: number }
export const notificationLink = (item: CentreNotification) => item.type_link?.startsWith('/') && !item.type_link.startsWith('//') ? item.type_link : '/transaction-history';
