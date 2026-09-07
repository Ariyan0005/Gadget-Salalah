import { useEffect, useState } from "react";
import type { Cart, CartItem, Product } from "@workspace/api-client-react";

const STORAGE_KEY = "gadget-salalah-guest-cart";
const CART_EVENT = "gadget-salalah-guest-cart-updated";

function emptyCart(): Cart {
  return { items: [], total: 0, itemCount: 0 };
}

function readCart(): Cart {
  if (typeof window === "undefined") return emptyCart();

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart();
    return {
      items: parsed.items,
      total: Number(parsed.total) || 0,
      itemCount: Number(parsed.itemCount) || 0,
    };
  } catch {
    return emptyCart();
  }
}

function saveCart(cart: Cart): Cart {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event(CART_EVENT));
  }
  return cart;
}

function buildCart(items: CartItem[]): Cart {
  return {
    items,
    total: items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function addGuestProduct(product: Product, quantity = 1): Cart {
  const cart = readCart();
  const existing = cart.items.find((item) => item.productId === product.id);

  const items = existing
    ? cart.items.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity, subtotal: Number(product.price) * (item.quantity + quantity) }
          : item,
      )
    : [
        ...cart.items,
        {
          id: -product.id,
          productId: product.id,
          productName: product.name,
          productImage: product.imageUrl ?? null,
          quantity,
          price: Number(product.price),
          subtotal: Number(product.price) * quantity,
        },
      ];

  return saveCart(buildCart(items));
}

export function updateGuestCartItem(itemId: number, quantity: number): Cart {
  const items = readCart().items
    .map((item) => (item.id === itemId ? { ...item, quantity, subtotal: Number(item.price) * quantity } : item))
    .filter((item) => item.quantity > 0);
  return saveCart(buildCart(items));
}

export function removeGuestCartItem(itemId: number): Cart {
  return saveCart(buildCart(readCart().items.filter((item) => item.id !== itemId)));
}

export function clearGuestCart(): Cart {
  return saveCart(emptyCart());
}

export function useGuestCart(): Cart {
  const [cart, setCart] = useState<Cart>(() => readCart());

  useEffect(() => {
    const refresh = () => setCart(readCart());
    window.addEventListener(CART_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CART_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return cart;
}