// src/types/infoAppType.ts
export interface InfoAppType {
  name: string;
  logoUrl: string;
  imageHero: string;
  ourStory: string;
  ourVision: string;
  aboutImage: string;
    
  slogan?: string;           
  rating?: string | number;  
  address?: string;          
  openingHours?: string;   

  
  card1Title?: string;
  card1Desc?: string;
  card1Show?: boolean;

  card2Title?: string;
  card2Desc?: string;
  card2Show?: boolean;

  card3Title?: string;
  card3Desc?: string;
  card3Show?: boolean;
}
