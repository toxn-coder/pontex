import { db } from "@/app/api/firebase";
import { InfoAppType } from "@/types/infoAppType";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

// استيراد ديناميكي لـ firebase-admin
const getAdminDb = async () => {
  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("@/app/api/firebase-admin");
      return adminDb;
    } catch (error) {
      console.error("فشل في استيراد firebase-admin:", error);
      return null;
    }
  }
  return null;
};

const COLLECTION_NAME = "infoApp";
const DOC_NAME = "main";

let infoApp: InfoAppType | null = null;

const getLocalStorageData = (): InfoAppType | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("infoApp");
    return stored ? (JSON.parse(stored) as InfoAppType) : null;
  } catch (error) {
    console.error("فشل في قراءة localStorage:", error);
    return null;
  }
};

const saveToLocalStorage = (data: InfoAppType) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("infoApp", JSON.stringify(data));
    } catch (error) {
      console.error("فشل في حفظ البيانات إلى localStorage:", error);
    }
  }
};

// جلب البيانات على الخادم
export const fetchDataServer = async (): Promise<InfoAppType | null> => {
  try {
    const adminDb = await getAdminDb();
    if (!adminDb) {
      console.warn("Firebase Admin غير متوفر");
      return null;
    }
    const docRef = adminDb.collection(COLLECTION_NAME).doc(DOC_NAME);
    const docSnap = await docRef.get();

    if (docSnap.exists()) {
      const data = docSnap.data() as InfoAppType;
      return data;
    } else {
      console.warn("الوثيقة غير موجودة في Firestore (الخادم)");
      return null;
    }
  } catch (error) {
    console.error("خطأ في جلب البيانات من Firestore (الخادم):", error);
    return null;
  }
};

// جلب البيانات على العميل
const fetchDataClient = async (): Promise<InfoAppType | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_NAME);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as InfoAppType;
      infoApp = data;
      saveToLocalStorage(data);
      return data;
    } else {
      console.warn("الوثيقة غير موجودة في Firestore (العميل)");
      return null;
    }
  } catch (error) {
    console.error("خطأ في جلب البيانات من Firestore (العميل):", error);
    return null;
  }
};

// الاستماع إلى التغييرات
const listenForChanges = (): void => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_NAME);
    onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const newData = docSnap.data() as InfoAppType;
          infoApp = newData;
          saveToLocalStorage(newData);
        } else {
          console.warn("الوثيقة غير موجودة عند الاستماع للتغييرات");
        }
      },
      (error) => {
        console.error("خطأ في الاستماع إلى التغييرات:", error);
      }
    );
  } catch (error) {
    console.error("خطأ في إعداد الاستماع للتغييرات:", error);
  }
};

// تهيئة البيانات على العميل
export const initInfoApp = async (
  initialData?: InfoAppType
): Promise<InfoAppType | null> => {
  try {
    if (initialData) {
      infoApp = initialData;
      saveToLocalStorage(initialData);
      listenForChanges();
      return initialData;
    }

    const localData = getLocalStorageData();
    if (localData) {
      infoApp = localData;
      listenForChanges();
      return localData;
    }

    const data = await fetchDataClient();

    if (data) {
      listenForChanges();
    }
    return data;
  } catch (error) {
    console.error("خطأ في تهيئة infoApp:", error);
    return null;
  }
};

// تحديث البيانات في Firestore
export const updateInfoApp = async (newData: InfoAppType): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_NAME);
    await setDoc(docRef, newData, { merge: true });
    infoApp = newData;
    saveToLocalStorage(newData);
    // إلغاء التخزين المؤقت على الخادم
    await fetch("/api/revalidate-infoapp", { method: "POST" });

    return true;
  } catch (error) {
    return false;
  }
};
