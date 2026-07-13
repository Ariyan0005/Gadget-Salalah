import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { FaWhatsapp } from "react-icons/fa";
import { Phone, Package, Smartphone, Battery, Zap, Camera, Speaker, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PARTS_CATEGORIES = [
  { icon: Smartphone, title: "Screens & Displays", desc: "LCD and OLED screens for iPhone, Samsung, Huawei, OPPO, Xiaomi, Vivo and more.", brands: ["iPhone", "Samsung", "Huawei", "OPPO"] },
  { icon: Battery, title: "Batteries", desc: "Genuine replacement batteries for all major smartphone brands. Restore your phone's battery life.", brands: ["iPhone", "Samsung", "Huawei", "Xiaomi"] },
  { icon: Zap, title: "Charging Ports & Flex", desc: "USB-C, Lightning and Micro-USB charging port assemblies and flex cables.", brands: ["iPhone", "Samsung", "OPPO", "Vivo"] },
  { icon: Camera, title: "Camera Modules", desc: "Front and rear camera replacements for popular smartphone models.", brands: ["iPhone", "Samsung", "Huawei"] },
  { icon: Speaker, title: "Speakers & Earpiece", desc: "Loud speakers, earpiece speakers, and microphone modules.", brands: ["iPhone", "Samsung", "OPPO"] },
  { icon: Cpu, title: "Back Covers & Frames", desc: "Replacement back covers, mid-frames, and housing for various models.", brands: ["iPhone", "Samsung", "Xiaomi", "OPPO"] },
];

const PHONES = [
  { display: "+968 7214 2828", wa: "96872142828", tel: "+96872142828" },
  { display: "+968 9316 2391", wa: "96893162391", tel: "+96893162391" },
];

export default function SpareParts() {
  useEffect(() => {
    document.title = "Buy Mobile Spare Parts in Oman — Salalah | Gadget Salalah";
    return () => { document.title = "Gadget Salalah — Dhofar's #1 Tech Store"; };
  }, []);

  return (
    <AppLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a2332] to-[#243347] text-white py-14 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 text-sm font-semibold px-3 py-1">
            📍 Central Salalah, Dhofar — Oman
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Buy Mobile Spare Parts<br className="hidden sm:block" /> in Salalah, Oman
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Quality mobile phone spare parts for iPhone, Samsung, Huawei, OPPO, Xiaomi and more.
            Available in Salalah — WhatsApp us to check stock and pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {PHONES.map(({ display, wa }) => (
              <a
                key={wa}
                href={`https://wa.me/${wa}?text=Hi, I'm looking for mobile spare parts`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition-colors text-sm"
              >
                <FaWhatsapp className="h-5 w-5" />
                WhatsApp {display}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="py-8 px-4 bg-accent/5 border-b">
        <div className="container mx-auto max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-4 text-center text-sm">
            {[
              { step: "1", text: "WhatsApp us your phone model & part needed" },
              { step: "2", text: "We confirm availability and send you the price" },
              { step: "3", text: "Pick up at our store or we fit it for you" },
            ].map(({ step, text }) => (
              <div key={step} className="flex flex-col items-center gap-2 px-4">
                <span className="h-9 w-9 rounded-full bg-accent text-white font-extrabold flex items-center justify-center text-base">{step}</span>
                <p className="text-muted-foreground text-xs">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parts Categories */}
      <section className="py-14 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Parts We Stock</h2>
            <p className="text-muted-foreground text-sm">
              WhatsApp us to check availability for your specific model
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PARTS_CATEGORIES.map(({ icon: Icon, title, desc, brands }) => (
              <Card key={title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm leading-snug pt-0.5">{title}</h3>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3">{desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {brands.map(b => (
                      <Badge key={b} variant="secondary" className="text-[10px] px-1.5 py-0">{b}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Need repair too? */}
      <section className="py-8 px-4 bg-muted/40 border-t border-b">
        <div className="container mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-accent shrink-0" />
            <div>
              <p className="font-bold text-sm">Need a repair too?</p>
              <p className="text-muted-foreground text-xs">We also offer professional mobile repair services in Salalah.</p>
            </div>
          </div>
          <Link
            href="/mobile-service"
            className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-accent/90 transition-colors shrink-0"
          >
            View Repair Services →
          </Link>
        </div>
      </section>

      {/* Contact CTA — bottom of page (best for conversion) */}
      <section className="bg-[#1a2332] text-white py-14 px-4" id="contact">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Check Part Availability</h2>
          <p className="text-white/70 text-sm mb-2">
            WhatsApp us your <strong>phone model</strong> and the <strong>part you need</strong> — we'll reply with stock and pricing.
          </p>
          <p className="text-white/50 text-xs mb-8">
            📍 An Nahdah St, Central Salalah · Open Friday – Thursday · 9:00 AM – 11:30 PM
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {PHONES.map(({ display, wa, tel }) => (
              <div key={wa} className="flex items-center justify-center gap-2">
                <a
                  href={`https://wa.me/${wa}?text=Hi, I'm looking for mobile spare parts`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm"
                >
                  <FaWhatsapp className="h-4 w-4" /> {display}
                </a>
                <a
                  href={`tel:${tel}`}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Call"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
