// src/app/api/clear-token/route.js

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  // حذف الكوكي بنفس الإعدادات المستخدمة عند إنشائه
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 0, // حذف فوري
    expires: new Date(0), // تاريخ منتهي الصلاحية في الماضي
  });

  return response;
}