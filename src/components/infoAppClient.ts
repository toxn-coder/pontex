// src/utils/infoAppClient.ts
import { db } from "@/app/api/firebase";
import { InfoAppType } from "@/types/infoAppType";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

const COLLECTION_NAME = "infoApp";
const DOC_NAME = "main";

let infoApp: InfoAppType | null = null;

// جلب البيانات
export const fetchDataClient = async (): Promise<InfoAppType | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_NAME);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      infoApp = docSnap.data() as InfoAppType;
      return infoApp;
    }
    return null;
  } catch (err) {
    console.error("خطأ في جلب البيانات:", err);
    return null;
  }
};

// متابعة التغييرات
const listenForChanges = () => {
  const docRef = doc(db, COLLECTION_NAME, DOC_NAME);
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      infoApp = docSnap.data() as InfoAppType;
    }
  });
};

// تهيئة البيانات
export const initInfoApp = async (
  initialData?: InfoAppType
): Promise<InfoAppType | null> => {
  if (initialData) {
    infoApp = initialData;
    listenForChanges();
    return initialData;
  }

  const data = await fetchDataClient();
  if (data) {
    listenForChanges();
  }

  return data;
};
