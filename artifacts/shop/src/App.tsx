import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, useSeo } from "./lib/seo";

import Home from "./pages/home";
import Products from "./pages/products/index";
import ProductDetail from "./pages/products/[id]";
import Categories from "./pages/categories";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import OrdersList from "./pages/orders/index";
import OrderDetail from "./pages/orders/[id]";
import TrackOrder from "./pages/track";
import AuthPage from "./pages/auth";
import About from "./pages/about";
import Contact from "./pages/contact";
import MobileService from "./pages/mobile-service";
import SpareParts from "./pages/spare-parts";
import ReturnPolicy from "./pages/return-policy";
import AccountPage from "./pages/account";
import SettingsPage from "./pages/settings";
import AdminDashboard from "./pages/admin/index";
import AdminProducts from "./pages/admin/products";
import AdminCategories from "./pages/admin/categories";
import AdminOrders from "./pages/admin/orders";
import AdminUsers from "./pages/admin/users";
import AdminBanners from "./pages/admin/banners";
import AdminSetup from "./pages/admin/setup";

setAuthTokenGetter(() => localStorage.getItem("token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Avoid making a broken API proxy feel like a long page load.
      retry: 1,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 2000),
      staleTime: 30_000,
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
  if (!user || user.role !== 'admin') return <Redirect to="/" />;
  return <Component {...rest} />;
}

function Router() {
  const [location] = useLocation();
  const path = location.split("?")[0];
  const hasQuery = typeof window !== "undefined" && Boolean(window.location.search);
  const isPrivate = /^\/(account|settings|orders|admin)(\/|$)/.test(path);
  const isNoindexUtility = /^\/(cart|checkout)(\/|$)/.test(path);
  const isAuth = path === "/login" || path === "/register";
  const isKnownPublic = ["/", "/products", "/categories", "/track", "/about", "/contact", "/mobile-service", "/spare-parts", "/return-policy"].includes(path);

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

  );
}

function App() {
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

export default App;
