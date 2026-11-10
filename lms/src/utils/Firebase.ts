'use client'
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported, Messaging, MessagePayload } from 'firebase/messaging'
import { getAuth, Auth } from 'firebase/auth'
import { useDispatch } from 'react-redux'
import { setFcmTokenData } from '@/redux/reducers/settingsSlice'

export const FIREBASE_UNAVAILABLE_MESSAGE = 'Sign-in is currently unavailable. Please try again later.'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID || '',
}

const isConfiguredValue = (value: string): boolean => Boolean(value.trim()) && !/^x+$/i.test(value.trim())

export const isFirebaseConfigured = (): boolean => [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
].every(isConfiguredValue)

let initializationFailed = false

const getFirebaseApp = (): FirebaseApp | null => {
  if (typeof window === 'undefined' || !isFirebaseConfigured() || initializationFailed) return null
  try {
    return getApps().length ? getApp() : initializeApp(firebaseConfig)
  } catch {
    initializationFailed = true
    console.warn('Firebase initialization is unavailable.')
    return null
  }
}

export const getFirebaseAuth = (): Auth | null => {
  const app = getFirebaseApp()
  if (!app) return null
  try {
    return getAuth(app)
  } catch {
    initializationFailed = true
    console.warn('Firebase authentication is unavailable.')
    return null
  }
}

interface FirebaseDataReturn {
  authentication: Auth | null
  fetchToken: (setTokenFound: (found: boolean) => void, setFcmToken: (token: string | null) => void) => Promise<void>
  onMessageListener: () => Promise<MessagePayload | null>
  signOut: () => Promise<void>
}

const FirebaseData = (): FirebaseDataReturn => {
  const dispatch = useDispatch()
  const authentication = getFirebaseAuth()

  const messagingInstance = async (): Promise<Messaging | null> => {
    const app = getFirebaseApp()
    if (!app || !isConfiguredValue(firebaseConfig.messagingSenderId)) return null
    try {
      return await isSupported() ? getMessaging(app) : null
    } catch {
      return null
    }
  }

  const fetchToken = async (
    setTokenFound: (found: boolean) => void,
    setFcmToken: (token: string | null) => void
  ): Promise<void> => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY || ''
    if (!isConfiguredValue(vapidKey)) return
    const messaging = await messagingInstance()
    if (!messaging) return

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setTokenFound(false)
        setFcmToken(null)
        return
      }

      // Firebase's browser configuration is public; pass it to the static worker
      // so notifications use the same project as authentication.
      const params = new URLSearchParams({ config: JSON.stringify(firebaseConfig) })
      const serviceWorkerRegistration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`)
      await navigator.serviceWorker.ready
      const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration })
      setTokenFound(Boolean(currentToken))
      setFcmToken(currentToken || null)
      if (currentToken) dispatch(setFcmTokenData(currentToken))
    } catch (error) {
      setTokenFound(false)
      setFcmToken(null)
      console.warn('Push notifications are unavailable.', error)
    }
  }

  const onMessageListener = async (): Promise<MessagePayload | null> => {
    const messaging = await messagingInstance()
    if (!messaging) return null
    return new Promise((resolve) => {
      onMessage(messaging, resolve)
    })
  }

  const signOut = async (): Promise<void> => {
    if (authentication) await authentication.signOut()
  }

  return { authentication, fetchToken, onMessageListener, signOut }
}

export default FirebaseData
