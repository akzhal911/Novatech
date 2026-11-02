import React, { useState, useEffect, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  LogOut,
  Store,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Search,
  Filter,
  Save,
  X,
  Upload,
  Clock,
  Sparkles
} from 'lucide-react';
import { Product, ProductCategory, Order, OrderStatus, DashboardStats } from '../types';

export const AdminPanel: React.FC = () => {
  const {
    adminUser,
    adminLogout,
    setCurrentView,
    formatPrice,
    t,
    addToast,
    fetchProducts
  } = useShop();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'add' | 'orders'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter state for products tab
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('All');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('NOVATECH');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('Smartphones');
  const [newProdPrice, setNewProdPrice] = useState<number>(999);
  const [newProdOldPrice, setNewProdOldPrice] = useState<number | undefined>(undefined);
  const [newProdStock, setNewProdStock] = useState<number>(25);
  const [newProdImage, setNewProdImage] = useState('/src/assets/images/hero_flagship_device_1793628017947.jpg');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState('Processor: NovaSilicon Quantum M3\nDisplay: 6.8" 165Hz AMOLED\nBattery: 5000 mAh');
  const [newProdPublished, setNewProdPublished] = useState(true);

  // Fetch admin dashboard data
  const loadAdminData = useCallback(async () => {
    if (!adminUser?.token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${adminUser.token}` };

      // Load stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Load all products (including unpublished)
      const prodRes = await fetch('/api/products', { headers });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductsList(prodData.products || []);
      }

      // Load all orders
      const ordersRes = await fetch('/api/orders', { headers });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  }, [adminUser?.token]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update order status');

      addToast(`Order status updated to ${newStatus}`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Status update failed', 'error');
    }
  };

  // Handle Toggle Product Published
  const handleTogglePublish = async (product: Product) => {
    try {
      const updatedStatus = !product.isPublished;
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser?.token}`
        },
        body: JSON.stringify({ isPublished: updatedStatus })
      });

      if (!res.ok) throw new Error('Failed to toggle status');

      addToast(`Product ${updatedStatus ? 'published' : 'hidden'}`, 'info');
      setProductsList((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isPublished: updatedStatus } : p))
      );
      fetchProducts();
    } catch (err: any) {
      addToast(err.message || 'Failed to update product', 'error');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`${t('confirmDelete')} (${product.name})`)) return;

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminUser?.token}` }
      });

      if (!res.ok) throw new Error('Failed to delete product');

      addToast(`Product "${product.name}" deleted from database`, 'success');
      setProductsList((prev) => prev.filter((p) => p.id !== product.id));
      fetchProducts();
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdBrand.trim() || !newProdPrice) {
      addToast('Please enter product name, brand, and valid price', 'error');
      return;
    }

    // Parse specs from lines
    const parsedSpecs: Record<string, string> = {};
    newProdSpecs.split('\n').forEach((line) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        parsedSpecs[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });

    try {
      const payload = {
        name: newProdName.trim(),
        brand: newProdBrand.trim(),
        category: newProdCategory,
        price: Number(newProdPrice),
        oldPrice: newProdOldPrice ? Number(newProdOldPrice) : undefined,
        stock: Number(newProdStock),
        images: [newProdImage.trim() || '/src/assets/images/hero_flagship_device_1793628017947.jpg'],
        description: newProdDesc.trim() || 'Flagship specification device from NOVATECH.',
        specs: Object.keys(parsedSpecs).length > 0 ? parsedSpecs : { "Performance": "High Performance Flagship" },
        isPublished: newProdPublished,
        featured: false,
        isNew: true
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser?.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add product');
      }

      const created = await res.json();
      addToast(`Product "${created.name}" created successfully and added to catalog!`, 'success');
      
      // Reset form
      setNewProdName('');
      setNewProdDesc('');
      setNewProdPrice(999);
      setNewProdOldPrice(undefined);
      setActiveTab('products');
      
      fetchProducts();
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Error creating product', 'error');
    }
  };

  // Handle Edit Product Save
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser?.token}`
        },
        body: JSON.stringify(editingProduct)
      });

      if (!res.ok) throw new Error('Failed to update product');

      const updated = await res.json();
      addToast(`Product "${updated.name}" updated successfully`, 'success');
      setProductsList((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setEditingProduct(null);
      fetchProducts();
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to save product', 'error');
    }
  };

  // Image Upload helper (supports File or URL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isEditing && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [base64, ...(editingProduct.images?.slice(1) || [])]
        });
      } else {
        setNewProdImage(base64);
      }
      addToast('Image uploaded and set as primary visual', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Filtered products list for product management tab
  const displayedProducts = productsList.filter((p) => {
    if (productCatFilter !== 'All' && p.category !== productCatFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col text-left">
      
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 bg-[#0F121B] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('store')}
            className="flex items-center gap-2 group"
          >
            <span className="text-xl font-extrabold text-white font-display uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
              NOVATECH
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              OWNER CONSOLE
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Logged in as: <strong className="text-white">akzhal.a</strong></span>
          </div>

          <button
            onClick={() => setCurrentView('store')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('viewStore')}</span>
          </button>

          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('adminLogout')}</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body with Left Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#0D1017] border-b md:border-b-0 md:border-r border-white/10 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('tabOverview')}</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>{t('tabProducts')}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 tabular-nums">
              {productsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'add'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('tabAddProduct')}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              <span>{t('tabOrders')}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 tabular-nums">
              {orders.length}
            </span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          
          {/* 1. OVERVIEW & ANALYTICS TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  {t('tabOverview')}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time operational telemetry and global revenue tracking.
                </p>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#12151E] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{t('statsTotalRevenue')}</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white tabular-nums">
                    {formatPrice(stats?.totalRevenue || 0)}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Real sales from processed orders</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#12151E] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{t('statsTotalOrders')}</span>
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white tabular-nums">
                    {stats?.totalOrders || orders.length}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    All customer dispatches
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#12151E] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{t('statsActiveProducts')}</span>
                    <Package className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white tabular-nums">
                    {productsList.length}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Across 8 international domains
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#12151E] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{t('statsLowStock')}</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-300 tabular-nums">
                    {stats?.lowStockCount || 0}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Items with stock under 10
                  </div>
                </div>
              </div>

              {/* Grid: Top Selling + Recent Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Top Selling Products (7 cols) */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#12151E] border border-white/5 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {t('topSelling')}
                  </h3>
                  <div className="space-y-3">
                    {stats?.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                      stats.topSellingProducts.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-3 overflow-hidden pr-2">
                            <span className="font-mono text-cyan-400 font-bold w-4">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-white truncate">
                              {item.product?.name || 'Flagship Item'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 text-slate-300 tabular-nums">
                            <span>{item.unitsSold} units</span>
                            <span className="font-bold text-cyan-400">
                              {formatPrice(item.revenue)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 py-6 text-center">
                        No sales recorded yet. Completed orders will rank here automatically.
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activities (5 cols) */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12151E] border border-white/5 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>{t('recentActivity')}</span>
                  </h3>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {stats?.activityLogs && stats.activityLogs.length > 0 ? (
                      stats.activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300 space-y-1"
                        >
                          <p className="text-slate-200 leading-snug">{log.message}</p>
                          <span className="text-[10px] text-slate-500 block tabular-nums">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 py-6 text-center">
                        No recent activity logged.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. PRODUCTS MANAGEMENT TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                    {t('tabProducts')}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live catalog synchronization. Changes appear in the store immediately.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('add')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('addNewProduct')}</span>
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product name or brand..."
                    className="w-full bg-[#12151E] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="bg-[#12151E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  aria-label="Filter category"
                >
                  <option value="All">{t('allCategories')}</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Headphones">Headphones</option>
                  <option value="Smart Watches">Smart Watches</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Tablets">Tablets</option>
                  <option value="Cameras">Cameras</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-[#12151E] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0D1017] border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-3.5 px-4">Item</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Stock</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {displayedProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images?.[0] || '/src/assets/images/hero_flagship_device_1793628017947.jpg'}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-black shrink-0"
                              />
                              <div>
                                <div className="font-semibold text-white">{prod.name}</div>
                                <div className="text-[11px] text-slate-500">{prod.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{prod.category}</td>
                          <td className="py-3 px-4 font-bold text-white tabular-nums">
                            {formatPrice(prod.price)}
                            {prod.oldPrice && (
                              <div className="text-[10px] text-slate-500 line-through">
                                {formatPrice(prod.oldPrice)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-semibold tabular-nums ${
                                prod.stock > 10
                                  ? 'text-emerald-400'
                                  : prod.stock > 0
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {prod.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleTogglePublish(prod)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                                prod.isPublished !== false
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {prod.isPublished !== false ? (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>{t('published')}</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>{t('hidden')}</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingProduct({ ...prod })}
                                className="p-1.5 rounded-md hover:bg-white/10 text-cyan-400 transition-colors"
                                title={t('editProduct')}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                className="p-1.5 rounded-md hover:bg-rose-500/20 text-rose-400 transition-colors"
                                title={t('deleteProduct')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. ADD NEW PRODUCT TAB */}
          {activeTab === 'add' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  {t('addNewProduct')}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter specifications, pricing, and visual assets for public launch.
                </p>
              </div>

              <form onSubmit={handleAddProductSubmit} className="p-6 rounded-2xl bg-[#12151E] border border-white/10 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {t('productName')} *
                    </label>
                    <input
                      type="text"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      required
                      placeholder="NovaPhone Quantum Max"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {t('productBrand')} *
                    </label>
                    <input
                      type="text"
                      value={newProdBrand}
                      onChange={(e) => setNewProdBrand(e.target.value)}
                      required
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {t('productCategory')} *
                    </label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Smartphones">Smartphones</option>
                      <option value="Laptops">Laptops</option>
                      <option value="Headphones">Headphones</option>
                      <option value="Smart Watches">Smart Watches</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Tablets">Tablets</option>
                      <option value="Cameras">Cameras</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {t('productPrice')} ($ USD) *
                    </label>
                    <input
                      type="number"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      required
                      min="1"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {t('productOldPrice')} ($ USD)
                    </label>
                    <input
                      type="number"
                      value={newProdOldPrice || ''}
                      onChange={(e) => setNewProdOldPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Optional discount baseline"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {t('productStock')} *
                    </label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      required
                      min="0"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={newProdPublished}
                        onChange={(e) => setNewProdPublished(e.target.checked)}
                        className="rounded border-white/20 bg-[#090A0F] text-cyan-500"
                      />
                      <span>Publish immediately to catalog</span>
                    </label>
                  </div>

                  {/* Image input and file uploader */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      {t('productImagePrompt')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="flex-1 bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        placeholder="/src/assets/images/hero_flagship_device_1793628017947.jpg"
                      />
                      <label className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileChange(e, false)}
                        />
                      </label>
                    </div>

                    {/* Preview box */}
                    {newProdImage && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 mt-2 bg-black">
                        <img
                          src={newProdImage}
                          alt="preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {t('productDesc')}
                    </label>
                    <textarea
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      rows={3}
                      placeholder="Detailed engineering craftsmanship, acoustic design, processing capabilities..."
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Technical Specifications (One key: value per line)
                    </label>
                    <textarea
                      value={newProdSpecs}
                      onChange={(e) => setNewProdSpecs(e.target.value)}
                      rows={3}
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-lg shadow-xl shadow-cyan-500/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('saveProduct')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. ORDERS MANAGEMENT TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  {t('tabOrders')}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect incoming customer dispatches, recipient addresses, and update fulfillment states.
                </p>
              </div>

              <div className="bg-[#12151E] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0D1017] border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-3.5 px-4">Order #</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">{t('orderCustomer')}</th>
                        <th className="py-3.5 px-4">{t('orderItems')}</th>
                        <th className="py-3.5 px-4">{t('orderTotal')}</th>
                        <th className="py-3.5 px-4">{t('orderStatus')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-slate-400 tabular-nums">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{ord.customer.fullName}</div>
                            <div className="text-[11px] text-slate-400">{ord.customer.email}</div>
                            <div className="text-[11px] text-slate-500">
                              {ord.customer.city}, {ord.customer.country} · {ord.customer.phone}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1 max-w-xs">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="text-[11px] text-slate-300">
                                  <span className="font-bold text-white tabular-nums">{it.quantity}x</span>{' '}
                                  {it.name}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-white tabular-nums">
                            {formatPrice(ord.total)}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className={`bg-[#090A0F] border rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer focus:outline-none ${
                                ord.status === 'Delivered'
                                  ? 'border-emerald-500/50 text-emerald-300'
                                  : ord.status === 'Shipped'
                                  ? 'border-cyan-500/50 text-cyan-300'
                                  : ord.status === 'Processing'
                                  ? 'border-blue-500/50 text-blue-300'
                                  : ord.status === 'Cancelled'
                                  ? 'border-rose-500/50 text-rose-300'
                                  : 'border-amber-500/50 text-amber-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0F121B] border border-white/10 rounded-2xl p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">
                {t('editProduct')}: {editingProduct.name}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {t('productName')}
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {t('productPrice')} ($ USD)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {t('productOldPrice')} ($ USD)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.oldPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {t('productStock')}
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {t('productCategory')}
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Headphones">Headphones</option>
                    <option value="Smart Watches">Smart Watches</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {t('productDesc')}
                </label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#090A0F] border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  {t('updateProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
