import { Link } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const { data: categories } = useListCategories();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight text-white">Gadget<span className="text-accent">Salalah</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Oman's trusted destination for genuine smartphones, accessories, and premium electronics — delivered fast across the Sultanate.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span>Salalah, Dhofar<br/>Sultanate of Oman</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <a href="tel:+96872142828" className="hover:text-white transition-colors">+968 7214 2828</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <a href="tel:+96893162391" className="hover:text-white transition-colors">+968 9316 2391</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <a href="mailto:gadgetsalalah247@gmail.com" className="hover:text-white transition-colors">gadgetsalalah247@gmail.com</a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Categories</h4>
            <ul className="space-y-2 text-sm">
              {categories?.slice(0, 5).map((cat: { id: number; name: string }) => (
                <li key={cat.id}>
                  <Link href={`/products?categoryId=${cat.id}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li><Link href="/categories" className="text-accent hover:text-white transition-colors">View All &rarr;</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 pb-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Gadget Salalah. All rights reserved.
            </p>
            <div className="flex gap-2">
              <div className="h-8 w-14 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">VISA</div>
              <div className="h-8 w-14 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">MC</div>
              <div className="h-8 w-14 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">مدى</div>
              <div className="h-8 w-16 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">Apple Pay</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
