'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/api/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Instagram, Twitter, Facebook, Send, Mail, Phone, Plus, Save, Trash2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SocialLinksManager() {
  const [socialLinks, setSocialLinks] = useState({
    whatsapp: '',
    instagram: '',
    twitter: '',
    facebook: '',
    googleMapsLink: '',
    address: '',
  });
  const [phones, setPhones] = useState(['']);
  const [emails, setEmails] = useState(['']);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // جلب البيانات من Firestore عند تحميل المكون
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'settings', 'contactInfo');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSocialLinks({
            whatsapp: data.whatsapp || '',
            instagram: data.instagram || '',
            twitter: data.twitter || '',
            facebook: data.facebook || '',
            googleMapsLink: data.googleMapsLink || '',
            address: data.address || '',
          });
          setPhones(data.phones || ['']);
          setEmails(data.emails || ['']);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
        toast.error('فشل جلب معلومات التواصل');
      }
    };
    fetchData();
  }, []);

  // التحقق من صحة رابط خريطة جوجل
  const isValidGoogleMapsLink = (link: string) => {
    return link.includes('maps.google.com') || link.includes('google.com/maps/embed');
  };

  // التحقق من صحة الإيميل
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // التحقق من صحة رقم الهاتف
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^\+?\d{9,15}$/;
    return phoneRegex.test(phone);
  };

  // التعامل مع تغيير روابط التواصل
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialLinks({ ...socialLinks, [name]: value });
    if (name === 'googleMapsLink' && value && !isValidGoogleMapsLink(value)) {
      toast.warning('رابط خريطة جوجل غير صالح. تأكد من استخدام رابط تضمين (embed) صالح.');
    }
  };

  // التعامل مع تغيير أرقام الهواتف
  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
  };

  // إضافة رقم هاتف جديد
  const addPhone = () => {
    setPhones([...phones, '']);
  };

  // حذف رقم هاتف
  const removePhone = (index: number) => {
    if (phones.length > 1) {
      setPhones(phones.filter((_, i) => i !== index));
    } else {
      toast.warning('يجب أن يبقى رقم هاتف واحد على الأقل.');
    }
  };

  // التعامل مع تغيير الإيميلات
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // إضافة إيميل جديد
  const addEmail = () => {
    setEmails([...emails, '']);
  };

  // حذف إيميل
  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    } else {
      toast.warning('يجب أن يبقى بريد إلكتروني واحد على الأقل.');
    }
  };

  // حفظ البيانات في Firestore
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // التحقق من صحة المدخلات
      if (socialLinks.googleMapsLink && !isValidGoogleMapsLink(socialLinks.googleMapsLink)) {
        throw new Error('رابط خريطة جوجل غير صالح.');
      }
      const validPhones = phones.filter((phone) => phone.trim() !== '');
      if (validPhones.length === 0) {
        throw new Error('يجب إدخال رقم هاتف واحد على الأقل.');
      }
      for (const phone of validPhones) {
        if (!isValidPhone(phone)) {
          throw new Error(`رقم الهاتف "${phone}" غير صالح.`);
        }
      }
      const validEmails = emails.filter((email) => email.trim() !== '');
      if (validEmails.length === 0) {
        throw new Error('يجب إدخال بريد إلكتروني واحد على الأقل.');
      }
      for (const email of validEmails) {
        if (!isValidEmail(email)) {
          throw new Error(`البريد الإلكتروني "${email}" غير صالح.`);
        }
      }

      const docRef = doc(db, 'settings', 'contactInfo');
      await setDoc(docRef, {
        whatsapp: socialLinks.whatsapp,
        instagram: socialLinks.instagram,
        twitter: socialLinks.twitter,
        facebook: socialLinks.facebook,
        googleMapsLink: socialLinks.googleMapsLink,
        address: socialLinks.address,
        phones: validPhones,
        emails: validEmails,
      });
      setStatus('success');
      toast.success('تم حفظ التغييرات بنجاح!');
    } catch (error: any) {
      console.error('Error saving contact info:', error);
      setStatus('error');
      toast.error(error.message || 'حدث خطأ أثناء الحفظ. حاول مرة أخرى.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">إدارة معلومات التواصل</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* روابط التواصل الاجتماعي */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">روابط التواصل الاجتماعي</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Send className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <input
                type="text"
                name="whatsapp"
                value={socialLinks.whatsapp}
                onChange={handleSocialChange}
                placeholder="رابط واتساب (مثال: https://wa.me/+966123456789)"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <Instagram className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <input
                type="text"
                name="instagram"
                value={socialLinks.instagram}
                onChange={handleSocialChange}
                placeholder="رابط إنستغرام (مثال: https://instagram.com/username)"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <Twitter className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <input
                type="text"
                name="twitter"
                value={socialLinks.twitter}
                onChange={handleSocialChange}
                placeholder="رابط تويتر (مثال: https://twitter.com/username)"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <Facebook className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <input
                type="text"
                name="facebook"
                value={socialLinks.facebook}
                onChange={handleSocialChange}
                placeholder="رابط فيسبوك (مثال: https://facebook.com/username)"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* العنوان */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">العنوان</h3>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <input
              type="text"
              name="address"
              value={socialLinks.address}
              onChange={handleSocialChange}
              placeholder="أدخل العنوان (مثال: القاهرة - شارع إبراهيم المغازي)"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* رابط خريطة جوجل */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">رابط خريطة جوجل</h3>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <input
              type="text"
              name="googleMapsLink"
              value={socialLinks.googleMapsLink}
              onChange={handleSocialChange}
              placeholder="رابط خريطة جوجل (مثال: https://www.google.com/maps/embed?...)"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          {/* معاينة الخريطة */}
          {socialLinks.googleMapsLink && isValidGoogleMapsLink(socialLinks.googleMapsLink) && (
            <div className="mt-4">
              <h4 className="text-sm text-gray-300 mb-2">معاينة الخريطة:</h4>
              <iframe
                src={socialLinks.googleMapsLink}
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="معاينة خريطة جوجل"
                className="rounded-lg"
              />
            </div>
          )}
          <p className="text-sm text-gray-400 mt-2">
            أدخل رابط تضمين (embed) من خرائط جوجل لعرض الموقع بشكل صحيح.
          </p>
        </div>

        {/* أرقام الهواتف */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">أرقام الهواتف</h3>
          {phones.map((phone, index) => (
            <div key={index} className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <input
                type="text"
                value={phone}
                onChange={(e) => handlePhoneChange(index, e.target.value)}
                placeholder="أدخل رقم الهاتف (مثال: +966123456789)"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {phones.length > 1 && (
                <button
                  onClick={() => removePhone(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addPhone}
            className="flex items-center gap-2 text-amber-500 hover:text-amber-600 text-sm"
          >
            <Plus className="w-5 h-5" />
            إضافة رقم هاتف آخر
          </button>
        </div>

        {/* الإيميلات */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">البريد الإلكتروني</h3>
          {emails.map((email, index) => (
            <div key={index} className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                placeholder="أدخل البريد الإلكتروني (مثال: example@domain.com)"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {emails.length > 1 && (
                <button
                  onClick={() => removeEmail(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addEmail}
            className="flex items-center gap-2 text-amber-500 hover:text-amber-600 text-sm"
          >
            <Plus className="w-5 h-5" />
            إضافة إيميل آخر
          </button>
        </div>

        {/* زر الحفظ */}
        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 ${
            isSaving ? 'bg-gray-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              جارٍ الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ التغييرات
            </>
          )}
        </motion.button>

        {/* رسائل الحالة */}
        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-green-500 text-center text-sm"
          >
            تم حفظ التغييرات بنجاح!
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-500 text-center text-sm"
          >
            حدث خطأ أثناء الحفظ. حاول مرة أخرى.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
