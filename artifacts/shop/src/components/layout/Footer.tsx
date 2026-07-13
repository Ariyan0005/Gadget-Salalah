import { Link } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export function Footer() {
  const { data: categories } = useListCategories();
  const { user } = useAuth();

  return (
    <footer className="bg-[#1a2332] text-slate-300">
      <div className="container mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-tight text-white">
                Gadget<span className="text-accent">Salalah</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Oman's trusted destination for genuine smartphones, accessories, and premium electronics — delivered fast across the Sultanate.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer"
                className="rounded-full bg-slate-700 p-2 text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://wa.me/96872142828" target="_blank" rel="noreferrer"
                className="rounded-full bg-slate-700 p-2 text-slate-400 hover:bg-green-600 hover:text-white transition-colors">
                <FaWhatsapp className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer"
                className="rounded-full bg-slate-700 p-2 text-slate-400 hover:bg-pink-600 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>An Nahdah St, Central Salalah<br />Sultanate of Oman</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a href="tel:+96872142828" className="hover:text-white transition-colors">+968 7214 2828</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a href="tel:+96893162391" className="hover:text-white transition-colors">+968 9316 2391</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a href="mailto:gadgetsalalah247@gmail.com" className="hover:text-white transition-colors text-xs">
                  gadgetsalalah247@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links — hide Sign In when logged in */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about"    className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact"  className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/track"    className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/mobile-service" className="hover:text-white transition-colors">Mobile Service</Link></li>
              {!user && (
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              )}
              {user && (
                <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
              )}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white">Categories</h4>
            <ul className="space-y-2 text-sm">
              {categories?.slice(0, 5).map((cat: { id: number; name: string }) => (
                <li key={cat.id}>
                  <Link href={`/products?categoryId=${cat.id}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/categories" className="text-accent hover:text-white transition-colors">
                  View All &rarr;
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar — payment methods clearly visible */}
        <div className="mt-10 border-t border-slate-700 pt-6">
          {/* Payment badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            <div className="h-9 w-16 rounded-lg bg-white flex items-center justify-center">
              <span className="text-sm font-black text-blue-700 tracking-tight">VISA</span>
            </div>
            <div className="h-9 w-16 rounded-lg bg-white flex items-center justify-center">
              <span className="text-sm font-black tracking-tight">
                <span className="text-red-500">M</span><span className="text-orange-400">C</span>
              </span>
            </div>
            <div className="h-9 w-16 rounded-lg bg-white flex items-center justify-center">
              <span className="text-sm font-bold text-green-700">مدى</span>
            </div>
            <div className="h-9 w-20 rounded-lg bg-white flex items-center justify-center gap-1">
              <span className="text-sm">🍎</span>
              <span className="text-xs font-bold text-slate-800">Pay</span>
            </div>
            <div className="h-9 w-16 rounded-lg bg-white flex items-center justify-center">
              <span className="text-xs font-bold text-blue-800">OmanNet</span>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Gadget Salalah. All rights reserved. · Salalah, Oman
          </p>
        </div>
      </div>
    </footer>
  );
}
