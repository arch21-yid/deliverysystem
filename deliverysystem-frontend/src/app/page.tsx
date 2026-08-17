"use client";

import React, { useState, useEffect } from "react";

type ThemeMode = "dark" | "light" | "high-contrast";
type UnitType = "pcs" | "kg" | "g" | "L" | "pack" | "box";

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  barcode: string;
  price: number;
  stockQuantity: number;
  unit?: UnitType;
}

interface Order {
  id: number;
  customerName: string;
  address: string;
  totalAmount?: number;
  totalValue?: number;
  total?: number;
  status: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Receipt {
  orderId: number;
  customerName: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
}

const translations = {
  EN: {
    title: "Supermarket Delivery System",
    sync: "Sync Data",
    totalRevenue: "Total Revenue",
    activeOrders: "Active Orders",
    lowStock: "Low Stock Warnings",
    posTab: "🛒 POS Checkout & Cart",
    catalogTab: "📦 Inventory Catalog",
    ordersTab: "🚚 Fulfillment Orders",
    analyticsTab: "📊 Sales Analytics",
    searchPlaceholder: "🔍 Search items by name, SKU, or barcode...",
    allCategories: "All Categories",
    addToCart: "+ Add to Cart",
    outOfStock: "Out of Stock",
    currentCart: "🛒 Current Order Cart",
    cartEmpty: "Cart is empty. Click '+ Add to Cart' or scan barcode.",
    customerName: "Customer Name",
    address: "Delivery Address",
    subtotal: "Subtotal",
    tax: "Tax (8%)",
    total: "Total",
    checkout: "Complete POS Checkout & Print Receipt",
    printReceipt: "🖨️ Print Receipt",
    close: "Close",
    receiptTitle: "OFFICIAL POS RECEIPT",
  },
  AM: {
    title: "የሱፐርማርኬት ማድረሻ ስርአት",
    sync: "መረጃ አድስ",
    totalRevenue: "ጠቅላላ ገቢ",
    activeOrders: "ንቁ ትዕዛዞች",
    lowStock: "የአነስተኛ ክምችት ማስጠንቀቂያ",
    posTab: "🛒 የሽያጭ መክፈያ (POS)",
    catalogTab: "📦 የዕቃዎች ዝርዝር",
    ordersTab: "🚚 የማድረስ ትዕዛዞች",
    analyticsTab: "📊 የሽያጭ ትንታኔ",
    searchPlaceholder: "🔍 በስም፣ በSKU ወይም በባርኮድ ፈልግ...",
    allCategories: "ሁሉም ምድቦች",
    addToCart: "+ ወደ ቅርጫት ጨምር",
    outOfStock: "ያለቀ ዕቃ",
    currentCart: "🛒 የዕቃ ቅርጫት",
    cartEmpty: "ቅርጫቱ ባዶ ነው። '+ ወደ ቅርጫት ጨምር' የሚለውን ይጫኑ ወይም ባርኮድ ያንብቡ።",
    customerName: "የደንበኛ ስም",
    address: "የማድረሻ አድራሻ",
    subtotal: "ንዑስ ድምር",
    tax: "ታክስ (8%)",
    total: "ጠቅላላ ድምር",
    checkout: "ክፍያ ፈጽም እና ደረሰኝ አትም",
    printReceipt: "🖨️ ደረሰኝ አትም",
    close: "ዝጋ",
    receiptTitle: "ይፋዊ የሽያጭ ደረሰኝ",
  },
};

export default function Home() {
  const [lang, setLang] = useState<"EN" | "AM">("EN");
  const t = translations[lang];

  // Theme State
  const [theme, setTheme] = useState<ThemeMode>("dark");

  const [activeTab, setActiveTab] = useState<"pos" | "catalog" | "orders" | "analytics">("pos");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Search & Category
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posCustomerName, setPosCustomerName] = useState("");
  const [posAddress, setPosAddress] = useState("");

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  // Forms
  const [newOrder, setNewOrder] = useState({ customerName: "", address: "", totalAmount: "", status: "PENDING" });
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "Produce",
    barcode: "",
    price: "",
    stockQuantity: "",
    unit: "pcs" as UnitType,
  });

  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/orders");
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/products");
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // Barcode Scanner Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "Enter") {
        if (barcodeBuffer.length > 0) {
          const matchedProduct = products.find((p) => p.barcode === barcodeBuffer || p.sku === barcodeBuffer);
          if (matchedProduct) {
            addToCart(matchedProduct);
            showToast(`Scanned: ${matchedProduct.name}`);
          } else {
            showToast(`Barcode ${barcodeBuffer} not found!`);
          }
          setBarcodeBuffer("");
        }
      } else if (e.key.length === 1) {
        setBarcodeBuffer((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [barcodeBuffer, products]);

  // Cart Handlers
  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      showToast("Item is out of stock!");
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          showToast("Cannot add more than available stock!");
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stockQuantity) {
              showToast("Exceeds available stock!");
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTax = cartSubtotal * 0.08;
  const cartTotal = cartSubtotal + cartTax;

  const handleCheckoutCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return showToast("Cart is empty!");

    try {
      for (const item of cart) {
        await fetch("http://localhost:8081/api/products/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.product.id, quantity: item.quantity }),
        });
      }

      const res = await fetch("http://localhost:8081/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: posCustomerName || "POS Walk-In Customer",
          address: posAddress || "Store Front Counter",
          totalAmount: cartTotal,
          totalValue: cartTotal,
          status: "PENDING",
        }),
      });

      if (res.ok) {
        const createdOrder = await res.json();
        setActiveReceipt({
          orderId: createdOrder.id || Math.floor(Math.random() * 90000) + 10000,
          customerName: posCustomerName || "POS Walk-In Customer",
          address: posAddress || "Store Front Counter",
          items: [...cart],
          subtotal: cartSubtotal,
          tax: cartTax,
          total: cartTotal,
          date: new Date().toLocaleString(),
        });

        showToast("Checkout Complete!");
        setCart([]);
        setPosCustomerName("");
        setPosAddress("");
        fetchProducts();
        fetchOrders();
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  // Product Management
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      barcode: productForm.barcode,
      price: parseFloat(productForm.price) || 0,
      stockQuantity: parseInt(productForm.stockQuantity) || 0,
      unit: productForm.unit,
    };

    const url = editingProduct
      ? `http://localhost:8081/api/products/${editingProduct.id}`
      : "http://localhost:8081/api/products";
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editingProduct ? "Product Updated!" : "Product Added!");
        setIsProductModalOpen(false);
        setEditingProduct(null);
        setProductForm({ name: "", sku: "", category: "Produce", barcode: "", price: "", stockQuantity: "", unit: "pcs" });
        fetchProducts();
      }
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      sku: prod.sku,
      category: prod.category || "Produce",
      barcode: prod.barcode,
      price: prod.price.toString(),
      stockQuantity: prod.stockQuantity.toString(),
      unit: prod.unit || "pcs",
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:8081/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Product deleted");
        fetchProducts();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8081/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Order #${orderId} set to ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newOrder.totalAmount) || 0;
    try {
      const res = await fetch("http://localhost:8081/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newOrder, totalAmount: amountNum, totalValue: amountNum }),
      });
      if (res.ok) {
        showToast("New Order Created!");
        setIsOrderModalOpen(false);
        setNewOrder({ customerName: "", address: "", totalAmount: "", status: "PENDING" });
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getOrderAmount = (o: any): number => parseFloat(o.totalAmount ?? o.totalValue ?? o.total ?? 0) || 0;

  // Filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery);
    const matchesCat = selectedCategory === "ALL" || p.category?.toUpperCase() === selectedCategory.toUpperCase();
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter((o) => selectedStatus === "ALL" || o.status?.toUpperCase() === selectedStatus);

  const totalRevenue = orders.reduce((sum, o) => sum + getOrderAmount(o), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity < 10).length;

  // Theme Class Mapping
  const themeClasses = {
    dark: {
      bg: "bg-[#07130E] text-white",
      card: "bg-[#0C1B14] border-emerald-900/40 text-white",
      input: "bg-[#06100B] border-emerald-900/60 text-white",
      subtle: "text-emerald-500/80",
      accent: "bg-emerald-600 hover:bg-emerald-500 text-white",
      tabActive: "bg-emerald-600 text-white",
      tabInactive: "text-emerald-400/60 hover:text-white",
    },
    light: {
      bg: "bg-slate-50 text-slate-900",
      card: "bg-white border-slate-200 text-slate-800 shadow-sm",
      input: "bg-slate-100 border-slate-300 text-slate-900",
      subtle: "text-slate-500",
      accent: "bg-emerald-600 hover:bg-emerald-700 text-white",
      tabActive: "bg-emerald-600 text-white",
      tabInactive: "text-slate-600 hover:text-slate-900",
    },
    "high-contrast": {
      bg: "bg-black text-yellow-300",
      card: "bg-black border-2 border-yellow-400 text-yellow-300",
      input: "bg-black border-2 border-yellow-400 text-yellow-300",
      subtle: "text-yellow-400",
      accent: "bg-yellow-400 text-black font-bold hover:bg-yellow-300",
      tabActive: "bg-yellow-400 text-black font-bold",
      tabInactive: "text-yellow-400 hover:bg-yellow-950",
    },
  }[theme];

  return (
    <div className={`min-h-screen p-6 relative font-sans transition-colors duration-200 ${themeClasses.bg}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-600 border border-emerald-400 text-white font-medium px-4 py-2.5 rounded-lg shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {t.title} <span className="bg-emerald-900/60 text-emerald-400 text-xs px-2 py-0.5 rounded">V3.5 Pro</span>
          </h1>
          <p className={`text-xs ${themeClasses.subtle}`}>REST Backend Integrated • Barcode Scanning Active</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <div className="flex bg-black/20 p-1 rounded-lg border border-emerald-900/40 gap-1 text-xs">
            <button
              onClick={() => setTheme("dark")}
              className={`px-2 py-1 rounded transition ${theme === "dark" ? "bg-emerald-600 text-white font-bold" : themeClasses.subtle}`}
            >
              🌙 Dark
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`px-2 py-1 rounded transition ${theme === "light" ? "bg-emerald-600 text-white font-bold" : themeClasses.subtle}`}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => setTheme("high-contrast")}
              className={`px-2 py-1 rounded transition ${theme === "high-contrast" ? "bg-yellow-400 text-black font-bold" : themeClasses.subtle}`}
            >
              ⚡ Contrast
            </button>
          </div>

          <button
            onClick={() => setLang(lang === "EN" ? "AM" : "EN")}
            className="bg-emerald-900 text-emerald-200 text-xs px-3 py-1.5 rounded-lg font-bold transition border border-emerald-700/50 cursor-pointer"
          >
            🌐 {lang === "EN" ? "አማርኛ" : "English"}
          </button>
          <button
            onClick={() => { fetchOrders(); fetchProducts(); showToast("Data Synced"); }}
            className="bg-emerald-950 text-emerald-300 text-sm px-4 py-1.5 rounded-lg flex items-center gap-2 border border-emerald-800/50 cursor-pointer"
          >
            🔄 {t.sync}
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl border flex justify-between items-center ${themeClasses.card}`}>
          <div>
            <p className={`text-xs uppercase font-semibold ${themeClasses.subtle}`}>{t.totalRevenue}</p>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </div>
          <span className="text-2xl">💰</span>
        </div>
        <div className={`p-4 rounded-xl border flex justify-between items-center ${themeClasses.card}`}>
          <div>
            <p className={`text-xs uppercase font-semibold ${themeClasses.subtle}`}>{t.activeOrders}</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <span className="text-2xl">🚚</span>
        </div>
        <div className={`p-4 rounded-xl border flex justify-between items-center ${themeClasses.card}`}>
          <div>
            <p className={`text-xs uppercase font-semibold ${themeClasses.subtle}`}>{t.lowStock}</p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-amber-400" : ""}`}>{lowStockCount} Items</p>
          </div>
          <span className="text-2xl">⚠️</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`p-2 rounded-xl border mb-6 flex justify-between items-center ${themeClasses.card}`}>
        <div className="flex gap-2">
          {(["pos", "catalog", "orders", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === tab ? themeClasses.tabActive : themeClasses.tabInactive
              }`}
            >
              {t[`${tab}Tab` as keyof typeof t]}
            </button>
          ))}
        </div>
        <div className={`text-xs flex items-center gap-2 ${themeClasses.subtle}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Barcode Scanner Listening
        </div>
      </div>

      {/* --- POS TAB --- */}
      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-xl border ${themeClasses.card}`}>
            <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`px-4 py-2 rounded-lg text-sm focus:outline-none flex-grow ${themeClasses.input}`}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm focus:outline-none ${themeClasses.input}`}
              >
                <option value="ALL">{t.allCategories}</option>
                <option value="Produce">Produce</option>
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProducts.map((item) => (
                <div key={item.id} className={`p-4 rounded-xl border flex justify-between items-center ${themeClasses.card}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{item.name}</p>
                      {item.unit && (
                        <span className="text-[10px] bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                          {item.unit}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${themeClasses.subtle}`}>
                      ${item.price} / {item.unit || "unit"} — Stock: <span className="font-bold">{item.stockQuantity}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={item.stockQuantity <= 0}
                    className={`text-xs font-medium px-3 py-2 rounded-lg transition cursor-pointer ${
                      item.stockQuantity > 0 ? themeClasses.accent : "opacity-40 cursor-not-allowed bg-gray-500 text-white"
                    }`}
                  >
                    {item.stockQuantity > 0 ? t.addToCart : t.outOfStock}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-xl border flex flex-col justify-between ${themeClasses.card}`}>
            <div>
              <h2 className="text-lg font-semibold mb-4">{t.currentCart}</h2>
              {cart.length === 0 ? (
                <div className={`text-center py-12 text-xs border border-dashed rounded-xl ${themeClasses.subtle}`}>
                  {t.cartEmpty}
                </div>
              ) : (
                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className={`p-3 rounded-lg border flex justify-between items-center ${themeClasses.input}`}>
                      <div>
                        <p className="text-xs font-semibold">{item.product.name}</p>
                        <p className="text-[10px] opacity-80">
                          ${item.product.price} per {item.product.unit || "unit"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateCartQuantity(item.product.id, -1)} className="px-2 py-0.5 rounded bg-gray-700 text-white text-xs cursor-pointer">-</button>
                        <span className="text-xs font-bold">{item.quantity} {item.product.unit || ""}</span>
                        <button onClick={() => updateCartQuantity(item.product.id, 1)} className="px-2 py-0.5 rounded bg-gray-700 text-white text-xs cursor-pointer">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleCheckoutCart} className="border-t border-gray-700/40 pt-4 space-y-3">
              <div>
                <label className={`block text-[11px] mb-1 ${themeClasses.subtle}`}>{t.customerName}</label>
                <input type="text" placeholder="Walk-In Customer" value={posCustomerName} onChange={(e) => setPosCustomerName(e.target.value)} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
              </div>
              <div>
                <label className={`block text-[11px] mb-1 ${themeClasses.subtle}`}>{t.address}</label>
                <input type="text" placeholder="Store Counter / Local Address" value={posAddress} onChange={(e) => setPosAddress(e.target.value)} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
              </div>

              <div className="space-y-1 text-xs pt-2 border-t border-gray-700/20">
                <div className="flex justify-between"><span>{t.subtotal}:</span><span>${cartSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{t.tax}:</span><span>${cartTax.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-bold pt-1"><span>{t.total}:</span><span>${cartTotal.toFixed(2)}</span></div>
              </div>

              <button type="submit" disabled={cart.length === 0} className={`w-full py-2.5 rounded-lg font-semibold text-xs transition cursor-pointer ${cart.length > 0 ? themeClasses.accent : "opacity-50 cursor-not-allowed"}`}>
                {t.checkout}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- INVENTORY CATALOG TAB --- */}
      {activeTab === "catalog" && (
        <div className={`p-6 rounded-xl border ${themeClasses.card}`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">{t.catalogTab}</h2>
              <p className={`text-xs ${themeClasses.subtle}`}>Manage items, stock counts, measurement units, and barcode mappings</p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: "", sku: "", category: "Produce", barcode: "", price: "", stockQuantity: "", unit: "pcs" });
                setIsProductModalOpen(true);
              }}
              className={`text-xs px-3 py-2 rounded-lg font-bold cursor-pointer ${themeClasses.accent}`}
            >
              + Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((item) => (
              <div key={item.id} className={`p-4 rounded-xl border flex flex-col justify-between ${themeClasses.card}`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{item.name}</h3>
                    <div className="flex gap-1">
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40">{item.category || "General"}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700">{item.unit || "pcs"}</span>
                    </div>
                  </div>
                  <p className={`text-xs ${themeClasses.subtle}`}>SKU: {item.sku} | Barcode: {item.barcode}</p>
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span className="font-bold">${item.price} / {item.unit || "unit"}</span>
                    <span className={`px-2 py-0.5 rounded text-xs border ${item.stockQuantity < 10 ? "bg-amber-950/80 text-amber-400 border-amber-800/40" : "bg-emerald-950 text-emerald-400 border-emerald-800/40"}`}>
                      Stock: {item.stockQuantity} {item.unit || ""}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-700/30">
                  <button onClick={() => openEditProduct(item)} className="bg-emerald-950 text-emerald-300 text-xs py-1.5 rounded border border-emerald-800/30 cursor-pointer">✏️ Edit</button>
                  <button onClick={() => handleDeleteProduct(item.id)} className="bg-rose-950/60 text-rose-300 text-xs py-1.5 rounded border border-rose-800/30 cursor-pointer">🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- FULFILLMENT ORDERS TAB --- */}
      {activeTab === "orders" && (
        <div className={`p-6 rounded-xl border ${themeClasses.card}`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">{t.ordersTab}</h2>
              <p className={`text-xs ${themeClasses.subtle}`}>Manage order statuses and delivery flow</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className={`px-3 py-1.5 rounded-lg text-sm ${themeClasses.input}`}>
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="DELIVERED">Delivered</option>
              </select>
              <button onClick={() => setIsOrderModalOpen(true)} className={`text-xs px-3 py-2 rounded-lg font-bold cursor-pointer ${themeClasses.accent}`}>+ Create Order</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className={`p-4 rounded-xl border flex flex-col justify-between ${themeClasses.card}`}>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold">ORDER #{order.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800/40">{order.status}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1">Customer: {order.customerName}</p>
                  <p className={`text-xs mb-4 ${themeClasses.subtle}`}>📍 Address: {order.address}</p>
                  <p className="text-lg font-bold">${getOrderAmount(order).toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-3 border-t border-gray-700/30 text-[10px]">
                  <button onClick={() => handleStatusUpdate(order.id, "PREPARING")} className="bg-emerald-950 text-emerald-300 py-1.5 rounded border border-emerald-800/30 cursor-pointer">Preparing</button>
                  <button onClick={() => handleStatusUpdate(order.id, "DISPATCHED")} className="bg-emerald-950 text-emerald-300 py-1.5 rounded border border-emerald-800/30 cursor-pointer">Dispatched</button>
                  <button onClick={() => handleStatusUpdate(order.id, "DELIVERED")} className="bg-emerald-950 text-emerald-300 py-1.5 rounded border border-emerald-800/30 cursor-pointer">Delivered</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ANALYTICS TAB --- */}
      {activeTab === "analytics" && (
        <div className={`p-6 rounded-xl border ${themeClasses.card}`}>
          <h2 className="text-lg font-semibold mb-2">{t.analyticsTab}</h2>
          <p className={`text-xs mb-6 ${themeClasses.subtle}`}>Category metrics and store stats</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
              <h3 className="text-sm font-bold mb-4">Unit Breakdown by Category</h3>
              {products.map((p) => (
                <div key={p.id} className="flex justify-between text-xs py-1 border-b border-gray-700/20">
                  <span>{p.name} ({p.unit || "pcs"})</span>
                  <span className="font-bold">{p.stockQuantity} remaining</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className={`p-6 rounded-xl border w-full max-w-md shadow-2xl ${themeClasses.card}`}>
            <h2 className="text-lg font-bold mb-4">{editingProduct ? "Edit Product Item" : "Add New Stock Item"}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>Product Name</label>
                <input required type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>SKU</label>
                  <input required type="text" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>Barcode</label>
                  <input required type="text" value={productForm.barcode} onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
                </div>
              </div>

              {/* Category, Price, Unit Selector */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>Category</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`}>
                    <option value="Produce">Produce</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>Unit</label>
                  <select value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value as UnitType })} className={`w-full p-2 rounded text-xs font-semibold focus:outline-none ${themeClasses.input}`}>
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="g">g (Grams)</option>
                    <option value="L">L (Liters)</option>
                    <option value="pack">pack (Packets)</option>
                    <option value="box">box (Boxes)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>Price ($)</label>
                  <input required type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
                </div>
              </div>

              <div>
                <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>Stock Quantity</label>
                <input required type="number" value={productForm.stockQuantity} onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700/40">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white text-xs rounded cursor-pointer">Cancel</button>
                <button type="submit" className={`px-4 py-2 text-xs rounded font-bold cursor-pointer ${themeClasses.accent}`}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ORDER MODAL --- */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className={`p-6 rounded-xl border w-full max-w-md shadow-2xl ${themeClasses.card}`}>
            <h2 className="text-lg font-bold mb-4">Create Manual Fulfillment Order</h2>
            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>Customer Name</label>
                <input required type="text" value={newOrder.customerName} onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>Delivery Address</label>
                <input required type="text" value={newOrder.address} onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${themeClasses.subtle}`}>Total Amount ($)</label>
                <input required type="number" step="0.01" value={newOrder.totalAmount} onChange={(e) => setNewOrder({ ...newOrder, totalAmount: e.target.value })} className={`w-full p-2 rounded text-xs focus:outline-none ${themeClasses.input}`} />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700/40">
                <button type="button" onClick={() => setIsOrderModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white text-xs rounded cursor-pointer">Cancel</button>
                <button type="submit" className={`px-4 py-2 text-xs rounded font-bold cursor-pointer ${themeClasses.accent}`}>Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white text-black rounded-lg p-6 w-full max-w-sm font-mono shadow-2xl relative">
            <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
              <h3 className="font-bold text-base">{t.receiptTitle}</h3>
              <p className="text-[10px] text-gray-600">Order #{activeReceipt.orderId}</p>
              <p className="text-[10px] text-gray-500">{activeReceipt.date}</p>
            </div>
            <div className="text-xs mb-3 space-y-0.5 border-b border-dashed border-gray-400 pb-3">
              <p><strong>Customer:</strong> {activeReceipt.customerName}</p>
              <p><strong>Address:</strong> {activeReceipt.address}</p>
            </div>
            <div className="space-y-1 text-xs border-b border-dashed border-gray-400 pb-3 mb-3">
              {activeReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.quantity} {item.product.unit || "unit"} x {item.product.name}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between"><span>{t.subtotal}:</span><span>${activeReceipt.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>{t.tax}:</span><span>${activeReceipt.tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1"><span>{t.total}:</span><span>${activeReceipt.total.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 bg-gray-900 text-white py-2 text-xs font-bold rounded hover:bg-black cursor-pointer">{t.printReceipt}</button>
              <button onClick={() => setActiveReceipt(null)} className="px-3 bg-gray-200 text-gray-800 py-2 text-xs font-bold rounded hover:bg-gray-300 cursor-pointer">{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}