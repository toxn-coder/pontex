import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // إلغاء التخزين المؤقت للصفحة الرئيسية (أو أي صفحة تستخدم infoApp)
    await res.revalidate('/');
    return res.status(200).json({ message: 'Cache invalidated successfully' });
  } catch (error) {
    console.error('خطأ في إلغاء التخزين المؤقت:', error);
    return res.status(500).json({ message: 'Failed to invalidate cache' });
  }
}