import { useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  category: string;
  image: string;
}

const CART_STORAGE_KEY = "marketplace_cart";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      // Check if item already in cart
      if (prev.some((i) => i.productId === item.productId)) {
        return prev; // Don't add duplicates
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const isInCart = (productId: string) => {
    return cartItems.some((item) => item.productId === productId);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const itemCount = cartItems.length;

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    totalPrice,
    itemCount,
  };
}
