import HeroSection from "@/components/HeroSection";
import Menu from "@/components/Menu";
import { loadInfoApp } from "@/components/infoApp";

export default async function Home() { 
  const infoApp = await loadInfoApp(); // ✅ لازم await

  return (
    <div>
      {/* ✅ بدل ecoName بالـ prop الصحيح */}
      <HeroSection restaurantName={infoApp.name} />
      <Menu/>
    </div>
  );
}
