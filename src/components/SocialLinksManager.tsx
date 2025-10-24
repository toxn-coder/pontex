'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/api/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Instagram, Twitter, Facebook, Send, Mail, Phone, Plus, Save, Trash2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';

export default function SocialLinksManager() {
  const [socialLinks, setSocialLinks] = useState({
    whatsapp: '',
    instagram: '',
    twitter: '',
    facebook: '',
    googleMapsLink: '',
    address: '',
  });
  const [phones, setPhones] = useState([{ value: '', description: '' }]);
  const [emails, setEmails] = useState([{ value: '', description: '' }]);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // جلب البيانات من Firestore مع ضمان وجود حقل description
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'settings', 'contactInfo');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // تعيين روابط التواصل الاجتماعي
          setSocialLinks({
            whatsapp: data.whatsapp || '',
            instagram: data.instagram || '',
            twitter: data.twitter || '',
            facebook: data.facebook || '',
            googleMapsLink: data.googleMapsLink || '',
            address: data.address || '',
          });
          // التأكد من أن كل phone وemail يحتوي على value وdescription
          const normalizedPhones = (data.phones && Array.isArray(data.phones) && data.phones.length > 0
            ? data.phones
            : [{ value: '', description: '' }]).map((phone: any) => ({
              value: phone.value || '',
              description: phone.description ?? '',
            }));
          const normalizedEmails = (data.emails && Array.isArray(data.emails) && data.emails.length > 0
            ? data.emails
            : [{ value: '', description: '' }]).map((email: any) => ({
              value: email.value || '',
              description: email.description ?? '',
            }));
          setPhones(normalizedPhones);
          setEmails(normalizedEmails);
        } else {
          // إذا لم يكن المستند موجودًا، يتم الإبقاء على القيم الافتراضية
          toast.info('لم يتم العثور على بيانات في Firestore، يتم استخدام القيم الافتراضية.');
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
        toast.error('فشل جلب معلومات التواصل. تحقق من الاتصال بـ Firestore.');
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
  const handlePhoneChange = (index: number, field: 'value' | 'description', inputValue: string) => {
    const newPhones = [...phones];
    newPhones[index] = { ...newPhones[index], [field]: inputValue };
    setPhones(newPhones);
  };

  // إضافة رقم هاتف جديد
  const addPhone = () => {
    setPhones([...phones, { value: '', description: '' }]);
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
  const handleEmailChange = (index: number, field: 'value' | 'description', inputValue: string) => {
    const newEmails = [...emails];
    newEmails[index] = { ...newEmails[index], [field]: inputValue };
    setEmails(newEmails);
  };

  // إضافة إيميل جديد
  const addEmail = () => {
    setEmails([...emails, { value: '', description: '' }]);
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
      const validPhones = phones.filter((phone) => phone.value.trim() !== '');
      if (validPhones.length === 0) {
        throw new Error('يجب إدخال رقم هاتف واحد على الأقل.');
      }
      for (const phone of validPhones) {
        if (!isValidPhone(phone.value)) {
          throw new Error(`رقم الهاتف "${phone.value}" غير صالح.`);
        }
      }
      const validEmails = emails.filter((email) => email.value.trim() !== '');
      if (validEmails.length === 0) {
        throw new Error('يجب إدخال بريد إلكتروني واحد على الأقل.');
      }
      for (const email of validEmails) {
        if (!isValidEmail(email.value)) {
          throw new Error(`البريد الإلكتروني "${email.value}" غير صالح.`);
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
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.8217 5.1344C16.0886 4.29394 15.6479 3.19805 15.6479 2H14.7293M16.8217 5.1344C17.4898 5.90063 18.3944 6.45788 19.4245 6.67608C19.7446 6.74574 20.0786 6.78293 20.4266 6.78293V10.2191C18.645 10.2191 16.9932 9.64801 15.6477 8.68211V15.6707C15.6477 19.1627 12.8082 22 9.32386 22C7.50043 22 5.85334 21.2198 4.69806 19.98C3.64486 18.847 2.99994 17.3331 2.99994 15.6707C2.99994 12.2298 5.75592 9.42509 9.17073 9.35079M16.8217 5.1344C16.8039 5.12276 16.7861 5.11101 16.7684 5.09914M6.9855 17.3517C6.64217 16.8781 6.43802 16.2977 6.43802 15.6661C6.43802 14.0734 7.73249 12.7778 9.32394 12.7778C9.62087 12.7778 9.9085 12.8288 10.1776 12.9124V9.40192C9.89921 9.36473 9.61622 9.34149 9.32394 9.34149C9.27287 9.34149 8.86177 9.36884 8.81073 9.36884M14.7244 2H12.2097L12.2051 15.7775C12.1494 17.3192 10.8781 18.5591 9.32386 18.5591C8.35878 18.5591 7.50971 18.0808 6.98079 17.3564"
                  stroke="#FE9A00"
                  strokeLinejoin="round"
                />
              </svg>
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
                value={phone.description ?? ''}
                onChange={(e) => handlePhoneChange(index, 'description', e.target.value)}
                placeholder="الوصف (مثال: مبيعات)"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                value={phone.value ?? ''}
                onChange={(e) => handlePhoneChange(index, 'value', e.target.value)}
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
                type="text"
                value={email.description ?? ''}
                onChange={(e) => handleEmailChange(index, 'description', e.target.value)}
                placeholder="الوصف (مثال: دعم فني)"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="email"
                value={email.value ?? ''}
                onChange={(e) => handleEmailChange(index, 'value', e.target.value)}
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