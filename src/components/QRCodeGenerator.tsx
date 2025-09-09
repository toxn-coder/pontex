'use client';

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value?: string; // النص أو الرابط لرمز QR (اختياري للتعامل مع undefined)
  logoSrc?: string; // مسار الشعار (اختياري)
  size?: number; // حجم رمز QR بالبكسل (افتراضي: 200)
  bgColor?: string; // لون الخلفية (افتراضي: أبيض)
  fgColor?: string; // لون النمط (افتراضي: أسود)
}

export default function QRCodeGenerator({
  value,
  size = 200,
  bgColor = '#ffffff',
  fgColor = '#000000',
}: QRCodeGeneratorProps) {
  const [error, setError] = useState<string | null>(null);

  // التحقق من أن القيمة موجودة وليست فارغة
  if (!value || typeof value !== 'string' || !value.trim()) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-600 rounded-lg">
        يرجى إدخال نص أو رابط صالح لإنشاء رمز QR
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-[var(--clr-primary)] rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl max-w-xs mx-auto">
      {/* حاوية رمز QR */}
      <div className="relative bg-white p-4 rounded-xl border border-gray-200">
        <QRCodeCanvas
          value={value}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="H" // مستوى تصحيح الخطأ العالي لضمان القراءة
          includeMargin={true}
        />
      </div>

      {/* نص القيمة أسفل رمز QR */}
      <p className="mt-4 text-white text-sm text-center break-all">{value}</p>

      {/* زر تنزيل رمز QR */}
      <button
        onClick={() => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'qrcode.png';
            link.click();
          } else {
            setError('فشل في تنزيل رمز QR. حاول مرة أخرى.');
          }
        }}
        className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 flex items-center gap-2"
      >
        تنزيل رمز QR
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          ></path>
        </svg>
      </button>

      {/* رسالة الخطأ إن وجدت */}
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </div>
  );
}