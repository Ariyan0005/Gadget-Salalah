import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/product-card";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("categoryId") || "all";
  
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [debouncedPrice, setDebouncedPrice] = useState([0, 200000]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPrice(priceRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  const { data: productsData, isLoading } = useListProducts({
    search: search || undefined,
    categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
    minPrice: debouncedPrice[0],
    maxPrice: debouncedPrice[1],
    sortBy,
    limit: 50,
  });

  const { data: categories } = useListCategories();

  const resetFilters = () => {
    setSearch("");
    setCategoryId("all");
    setSortBy("newest");
    setPriceRange([0, 200000]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-sm font-medium">Category</h3>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map(cat => (
              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Price Range (OMR)</h3>
        <Slider
          defaultValue={[0, 2000]}
          max={2000}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>OMR {priceRange[0].toLocaleString()}</span>
          <span>OMR {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={resetFilters}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-24 space-y-6 rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Filters</h2>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground">
                {search ? `Search results for "${search}"` : "All Products"}
              </h1>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden flex-1 sm:flex-none">
                      <Filter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="py-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="discount">Biggest Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="rounded-xl border bg-card p-4">
                    <div className="mb-4 aspect-square rounded-lg bg-muted animate-pulse" />
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : productsData?.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 rounded-full bg-muted p-6">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No products found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  We couldn't find any products matching your current filters. Try adjusting your search or clearing filters.
                </p>
                <Button onClick={resetFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {productsData?.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
