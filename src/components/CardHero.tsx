import { FC, memo } from "react";

interface CardHeroProps {
  title?: string;
  description?: string;
}

const CardHero: FC<CardHeroProps> = ({ title, description }) => {
  return (
    <div className="m-auto bg-[var(--secondry)] backdrop-blur-sm p-6 rounded-xl shadow-lg w-64 transform hover:-translate-y-1 transition-transform">
      <h3 className="font-bold text-lg mb-2">{title ?? ""}</h3>
      <p className="text-amber-100">{description ?? ""}</p>
    </div>
  );
};

export default memo(CardHero);