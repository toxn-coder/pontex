'use client'

import { useState } from 'react'
import { db } from '@/app/api/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'

const SendNotificationPanel = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/menu')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!title || !body) {
      toast.error('العنوان والنص مطلوبان')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        body,
        url,
        createdAt: serverTimestamp(),
      })

      toast.success('تم إرسال الإشعار للجميع!')
      setTitle('')
      setBody('')
      setUrl('/menu')
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
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="نص الإشعار"
        rows={3}
        className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="رابط التوجيه (اختياري)"
        className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
      />
      <button
        onClick={handleSend}
        disabled={loading}
        className={`bg-amber-600 text-white px-4 py-2 rounded ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700'
        }`}
      >
        {loading ? 'جاري الإرسال...' : 'إرسال'}
      </button>
    </div>
  )
}

export default SendNotificationPanel
