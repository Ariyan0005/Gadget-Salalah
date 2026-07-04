import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { useListCategories } from "@workspace/api-client-react";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">All Categories</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl border bg-muted animate-pulse h-40" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map(category => (
              <Link key={category.id} href={`/products?categoryId=${category.id}`} className="group flex flex-col items-center justify-center p-6 rounded-2xl border bg-card hover:border-primary hover:shadow-md transition-all text-center">
                {category.imageUrl ? (
                  <div className="h-16 w-16 mb-4 rounded-full overflow-hidden bg-muted">
                    <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                ) : (
                  <div className="h-16 w-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="text-xl font-bold">{category.name.charAt(0)}</span>
                  </div>
                )}
                <span className="font-medium text-foreground">{category.name}</span>
                {category.productCount !== undefined && (
                  <span className="text-xs text-muted-foreground mt-1">{category.productCount} Products</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No categories available at the moment.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
