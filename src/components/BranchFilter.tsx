'use client';

import Image from 'next/image';
import { MapPin, Phone, Clock, Map } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  image: string;
}

export default function BranchFilter({ branches }: { branches: Branch[] }) {
  return (
    <div className="flex flex-col gap-6 items-center">
      <div
        className={`grid gap-6 justify-items-center w-full ${
          branches.length === 1
            ? 'grid-cols-1 max-w-4xl' // لو فرع واحد ياخذ تقريبا عرض الشاشة
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {branches.map((branch, index) => (
          <div
            key={branch.id}
            className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 w-full max-w-md hover:shadow-2xl transition-shadow duration-300"
            role="region"
            aria-label={`فرع ${branch.name}`}
          >
            <div className="relative w-full h-48 overflow-hidden rounded-lg">
              <Image
                src={branch.image}
                alt={`صورة فرع ${branch.name} في ${branch.address}`}
                fill
                className="object-cover object-top rounded-lg transition-transform duration-300 hover:scale-105"
                priority={index === 0}
                loading={index === 0 ? undefined : 'lazy'}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-right">{branch.name}</h2>
            <div className="flex items-center gap-2 flex-row-reverse">
              <MapPin className="w-5 h-5 text-yellow-600" aria-hidden="true" />
              <p className="text-gray-600 text-right">{branch.address}</p>
            </div>
            <div className="flex items-center gap-2 flex-row-reverse">
              <Phone className="w-5 h-5 text-yellow-600" aria-hidden="true" />
              {branch.phone === 'رقم غير متوفر' ? (
                <p className="text-gray-600 text-right">{branch.phone}</p>
              ) : (
                <a
                  href={`tel:${branch.phone}`}
                  className="text-yellow-600 hover:underline text-right"
                  aria-label={`اتصل بفرع ${branch.name} على ${branch.phone}`}
                >
                  {branch.phone}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 flex-row-reverse">
              <Clock className="w-5 h-5 text-yellow-600" aria-hidden="true" />
              <p className="text-gray-600 text-right">{branch.workingHours}</p>
            </div>
            {branch.address !== 'عنوان غير محدد' && (
              <div className="flex items-center gap-2 flex-row-reverse">
                <Map className="w-5 h-5 text-yellow-600" aria-hidden="true" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    branch.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:underline text-right"
                  aria-label={`عرض موقع فرع ${branch.name} على خرائط جوجل`}
                >
                  عرض على الخريطة
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
