'use client'
import React, { useEffect, useState } from 'react'
import 'firebase/messaging'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import FirebaseData from '../../utils/Firebase'
import { settingsSelector } from '@/redux/reducers/settingsSlice'
import { NotificationPayload } from 'firebase/messaging'
import { useTranslation } from '@/hooks/useTranslation';  

const PushNotificationLayout = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<NotificationPayload | null>(null)
  const [isTokenFound, setTokenFound] = useState<boolean>(false)
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const { fetchToken, onMessageListener } = FirebaseData()
  const settingsData = useSelector(settingsSelector)
  const { t } = useTranslation();
  
  // Request permission and fetch FCM token on mount
  useEffect(() => {
    const handleFetchToken = async (): Promise<void> => {
      await fetchToken(setTokenFound, setFcmToken)
    }
    handleFetchToken()
  }, [])

  const justForLog = false;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // setUserToken(settingsData?.fcmtoken || null)
    }
  }, [settingsData?.fcmtoken])
    
  useEffect(() => {
    if (justForLog) {
      console.log('isTokenFound:', isTokenFound)
      console.log('fcmToken:', fcmToken)
    }
  }, [justForLog])

  useEffect(() => {
    const handleMessage = async () => {
      try {
        const payload = await onMessageListener()
        if (payload && typeof payload === 'object') {
          setNotification(payload as NotificationPayload)
        }
      } catch (err) {
        console.error('Error handling foreground notification:', err)
        toast.error(t("error_handling_notification"))
      }
    }

    handleMessage()
  }, [])

  useEffect(() => {
    // if (notification) {
    //   console.log('Notification received:', notification)
    // }
  }, [notification])

  return <div>{React.cloneElement(children as React.ReactElement)}</div>
}

export default PushNotificationLayout
