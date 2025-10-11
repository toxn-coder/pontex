import { FC, memo } from "react";

interface CardHeroProps {
  title?: string;
  description?: string;
  index: number;
}

const CardHero: FC<CardHeroProps> = ({ title, description,index }) => {

  if (index === 1) {
    return (
    <div className="border-white border-x px-2 ">
      <h3 className="font-bold text-3xl mb-2 text-center font-Bukra">{title ?? ""}</h3>
      <p className="text-amber-100 text-2xl text-right font-['Cairo']">{description ?? ""}</p>
    </div>
  );
  } 
  return (
    <div className="">
      <h3 className="font-bold text-3xl mb-2 text-center font-Bukra">{title ?? ""}</h3>
      <p className="text-amber-100 text-2xl text-right font-['Cairo']">{description ?? ""}</p>
    </div>
  );
};

export default memo(CardHero);