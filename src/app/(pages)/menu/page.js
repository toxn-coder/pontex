import Head from "next/head";
import Menu from "@/components/Menu";

const ContactUsPage = () => {
  return (
    <>
      <Head>
        <title>اتصل بنا - اسم الموقع</title>
        <meta name="description" content="تواصل معنا عبر الهاتف أو زورنا في موقعنا. نحن هنا لخدمتك." />
        <meta name="keywords" content="اتصل بنا, خدمة العملاء, تواصل معنا" />
        <meta property="og:title" content="اتصل بنا - اسم الموقع" />
        <meta property="og:description" content="تواصل معنا عبر الهاتف أو زورنا في موقعنا." />
        <meta property="og:image" content="رابط-الصورة-إذا-كانت-متوفرة" />
        <meta property="og:url" content="رابط-الصفحة" />
        <meta name="robots" content="index, follow" />
      </Head>
      <Menu />
    </>
  );
};

export default ContactUsPage;
