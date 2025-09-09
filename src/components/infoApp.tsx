import { InfoAppType } from '@/types/infoAppType';
import { initInfoApp } from './infoAppClient';

const defaultInfoApp: InfoAppType = {
  name: 'Ecommerce',
  logoUrl: '/logo.png',
  imageHero:
    'https://res.cloudinary.com/do88eynar/image/upload/v1745641598/fhiuaa8jhvbuwszbdmwx.webp',
  ourStory: 'قصتنا الافتراضية', // إضافة قيمة افتراضية
  ourVision: 'رؤيتنا الافتراضية', // إضافة قيمة افتراضية
  aboutImage: '/placeholder-about.png', // إضافة قيمة افتراضية
  slogan: 'تسوق أفضل المنتجات',
  rating: '4.8',
  address: 'القاهرة، مصر - شارع 123',
  openingHours: 'صباحاً 8:00 - 4:00 الفجر',
  card1Title: 'أجود المنتجات',
  card1Desc: 'نقدم لكم أفضل المنتجات بعناية وجودة عالية',
  card1Show: true,
  card2Title: 'سرعة التوصيل',
  card2Desc: 'خدمة توصيل سريعة وآمنة إلى باب منزلك',
  card2Show: true,
  card3Title: 'أفضل الأسعار',
  card3Desc: 'أسعار منافسة تناسب جميع الفئات',
  card3Show: true,
};

let cachedInfoApp: InfoAppType = defaultInfoApp;
let isDataLoaded = false;

export const loadInfoApp = async (initialData?: InfoAppType): Promise<InfoAppType> => {
  if (!isDataLoaded) {
    try {
      if (initialData) {
        cachedInfoApp = { ...defaultInfoApp, ...initialData };
      } else {
        const data = await initInfoApp();
        cachedInfoApp = { ...defaultInfoApp, ...(data ?? {}) };
      }
      isDataLoaded = true;
    } catch (error) {
      console.error('Error loading infoApp:', error); // تسجيل الخطأ
      cachedInfoApp = defaultInfoApp;
    }
  }
  return cachedInfoApp;
};

export const infoApp = {
  get name() {
    return cachedInfoApp.name;
  },
  get logoUrl() {
    return cachedInfoApp.logoUrl;
  },
  get imageHero() {
    return cachedInfoApp.imageHero;
  },
  get ourStory() {
    return cachedInfoApp.ourStory ?? defaultInfoApp.ourStory!;
  },
  get ourVision() {
    return cachedInfoApp.ourVision ?? defaultInfoApp.ourVision!;
  },
  get aboutImage() {
    return cachedInfoApp.aboutImage ?? defaultInfoApp.aboutImage!;
  },
  get slogan() {
    return cachedInfoApp.slogan ?? defaultInfoApp.slogan!;
  },
  get rating() {
    return cachedInfoApp.rating ?? defaultInfoApp.rating!;
  },
  get address() {
    return cachedInfoApp.address ?? defaultInfoApp.address!;
  },
  get openingHours() {
    return cachedInfoApp.openingHours ?? defaultInfoApp.openingHours!;
  },
  get card1Title() {
    return cachedInfoApp.card1Title ?? defaultInfoApp.card1Title!;
  },
  get card1Desc() {
    return cachedInfoApp.card1Desc ?? defaultInfoApp.card1Desc!;
  },
  get card1Show() {
    return cachedInfoApp.card1Show ?? true;
  },
  get card2Title() {
    return cachedInfoApp.card2Title ?? defaultInfoApp.card2Title!;
  },
  get card2Desc() {
    return cachedInfoApp.card2Desc ?? defaultInfoApp.card2Desc!;
  },
  get card2Show() {
    return cachedInfoApp.card2Show ?? true;
  },
  get card3Title() {
    return cachedInfoApp.card3Title ?? defaultInfoApp.card3Title!;
  },
  get card3Desc() {
    return cachedInfoApp.card3Desc ?? defaultInfoApp.card3Desc!;
  },
  get card3Show() {
    return cachedInfoApp.card3Show ?? true;
  },
};

export const refreshInfoApp = async () => {
  try {
    const data = await initInfoApp();
    cachedInfoApp = { ...defaultInfoApp, ...(data ?? {}) };
    isDataLoaded = true;
  } catch (error) {
    console.error('Error refreshing infoApp:', error);
    cachedInfoApp = defaultInfoApp;
  }
  return cachedInfoApp;
};

export const setInitialInfoApp = (initialData: InfoAppType) => {
  cachedInfoApp = { ...defaultInfoApp, ...initialData };
  isDataLoaded = true;
};