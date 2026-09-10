import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, useSeo } from "./lib/seo";

// Eager load Home for instantaneous First Contentful Paint
import Home from "./pages/home";

// Lazy load non-critical routes
const Products = lazy(() => import("./pages/products/index"));
const ProductDetail = lazy(() => import("./pages/products/[id]"));
const Categories = lazy(() => import("./pages/categories"));
const Cart = lazy(() => import("./pages/cart"));
const Checkout = lazy(() => import("./pages/checkout"));
const OrdersList = lazy(() => import("./pages/orders/index"));
const OrderDetail = lazy(() => import("./pages/orders/[id]"));
const TrackOrder = lazy(() => import("./pages/track"));
const AuthPage = lazy(() => import("./pages/auth"));
const About = lazy(() => import("./pages/about"));
const Contact = lazy(() => import("./pages/contact"));
const MobileService = lazy(() => import("./pages/mobile-service"));
const SpareParts = lazy(() => import("./pages/spare-parts"));
const ReturnPolicy = lazy(() => import("./pages/return-policy"));
const AccountPage = lazy(() => import("./pages/account"));
const SettingsPage = lazy(() => import("./pages/settings"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Lazy load heavy admin routes and chart visualization modules
const AdminDashboard = lazy(() => import("./pages/admin/index"));
const AdminProducts = lazy(() => import("./pages/admin/products"));
const AdminCategories = lazy(() => import("./pages/admin/categories"));
const AdminOrders = lazy(() => import("./pages/admin/orders"));
const AdminUsers = lazy(() => import("./pages/admin/users"));
const AdminBanners = lazy(() => import("./pages/admin/banners"));
const AdminSetup = lazy(() => import("./pages/admin/setup"));

setAuthTokenGetter(() => localStorage.getItem("token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 2000),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function RouteLoadingBar() {
  return (
    <div
      aria-label="Loading"
      role="status"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary/15"
    >
      <div
        className="h-full w-1/3 rounded-full bg-primary"
        style={{ animation: "route-progress 1.1s ease-in-out infinite" }}
      />
    </div>
  );
}

// Route Guards
function PrivateRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <RouteLoadingBar />;
  if (!user) return <Redirect to="/login" />;
  return <Component {...rest} />;
}

function AdminRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <RouteLoadingBar />;
  if (!user || user.role !== "admin") return <Redirect to="/" />;
  return <Component {...rest} />;
}

function Router() {
  const [location] = useLocation();
  const path = location.split("?")[0];
  const hasQuery = typeof window !== "undefined" && Boolean(window.location.search);
  const isPrivate = /^\/(account|settings|orders|admin)(\/|$)/.test(path);
  const isNoindexUtility = /^\/(cart|checkout)(\/|$)/.test(path);
  const isAuth = path === "/login" || path === "/register";
  const isKnownPublic = [
    "/",
    "/products",
    "/categories",
    "/track",
    "/about",
    "/contact",
    "/mobile-service",
    "/spare-parts",
    "/return-policy",
  ].includes(path);

  useSeo({
    title:
      path === "/"
        ? "Gadget Salalah — Smartphones, Laptops & Accessories in Oman"
        : path === "/products"
          ? "Shop Gadgets in Salalah | Smartphones, Laptops & Accessories"
          : path === "/categories"
            ? "Gadget Categories in Salalah | Gadget Salalah"
            : path === "/about"
              ? "About Gadget Salalah | Dhofar's Tech Store"
              : path === "/contact"
                ? "Contact Gadget Salalah | Salalah, Oman"
                : path === "/mobile-service"
                  ? "Mobile Repair & Service in Salalah | Gadget Salalah"
                  : path === "/spare-parts"
                    ? "Mobile Spare Parts in Salalah | Gadget Salalah"
                    : path === "/return-policy"
                      ? "Return Policy | Gadget Salalah"
                      : path === "/track"
                        ? "Track Your Order | Gadget Salalah"
                        : isPrivate || isNoindexUtility || isAuth
                          ? "Gadget Salalah Account"
                          : DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: isKnownPublic ? path : "/",
    noindex: isPrivate || isNoindexUtility || isAuth || (path === "/products" && hasQuery) || !isKnownPublic,
  });

  return (
    <Suspense fallback={<RouteLoadingBar />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/categories" component={Categories} />
        <Route path="/track" component={TrackOrder} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/mobile-service" component={MobileService} />
        <Route path="/spare-parts" component={SpareParts} />
        <Route path="/return-policy" component={ReturnPolicy} />
        <Route path="/login"><AuthPage isLogin={true} /></Route>
        <Route path="/register"><AuthPage isLogin={false} /></Route>
        <Route path="/account"><PrivateRoute component={AccountPage} /></Route>
        <Route path="/settings"><PrivateRoute component={SettingsPage} /></Route>
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/orders"><PrivateRoute component={OrdersList} /></Route>
        <Route path="/orders/:id"><PrivateRoute component={OrderDetail} /></Route>
        {/* First-time setup — public, auto-locks after first admin */}
        <Route path="/admin/setup" component={AdminSetup} />
        {/* Admin Routes */}
        <Route path="/admin"><AdminRoute component={AdminDashboard} /></Route>
        <Route path="/admin/products"><AdminRoute component={AdminProducts} /></Route>
        <Route path="/admin/categories"><AdminRoute component={AdminCategories} /></Route>
        <Route path="/admin/orders"><AdminRoute component={AdminOrders} /></Route>
        <Route path="/admin/users"><AdminRoute component={AdminUsers} /></Route>
        <Route path="/admin/banners"><AdminRoute component={AdminBanners} /></Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </AuthProvider>
        </LanguageProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
