import Head from "next/head";
import Menu from "@/components/Menu";

const MenuPage = () => {
  return (
    <>
      <Head>
        <title>منيو مطعم اسم مطعمك - قائمة الطعام</title>
        <meta
          name="description"
          content="استمتع بقائمة طعام مطعم اسم مطعمك المليئة بالنكهات الشامية الأصيلة. اكتشف أطباق الشاورما، المقبلات، والوجبات الشهية."
        />
        <meta
          name="keywords"
          content="منيو اسم مطعمك, قائمة طعام, شاورما, مطعم شامي, أكل سوري, وجبات, مقبلات"
        />
        <meta property="og:title" content="منيو مطعم اسم مطعمك - النكهات الشامية الأصيلة" />
        <meta
          property="og:description"
          content="تصفح قائمة طعام اسم مطعمك واستمتع بأشهى الأطباق السورية من الشاورما إلى المقبلات والوجبات العائلية."
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