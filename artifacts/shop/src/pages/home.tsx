import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListBanners,
  useGetFeaturedProducts,
  useGetNewArrivals,
  useGetMostDiscounted,
} from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/product-card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ArrowRight,
  Flame,
  Sparkles,
  ChevronLeft,
  Zap,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { optimizeImageUrl } from "@/lib/image-url";

export default function Home() {
  const { data: banners } = useListBanners();
  const { data: featuredProducts } = useGetFeaturedProducts();
  const { data: newArrivals } = useGetNewArrivals();
  const { data: mostDiscounted } = useGetMostDiscounted();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const activeBanners =
    banners
      ?.filter((b) => b.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

  return (
    <AppLayout>
      {/* ── Hero Slider ────────────────────────────────────────────── */}
      <section className="w-full bg-slate-950 relative group min-h-[280px] sm:min-h-[380px] lg:min-h-[520px]">
        {activeBanners.length > 0 ? (
          <>
            <div className="overflow-hidden w-full" ref={emblaRef}>
            <div className="flex">
              {activeBanners.map((banner, index) => (
                <div key={banner.id} className="relative min-w-full flex-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent z-10" />
                  <img
                    src={optimizeImageUrl(banner.imageUrl, 1200, "fill")}
                    srcSet={`
                      ${optimizeImageUrl(banner.imageUrl, 480, "fill")} 480w,
                      ${optimizeImageUrl(banner.imageUrl, 768, "fill")} 768w,
                      ${optimizeImageUrl(banner.imageUrl, 1200, "fill")} 1200w,
                      ${optimizeImageUrl(banner.imageUrl, 1920, "fill")} 1920w
                    `}
                    sizes="100vw"
                    alt={banner.title}
                    width={1200}
                    height={520}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                    className="h-[280px] sm:h-[380px] lg:h-[520px] w-full object-cover"
                  />
                  <div className="absolute inset-0 z-20 flex items-center md:px-20 px-6">
                    <div className="text-white max-w-xl">
                      <p className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Zap className="h-3 w-3 fill-accent" /> New Collection
                      </p>
                      <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight drop-shadow-lg">
                        {banner.title}
                      </h2>
                      {banner.subtitle && (
                        <p className="text-base md:text-lg mb-8 opacity-80 leading-relaxed max-w-md">
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.linkUrl && (
                        <Button
                          asChild
                          size="lg"
                          className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 font-bold shadow-xl shadow-accent/30 transition-transform hover:scale-105"
                        >
                          <Link href={banner.linkUrl}>
                            Shop Now <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next arrows */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {activeBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === selectedIndex ? "w-6 bg-accent" : "w-2 bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          </>
        ) : (
          <div className="h-[280px] sm:h-[380px] lg:h-[520px] w-full bg-slate-900/60 animate-pulse" />
        )}
      </section>

      {/* ── Featured Products ──────────────────────────────────────── */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent fill-accent/40" />
              <h2 className="text-xl font-black text-foreground">Featured Products</h2>
            </div>
            <Link
              href="/products?featured=true"
              className="text-sm font-semibold text-accent flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featuredProducts.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals & Hot Deals ───────────────────────────────── */}
      <section className="container mx-auto px-4 py-8 mb-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {newArrivals && newArrivals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                  <h2 className="text-xl font-black text-foreground">New Arrivals</h2>
                </div>
                <Link
                  href="/products?sortBy=newest"
                  className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                >
                  More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {newArrivals.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {mostDiscounted && mostDiscounted.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-accent fill-accent/30" />
                  <h2 className="text-xl font-black text-foreground">Hot Deals</h2>
                </div>
                <Link
                  href="/products?sortBy=discount"
                  className="text-sm font-semibold text-accent flex items-center gap-1 hover:gap-2 transition-all"
                >
                  See All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {mostDiscounted.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom CTA Banner ──────────────────────────────────────── */}
      <section className="mx-4 mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-primary/80 relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 50%, hsl(38 95% 48%) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-10 text-white">
          <div>
            <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">
              Dhofar's #1 Tech Store
            </p>
            <h3 className="text-2xl md:text-3xl font-black leading-tight">
              Find the perfect gadget today
            </h3>
            <p className="text-sm opacity-75 mt-2">Free delivery on orders over 10 OMR</p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 bg-accent hover:bg-accent/90 text-white rounded-full px-10 font-bold shadow-xl shadow-accent/30"
          >
            <Link href="/products">
              Shop All Products <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </AppLayout>
  );
}
