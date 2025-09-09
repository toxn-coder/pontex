'use client';

import { Facebook, Twitter, Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  url: string; // رابط المنتج
  title: string; // عنوان المنتج
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
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  return (
    <div className="flex items-center gap-3 mt-6">
      {/* نسخ الرابط */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-all"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
      </button>

      {/* فيسبوك */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
      >
        <Facebook className="w-4 h-4" />
        <span>فيسبوك</span>
      </a>

      {/* تويتر */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-all"
      >
        <Twitter className="w-4 h-4" />
        <span>تويتر</span>
      </a>

      {/* واتساب */}
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all"
      >
        <MessageCircle className="w-4 h-4" />
        <span>واتساب</span>
      </a>
    </div>
  );
}
