export interface Product {
  id: string;
  name: string;
  price: string;
  width:string;
  height:string;
  weight:string;
  image: string;              
  additionalImages: string[]; 
  description: string;
  rating: number;
}