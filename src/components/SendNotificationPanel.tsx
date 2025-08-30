'use client'

import { useState } from 'react'
import { db } from '@/app/api/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'
import { infoApp } from '@/components/infoApp'

const SendNotificationPanel = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/menu')
  const [iconUrl, setIconUrl] = useState<string>(infoApp.logoUrl || '/logo.png')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [requireInteraction, setRequireInteraction] = useState<boolean>(false)
  const [silent, setSilent] = useState<boolean>(false)
  const [tag, setTag] = useState<string>('general')
  const [loading, setLoading] = useState(false)

  const isValidUrl = (value: string) => {
    if (!value) return true
    try {
      if (value.startsWith('/')) return true
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  const previewNotification = async () => {
    if (typeof window === 'undefined') return
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission()
    }
    if (Notification.permission === 'granted') {
      try {
        const n = new Notification(title || 'معاينة إشعار', {
          body: body || 'هذا مثال على نص الإشعار',
          icon: iconUrl || (infoApp.logoUrl || '/logo.png'),
          image: imageUrl || undefined,
          tag: tag || undefined,
          requireInteraction,
          silent,
        })
        n.onclick = () => {
          const target = url && isValidUrl(url) ? url : '/'
          const fullUrl = target.startsWith('http') ? target : `${window.location.origin}${target}`
          window.open(fullUrl, '_blank')
        }
      } catch (e) {
        toast.error('تعذر عرض المعاينة في هذا المتصفح')
      }
    } else {
      toast.error('يجب السماح بالإشعارات للمعاينة')
    }
  }

  const handleSend = async () => {
    if (!title || !body) {
      toast.error('العنوان والنص مطلوبان')
      return
    }
    if (title.length > 60) {
      toast.error('العنوان يجب ألا يزيد عن 60 حرفًا')
      return
    }
    if (body.length > 200) {
      toast.error('النص يجب ألا يزيد عن 200 حرف')
      return
    }
    if (!isValidUrl(url) || !isValidUrl(iconUrl) || !isValidUrl(imageUrl)) {
      toast.error('تحقق من صحة الروابط (يمكن استخدام مسار يبدأ بـ / أو رابط كامل)')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        body,
        url,
        icon: iconUrl || null,
        image: imageUrl || null,
        requireInteraction,
        silent,
        tag: tag || null,
        createdAt: serverTimestamp(),
      })

      toast.success('تم إرسال الإشعار للجميع!')
      setTitle('')
      setBody('')
      setUrl('/menu')
      setIconUrl(infoApp.logoUrl || '/logo.png')
      setImageUrl('')
      setRequireInteraction(false)
      setSilent(false)
      setTag('general')
    } catch (error) {
      console.error('Send Error:', error)
      toast.error('حدث خطأ أثناء إرسال الإشعار')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className=" bg-gray-800 rounded-xl p-6 mt-6" dir="rtl">
      <h2 className="text-2xl text-white mb-4 font-bold">إرسال إشعار</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان الإشعار"
        className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
      />
      <div className="text-gray-400 text-sm mb-2">{title.length}/60</div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="نص الإشعار"
        rows={3}
        className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
      />
      <div className="text-gray-400 text-sm mb-4">{body.length}/200</div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="رابط التوجيه (اختياري)"
        className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          value={iconUrl}
          onChange={(e) => setIconUrl(e.target.value)}
          placeholder="رابط الأيقونة (اختياري)"
          className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
        />
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="رابط الصورة داخل الإشعار (اختياري)"
          className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
        />
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="وسم الإشعار (لمنع التكرار)"
          className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
        />
        <div className="flex items-center gap-4 text-white">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={requireInteraction} onChange={(e) => setRequireInteraction(e.target.checked)} />
            يتطلب تفاعل (يبقى مفتوحًا)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={silent} onChange={(e) => setSilent(e.target.checked)} />
            صامت
          </label>
        </div>
      </div>
      <button
        onClick={handleSend}
        disabled={loading}
        className={`bg-amber-600 text-white px-4 py-2 rounded ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700'
        }`}
      >
        {loading ? 'جاري الإرسال...' : 'إرسال'}
      </button>
      <button
        onClick={previewNotification}
        disabled={loading}
        className={`ml-3 bg-gray-700 text-white px-4 py-2 rounded ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
        }`}
      >
        معاينة
      </button>
    </div>
  )
}

export default SendNotificationPanel
