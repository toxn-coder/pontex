import HeroSection from "@/components/HeroSection";
import Menu from "@/components/Menu";
import { loadInfoApp } from "@/components/infoApp";

export default async function Home() { 
  const infoApp = await loadInfoApp();

  return (
    <div>
      
      <HeroSection restaurantName={infoApp.name} />
      <Menu/>
    </div>
  );
}
