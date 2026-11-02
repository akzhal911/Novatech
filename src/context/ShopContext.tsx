import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Product,
  CartItem,
  CustomerUser,
  AdminUser,
  Currency,
  Language,
  ProductCategory
} from '../types';
import { translations } from '../translations';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ShopContextType {
  products: Product[];
  isLoadingProducts: boolean;
  fetchProducts: () => Promise<void>;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedConfig?: string) => void;
  updateCartQty: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Comparison
  compareList: Product[];
  toggleCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;

  // Recently viewed
  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;

  // Currency & Formatter
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInUSD: number) => string;

  // Language & Translation
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: string) => string;

  // Navigation & Modals
  currentView: 'store' | 'admin' | 'admin-login';
  setCurrentView: (view: 'store' | 'admin' | 'admin-login') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  selectedCategory: ProductCategory | 'All';
  setSelectedCategory: (cat: ProductCategory | 'All') => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;

  // Auth
  customerUser: CustomerUser | null;
  setCustomerUser: (user: CustomerUser | null) => void;
  adminUser: AdminUser | null;
  setAdminUser: (admin: AdminUser | null) => void;
  adminLogin: (password: string, username?: string) => Promise<boolean>;
  adminLogout: () => void;
  customerLogout: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const CURRENCY_RATES: Record<Currency, { rate: number; symbol: string; prefix: boolean; code: string }> = {
  USD: { rate: 1.0, symbol: '$', prefix: true, code: 'USD' },
  EUR: { rate: 0.92, symbol: '€', prefix: true, code: 'EUR' },
  KZT: { rate: 500.0, symbol: '₸', prefix: false, code: 'KZT' }
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  
  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('novatech_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist persisted
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('novatech_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Compare list
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Currency & Language
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('novatech_currency') as Currency) || 'USD';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('novatech_language') as Language) || 'ru';
  });

  // View state & modals
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'admin-login'>('store');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');

  // Users
  const [customerUser, setCustomerUserState] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('novatech_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUserState] = useState<AdminUser | null>(() => {
    try {
      const token = localStorage.getItem('novatech_admin_token');
      if (token) {
        return { username: 'akzhal.a', role: 'admin', token };
      }
      return null;
    } catch {
      return null;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('novatech_currency', c);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem('novatech_language', l);
  };

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  }, [language]);

  const formatPrice = useCallback((amountInUSD: number): string => {
    const cfg = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
    const converted = Math.round(amountInUSD * cfg.rate);
    const formatted = new Intl.NumberFormat('en-US').format(converted).replace(/,/g, ' ');

    if (cfg.prefix) {
      return `${cfg.symbol}${formatted}`;
    }
    return `${formatted} ${cfg.symbol}`;
  }, [currency]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('novatech_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('novatech_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch products from server API
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const headers: Record<string, string> = {};
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }
      const res = await fetch('/api/products', { headers });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [adminUser?.token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, selectedColor?: string, selectedConfig?: string) => {
    const color = selectedColor || product.colors?.[0] || 'Default';
    const config = selectedConfig || product.configurations?.[0]?.name || 'Standard';
    
    // Calculate price with config diff if any
    const configObj = product.configurations?.find(c => c.name === config);
    const unitPrice = product.price + (configObj?.priceDiff || 0);

    const itemId = `${product.id}-${color}-${config}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          product,
          quantity,
          selectedColor: color,
          selectedConfig: config,
          pricePerUnit: unitPrice
        }
      ];
    });

    addToast(`${product.name} ${t('addedToCart')}`, 'success');
  };

  const updateCartQty = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist operations
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        addToast(`${product.name} removed from wishlist`, 'info');
        return prev.filter((p) => p.id !== product.id);
      }
      addToast(`${product.name} added to wishlist`, 'success');
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some((p) => p.id === productId);

  // Compare operations
  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        addToast('You can compare up to 4 items simultaneously', 'error');
        return prev;
      }
      addToast(`${product.name} added to comparison`, 'info');
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => setCompareList([]);

  // Recently viewed
  const addRecentlyViewed = (product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 6);
    });
  };

  // Auth handlers
  const setCustomerUser = (user: CustomerUser | null) => {
    setCustomerUserState(user);
    if (user) {
      localStorage.setItem('novatech_customer', JSON.stringify(user));
    } else {
      localStorage.removeItem('novatech_customer');
    }
  };

  const setAdminUser = (admin: AdminUser | null) => {
    setAdminUserState(admin);
    if (admin?.token) {
      localStorage.setItem('novatech_admin_token', admin.token);
    } else {
      localStorage.removeItem('novatech_admin_token');
    }
  };

  const adminLogin = async (password: string, username = 'akzhal.a'): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }

      const data = await res.json();
      const adminObj: AdminUser = {
        username: data.user.username,
        role: 'admin',
        token: data.token
      };

      setAdminUser(adminObj);
      addToast('Welcome to NOVATECH Command Center, Administrator', 'success');
      setCurrentView('admin');
      fetchProducts();
      return true;
    } catch (err: any) {
      addToast(err.message || 'Invalid administrator credentials', 'error');
      return false;
    }
  };

  const adminLogout = () => {
    setAdminUser(null);
    setCurrentView('store');
    addToast('Admin session terminated', 'info');
    fetchProducts();
  };

  const customerLogout = () => {
    setCustomerUser(null);
    addToast('Signed out of customer account', 'info');
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        isLoadingProducts,
        fetchProducts,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        compareList,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isCompareOpen,
        setIsCompareOpen,
        recentlyViewed,
        addRecentlyViewed,
        currency,
        setCurrency,
        formatPrice,
        language,
        setLanguage,
        t,
        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        selectedCategory,
        setSelectedCategory,
        isAuthOpen,
        setIsAuthOpen,
        customerUser,
        setCustomerUser,
        adminUser,
        setAdminUser,
        adminLogin,
        adminLogout,
        customerLogout,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
