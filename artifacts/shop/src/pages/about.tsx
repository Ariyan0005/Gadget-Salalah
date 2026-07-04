import { AppLayout } from "@/components/layout/AppLayout";
import { Building2, Award, Users, PhoneCall } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 lg:py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">About Gadget Salalah</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Oman's most trusted tech store — your go-to destination for premium smartphones,
            accessories, and electronics in Salalah and across the Sultanate.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-card border rounded-2xl p-8 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">100% Authentic</h3>
            <p className="text-muted-foreground">Every product we sell is guaranteed authentic with official brand warranty and manufacturer support.</p>
          </div>
          <div className="bg-card border rounded-2xl p-8 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Delivery Across Oman</h3>
            <p className="text-muted-foreground">Fast and secure delivery to Muscat, Salalah, and every governorate in the Sultanate of Oman.</p>
          </div>
          <div className="bg-card border rounded-2xl p-8 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Expert Support</h3>
            <p className="text-muted-foreground">Our dedicated team is always ready to assist you before and after your purchase — in Arabic and English.</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-4">Ready to upgrade your tech?</h2>
            <p className="text-slate-300 text-lg mb-8">
              Browse our latest collection of smartphones, smartwatches, and premium accessories — the best brands, all in one place.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-slate-700 text-black hover:bg-slate-800 hover:text-white">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex h-64 w-64 bg-slate-800 rounded-full items-center justify-center shrink-0">
             <PhoneCall className="h-32 w-32 text-slate-700" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
