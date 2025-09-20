import Menu from "../../../components/Menu";
import Head from "next/head";

const MenuPage = () => {
  return (
    <>
      <Head>
        <title>منتجات بون تكس | pon-tex</title>
        <meta
          name="description"
          content="رواد في صناعة الأقمشة القطنية تصنيع محلي و مستورد بون تكس"
        />
        <meta
          name="keywords"
          content="منتجات بون تكس رواد في صناعة الأقمشة القطنية تصنيع محلي و مستورد"
        />
        <meta property="og:title" content="منتجات بون تكس للأقمشة" />
        <meta
          property="og:description"
          content="رواد في صناعة الأقمشة القطنية تصنيع محلي و مستورد بون تكس"
        />
        <meta property="og:image" content="/logo.png" /> 
        <meta property="og:url" content="https://waly-damascus.vercel.app/menu" /> 
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charset="UTF-8" />
      </Head>
      <Menu />
    </>
  );
};

export default MenuPage;