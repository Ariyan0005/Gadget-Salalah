import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "ar" | "hi" | "bn";

export const LANGUAGES: { code: Lang; label: string; nativeLabel: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English",  nativeLabel: "English", dir: "ltr" },
  { code: "ar", label: "Arabic",   nativeLabel: "عربي",    dir: "rtl" },
  { code: "hi", label: "Hindi",    nativeLabel: "हिन्दी",   dir: "ltr" },
  { code: "bn", label: "Bangla",   nativeLabel: "বাংলা",   dir: "ltr" },
];

type T = Record<string, string>;
const translations: Record<Lang, T> = {
  en: {
    home: "Home", products: "Products", mobileService: "Mobile Service",
    spareParts: "Spare Parts", trackOrder: "Track Order",
    search: "Search gadgets...", signIn: "Sign In", signOut: "Sign Out",
    createAccount: "Create Account", myAccount: "My Account",
    myOrders: "My Orders", settings: "Settings", contactUs: "Contact Us",
    adminDashboard: "Admin Dashboard", account: "Account",
    shop: "Shop", service: "Service", orders: "Orders",
    cart: "Cart", addToCart: "Add to Cart", checkout: "Checkout",
    categories: "Categories", navigation: "Navigation",
    clearFilters: "Clear Filters", priceRange: "Price Range (OMR)",
    allCategories: "All Categories", filters: "Filters",
  },
  ar: {
    home: "الرئيسية", products: "المنتجات", mobileService: "خدمة الجوال",
    spareParts: "قطع الغيار", trackOrder: "تتبع الطلب",
    search: "ابحث عن الأجهزة...", signIn: "تسجيل الدخول", signOut: "تسجيل الخروج",
    createAccount: "إنشاء حساب", myAccount: "حسابي",
    myOrders: "طلباتي", settings: "الإعدادات", contactUs: "اتصل بنا",
    adminDashboard: "لوحة الإدارة", account: "الحساب",
    shop: "المتجر", service: "الخدمة", orders: "الطلبات",
    cart: "السلة", addToCart: "أضف للسلة", checkout: "الدفع",
    categories: "الفئات", navigation: "التنقل",
    clearFilters: "مسح الفلاتر", priceRange: "نطاق السعر (OMR)",
    allCategories: "جميع الفئات", filters: "الفلاتر",
  },
  hi: {
    home: "होम", products: "उत्पाद", mobileService: "मोबाइल सेवा",
    spareParts: "स्पेयर पार्ट्स", trackOrder: "ऑर्डर ट्रैक करें",
    search: "गैजेट खोजें...", signIn: "साइन इन", signOut: "साइन आउट",
    createAccount: "खाता बनाएं", myAccount: "मेरा खाता",
    myOrders: "मेरे ऑर्डर", settings: "सेटिंग्स", contactUs: "संपर्क करें",
    adminDashboard: "एडमिन डैशबोर्ड", account: "खाता",
    shop: "शॉप", service: "सेवा", orders: "ऑर्डर",
    cart: "कार्ट", addToCart: "कार्ट में जोड़ें", checkout: "चेकआउट",
    categories: "श्रेणियाँ", navigation: "नेविगेशन",
    clearFilters: "फ़िल्टर साफ़ करें", priceRange: "मूल्य सीमा (OMR)",
    allCategories: "सभी श्रेणियाँ", filters: "फ़िल्टर",
  },
  bn: {
    home: "হোম", products: "পণ্য", mobileService: "মোবাইল সার্ভিস",
    spareParts: "স্পেয়ার পার্টস", trackOrder: "অর্ডার ট্র্যাক করুন",
    search: "গ্যাজেট খুঁজুন...", signIn: "সাইন ইন", signOut: "সাইন আউট",
    createAccount: "অ্যাকাউন্ট খুলুন", myAccount: "আমার অ্যাকাউন্ট",
    myOrders: "আমার অর্ডার", settings: "সেটিংস", contactUs: "যোগাযোগ করুন",
    adminDashboard: "অ্যাডমিন ড্যাশবোর্ড", account: "অ্যাকাউন্ট",
    shop: "শপ", service: "সার্ভিস", orders: "অর্ডার",
    cart: "কার্ট", addToCart: "কার্টে যোগ করুন", checkout: "চেকআউট",
    categories: "ক্যাটাগরি", navigation: "নেভিগেশন",
    clearFilters: "ফিল্টার মুছুন", priceRange: "মূল্য পরিসীমা (OMR)",
    allCategories: "সব ক্যাটাগরি", filters: "ফিল্টার",
  },
};

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LangCtx>({
  lang: "en", setLang: () => {}, t: (k) => k, dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("gs_lang") as Lang) || "en";
  });

  const setLang = (l: Lang) => {
    localStorage.setItem("gs_lang", l);
    setLangState(l);
  };

  const dir = LANGUAGES.find(x => x.code === lang)?.dir ?? "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const t = (key: string) => translations[lang][key] ?? translations["en"][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
