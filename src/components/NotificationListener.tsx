'use client'

import { useEffect } from 'react'
import { db } from '@/app/api/firebase'
import { collection, onSnapshot, orderBy, limit, query } from 'firebase/firestore'

interface NotificationData {
  title: string
  body: string
  url: string
}

const NotificationListener = () => {
  useEffect(() => {
    // طلب صلاحية الإشعارات
    if (typeof window !== 'undefined' && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }

    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(1)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        const lastSeenId = localStorage.getItem('lastNotifId')
        if (doc.id !== lastSeenId) {
          const data = doc.data() as NotificationData
          localStorage.setItem('lastNotifId', doc.id)

          if (Notification.permission === 'granted') {
            const notif = new Notification(data.title, {
              body: data.body,
              icon: '/logo.png', // يمكنك تغيير الأيقونة هنا
            })

            // عند الضغط على الإشعار، فتح الرابط إذا وُجد
            notif.onclick = () => {
              if (data.url) {
                window.open(data.url, '_blank')
              }
            }
          }
        }
      }
    })

    return () => unsubscribe()
  }, [])

  return null // لا نحتاج لواجهة UI هنا
}

export default NotificationListener
