// src/lib/infoApp.ts
import { InfoAppType } from '@/types/infoAppType';
import { initInfoApp } from './infoAppClient';

const defaultInfoApp: InfoAppType = {
  name: 'Ecommerce',
  logoUrl: '/logo.png',
  imageHero: 'https://res.cloudinary.com/do88eynar/image/upload/v1745641598/fhiuaa8jhvbuwszbdmwx.webp',
  ourStory: '',
  ourVision: '',
  aboutImage:'',

};

let cachedInfoApp: InfoAppType = defaultInfoApp;
let isDataLoaded = false;

export const loadInfoApp = async (initialData?: InfoAppType): Promise<InfoAppType> => {
  if (!isDataLoaded) {
    try {
      if (initialData) {
        cachedInfoApp = initialData;
      } else {
        const data = await initInfoApp();
        cachedInfoApp = data ?? defaultInfoApp;
      }
      isDataLoaded = true;
    } catch {
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
};

export const refreshInfoApp = async () => {
  isDataLoaded = false;
  cachedInfoApp = defaultInfoApp;
  return loadInfoApp();
};

export const setInitialInfoApp = (initialData: InfoAppType) => {
  cachedInfoApp = initialData;
  isDataLoaded = true;
};
