import HeroSection from "@/components/HeroSection";
import Menu from "@/components/Menu";
import { loadInfoApp } from "@/components/infoApp";

export default function Home() { 
  const infoApp =  loadInfoApp();

  return (
 
    <div >
      <HeroSection ecoName={infoApp.name} />
      <Menu/>
    </div>
  );
}
