import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // إلغاء التخزين المؤقت للصفحة الرئيسية (أو أي صفحة تستخدم infoApp)
    revalidatePath('/')
    return NextResponse.json({ message: 'Cache invalidated successfully' }, { status: 200 })
  } catch (error) {
    console.error('خطأ في إلغاء التخزين المؤقت:', error)
    return NextResponse.json({ message: 'Failed to invalidate cache' }, { status: 500 })
  }
}

export function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
}
