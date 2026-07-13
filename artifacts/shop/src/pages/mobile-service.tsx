import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { FaWhatsapp } from "react-icons/fa";
import {
  Smartphone, Battery, Zap, Droplets, Wrench,
  CheckCircle, Clock, ShieldCheck, Phone, Package
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SERVICES = [
  { icon: Smartphone, title: "Screen Replacement", desc: "Cracked or broken display? We replace screens for all major brands — iPhone, Samsung, Huawei, OPPO and more.", tag: "Most Popular" },
  { icon: Battery, title: "Battery Replacement", desc: "Battery draining fast or not charging properly? Get a genuine replacement battery with same-day service.", tag: "" },
  { icon: Zap, title: "Charging Port Repair", desc: "Phone not charging? We fix or replace charging ports for all smartphone models quickly.", tag: "" },
  { icon: Droplets, title: "Water Damage Repair", desc: "Dropped your phone in water? Bring it in immediately — our technicians specialise in water damage recovery.", tag: "" },
  { icon: Wrench, title: "Software & Unlock", desc: "Stuck on boot, software crash, or phone locked? We handle software issues and device unlocking.", tag: "" },
  { icon: Package, title: "Spare Parts Supply", desc: "Need a part for DIY repair? We supply genuine mobile spare parts in Salalah.", tag: "", link: "/spare-parts" },
];

const WHY = [
  { icon: ShieldCheck, title: "Genuine Parts", desc: "We only use authentic, quality-tested parts." },
  { icon: Clock, title: "Same Day Service", desc: "Most repairs completed within a few hours." },
  { icon: CheckCircle, title: "Warranty on Repairs", desc: "All repairs come with a service warranty." },
];

const PHONES = [
  { display: "+968 7214 2828", wa: "96872142828", tel: "+96872142828" },
  { display: "+968 9316 2391", wa: "96893162391", tel: "+96893162391" },
];

export default function MobileService() {
  useEffect(() => {
    document.title = "Mobile Phone Repair Service in Salalah, Oman | Gadget Salalah";
    return () => { document.title = "Gadget Salalah — Dhofar's #1 Tech Store"; };
  }, []);

  return (
    <AppLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a2332] to-[#243347] text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 text-sm font-semibold px-3 py-1">
            📍 Salalah, Dhofar — Sultanate of Oman
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Mobile Phone Repair Service<br className="hidden sm:block" /> in Salalah, Oman
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Professional smartphone repair for all brands — iPhone, Samsung, Huawei, OPPO, Xiaomi and more.
            Fast, reliable, and affordable repair service at Central Salalah.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {PHONES.map(({ display, wa }) => (
              <a
                key={wa}
                href={`https://wa.me/${wa}?text=Hi, I need mobile repair service`}
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

      {/* Why choose us */}
      <section className="py-10 px-4 bg-accent/5 border-b">
        <div className="container mx-auto max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {WHY.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2">
                <div className="bg-accent/10 p-3 rounded-full text-accent mb-1">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-sm">{title}</h3>
                <p className="text-muted-foreground text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-14 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Our Repair Services</h2>
            <p className="text-muted-foreground text-sm">All major brands · Genuine parts · Fast turnaround</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(({ icon: Icon, title, desc, tag, link }) => (
              <Card key={title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{title}</h3>
                        {tag && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3">{desc}</p>
                  {link && (
                    <Link href={link} className="text-accent text-xs font-semibold hover:underline">
                      Browse spare parts →
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section className="bg-[#1a2332] text-white py-14 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Book Your Repair Today</h2>
          <p className="text-white/70 text-sm mb-8">
            Visit us at <strong>An Nahdah St, Central Salalah</strong> or WhatsApp us to get a quick quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            {PHONES.map(({ display, wa, tel }) => (
              <div key={wa} className="flex items-center justify-center gap-2">
                <a
                  href={`https://wa.me/${wa}?text=Hi, I need mobile repair service`}
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
          <p className="text-white/50 text-xs">Open Friday – Thursday · 9:00 AM – 11:30 PM</p>
        </div>
      </section>
    </AppLayout>
  );
}
