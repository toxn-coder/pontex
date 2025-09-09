'use client';

import { Facebook, Copy, Check, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// أيقونة X (بدل تويتر)
const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <path d="M18.244 2H21l-6.6 7.569L22 22h-6.955l-5.276-7.503L4.8 22H2l7.092-8.127L2 2h7.045l4.737 6.768L18.244 2Zm-2.4 18h2.131L8.3 4h-2.3l9.844 16Z" />
  </svg>
);

interface ShareButtonProps {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('فشل النسخ:', err);
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  return (
    <Sheet>
      {/* زر المشاركة */}
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-all">
          <Share2 className="w-4 h-4" />
          <span>مشاركة</span>
        </button>
      </SheetTrigger>

      {/* المحتوى (Bottom Sheet) */}
      <SheetContent side="bottom" className="rounded-t-2xl p-6">
        <SheetHeader>
          <SheetTitle className="text-center text-lg">مشاركة المنتج</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {/* نسخ الرابط */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg transition-all"
          >
            {copied ? <Check className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6" />}
            <span className="mt-2 text-sm">{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>

          {/* فيسبوك */}
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-all"
          >
            <Facebook className="w-6 h-6" />
            <span className="mt-2 text-sm">فيسبوك</span>
          </a>

          {/* X */}
          <a
            href={shareLinks.x}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-lg transition-all"
          >
            <XIcon className="w-6 h-6" />
            <span className="mt-2 text-sm">X</span>
          </a>

          {/* واتساب */}
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="mt-2 text-sm">واتساب</span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
