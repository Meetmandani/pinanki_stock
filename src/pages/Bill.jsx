import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import {
  Search,
  User,
  Phone,
  MapPin,
  Printer,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  Package,
  Receipt,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Bill() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });
    if (error) { console.log(error); return; }
    setProducts(data);
  };

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.product_name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      String(p.product_price).includes(term)
    );
  });

  const getCartItem = (productId) => cart.find((item) => item.id === productId);
  const getCartQty = (productId) => {
    const item = getCartItem(productId);
    return item ? item.quantity : 0;
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) return;
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        alert("Stock limit reached");
        return;
      }
      setCart(cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.product_price }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, total: product.product_price }]);
    }
  };

  const increaseQty = (id) => {
    const product = products.find((p) => p.id === id);
    const existing = cart.find((item) => item.id === id);
    if (existing.quantity >= product.quantity) {
      alert("No more stock available");
      return;
    }
    setCart(cart.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.product_price }
        : item
    ));
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1, total: (item.quantity - 1) * item.product_price }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const grandTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const generateInvoice = () => {
    if (cart.length === 0) {
      alert("Please add products");
      return;
    }
    setShowInvoice(true);
  };

  const handlePrint = async () => {
    setLoading(true);
    for (const item of cart) {
      const product = products.find((p) => p.id === item.id);
      const updatedQty = product.quantity - item.quantity;
      await supabase.from("products").update({ quantity: updatedQty }).eq("id", item.id);
    }
    setLoading(false);
    window.print();
    setCart([]);
    setShowInvoice(false);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-white" >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .qty-btn { transition: all 0.15s ease; }
        .qty-btn:active { transform: scale(0.88); }
        .product-card { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .product-card:hover:not(.out-of-stock) { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
        .cart-item { animation: slideIn 0.2s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .badge-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .in-cart-overlay { backdrop-filter: blur(0px); }
        @media print {
          .print-hidden { display: none !important; }
          body { background: white; }
        }
      `}</style>

      {/* MAIN PAGE */}
      {!showInvoice && (
       <div className="p-4 md:p-8 pb-16 max-w-[1600px]  pt-24">
          {/* Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 3 }} className="text-gray-400 uppercase">POS System</span>
              </div>
              <h1 style={{  fontWeight: 900, fontSize: 'clamp(40px, 7vw, 72px)', lineHeight: 1, letterSpacing: -3 }}>
                Billing
              </h1>
              <p className="text-gray-400 mt-2 text-sm">Click products to add · Manage quantities inline</p>
            </div>

            {/* Cart Summary Pill */}
            {cart.length > 0 && (
              <div className="bg-black text-white rounded-[20px] px-5 py-3 flex items-center gap-3">
                <ShoppingBag size={16} />
                <div>
                  <div className="text-xs text-gray-400">Cart Total</div>
                  <div className="font-bold text-lg leading-none">₹{grandTotal.toLocaleString()}</div>
                </div>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            )}
          </div>

          <div className="grid xl:grid-cols-12 gap-8">
            {/* LEFT PANEL */}
            <div className="xl:col-span-4 space-y-6">

              {/* Customer Card */}
              <div className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold">Customer Details</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 font-medium uppercase tracking-widest block mb-1.5">Name</label>
                    <div className="border border-gray-200 rounded-2xl px-4 flex items-center gap-3 focus-within:border-black transition-colors">
                      <User size={15} className="text-gray-300 shrink-0" />
                      <input
                        type="text"
                        placeholder="Customer name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full py-3.5 text-sm outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-medium uppercase tracking-widest block mb-1.5">Phone</label>
                    <div className="border border-gray-200 rounded-2xl px-4 flex items-center gap-3 focus-within:border-black transition-colors">
                      <Phone size={15} className="text-gray-300 shrink-0" />
                      <input
                        type="text"
                        placeholder="9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full py-3.5 text-sm outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-medium uppercase tracking-widest block mb-1.5">Address</label>
                    <div className="border border-gray-200 rounded-2xl px-4 flex items-start gap-3 focus-within:border-black transition-colors">
                      <MapPin size={15} className="text-gray-300 shrink-0 mt-3.5" />
                      <textarea
                        placeholder="Street, City, State"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full h-24 py-3.5 text-sm outline-none resize-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              {cart.length > 0 && (
                <div className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                        <ShoppingBag size={16} className="text-white" />
                      </div>
                      <h2 className="text-xl font-bold">Cart</h2>
                    </div>
                    <span className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {totalItems} items
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item flex items-center gap-3 bg-[#f8f8f8] rounded-2xl p-3">
                        <img src={item.product_image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{item.product_name}</p>
                          <p className="text-gray-400 text-xs">₹{item.product_price} each</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className="qty-btn w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 hover:border-black"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center font-bold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => increaseQty(item.id)}
                            className="qty-btn w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="qty-btn w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center ml-1 hover:bg-red-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-5 pt-5 border-t border-dashed border-gray-200">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-semibold text-black">₹{grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>Tax</span>
                      <span className="font-semibold text-black">₹0</span>
                    </div>
                    <div className="flex justify-between items-center bg-black text-white rounded-2xl px-5 py-4">
                      <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                      <span className="text-2xl font-black">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Invoice Button */}
              <button
                onClick={generateInvoice}
                className="w-full bg-black text-white py-5 rounded-[22px] font-bold flex items-center justify-center gap-2.5 hover:bg-gray-900 transition-all active:scale-[0.98] shadow-xl shadow-black/20"
              >
                <Receipt size={20} />
                Generate Invoice
                {cart.length > 0 && (
                  <span className="bg-white text-black text-xs font-bold px-2.5 py-1 rounded-full ml-1">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>

            {/* RIGHT PANEL – Products Grid */}
            <div className="xl:col-span-8">
              <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-7">
                {/* Panel Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                      <Package size={16} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Products</h2>
                      <p className="text-xs text-gray-400">Click to add · Use +/− to adjust quantity</p>
                    </div>
                  </div>
                  <div className="bg-[#f0f0f0] rounded-xl px-4 py-2 text-sm font-bold">
                    {filteredProducts.length} products
                  </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="flex items-center bg-[#f5f5f5] rounded-2xl px-4 py-3 gap-3 focus-within:bg-white focus-within:border focus-within:border-black transition-all border border-transparent">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search by name, SKU, price..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="text-gray-400 hover:text-black text-xs font-bold transition">
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map((product) => {
                    const outOfStock = product.quantity <= 0;
                    const lowStock = product.quantity > 0 && product.quantity <= 5;
                    const cartQty = getCartQty(product.id);
                    const inCart = cartQty > 0;
                    const maxReached = inCart && cartQty >= product.quantity;

                    return (
                      <div
                        key={product.id}
                        className={`product-card bg-white border rounded-[24px] overflow-hidden ${outOfStock ? "out-of-stock opacity-50 cursor-not-allowed" : "cursor-pointer"} ${inCart ? "border-black border-2" : "border-gray-100"}`}
                        style={{ boxShadow: inCart ? '0 0 0 1px black, 0 8px 30px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.05)' }}
                      >
                        {/* Image */}
                        <div className="relative overflow-hidden">
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="w-full h-44 object-cover"
                            style={{ transition: 'transform 0.3s ease' }}
                          />
                          {/* Stock Badge */}
                          <div className="absolute top-3 left-3">
                            {outOfStock ? (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">Out of Stock</span>
                            ) : lowStock ? (
                              <span className="bg-amber-400 text-black text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <AlertTriangle size={10} />
                                Low: {product.quantity}
                              </span>
                            ) : (
                              <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                                {product.quantity} left
                              </span>
                            )}
                          </div>

                          {/* In-Cart Indicator */}
                          {inCart && (
                            <div className="absolute top-3 right-3 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Sparkles size={9} />
                              In Cart
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-base leading-tight pr-2">{product.product_name}</h3>
                            <span className="font-black text-lg shrink-0">₹{product.product_price}</span>
                          </div>
                          <p className="text-gray-400 text-xs mb-4" style={{ fontFamily: "'DM Mono', monospace" }}>{product.sku}</p>

                          {/* Quantity Controls or Add Button */}
                          {!outOfStock && (
                            inCart ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); decreaseQty(product.id); }}
                                  className="qty-btn flex-1 h-10 bg-[#f0f0f0] hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center justify-center font-bold transition-colors"
                                >
                                  <Minus size={15} />
                                </button>

                                <div className="flex flex-col items-center justify-center h-10 px-3 bg-black text-white rounded-xl min-w-[48px]">
                                  <span className="font-black text-base leading-none">{cartQty}</span>
                                  <span className="text-[9px] text-gray-400 leading-none mt-0.5">in cart</span>
                                </div>

                                <button
                                  onClick={(e) => { e.stopPropagation(); increaseQty(product.id); }}
                                  disabled={maxReached}
                                  className={`qty-btn flex-1 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${maxReached ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`}
                                >
                                  <Plus size={15} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product)}
                                className="qty-btn w-full h-10 bg-[#f0f0f0] hover:bg-black hover:text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                              >
                                <ShoppingBag size={14} />
                                Add to Bill
                              </button>
                            )
                          )}

                          {outOfStock && (
                            <div className="w-full h-10 bg-red-50 text-red-400 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                              Unavailable
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-20 text-gray-400">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No products found</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE */}
      {showInvoice && (
        <div className="bg-[#f0f0f0] min-h-screen p-4 md:p-10 print:p-0">
          <div
            id="invoice"
            className="max-w-5xl mx-auto bg-white min-h-screen shadow-2xl print:shadow-none"
          >
            {/* Invoice Header */}
            <div className="bg-black text-white px-10 py-12 flex justify-between items-start">
              <div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 4 }} className="text-gray-500 uppercase mb-4">Tax Invoice</p>
                <h2 className="text-4xl font-black tracking-tight">#{Math.floor(Math.random() * 99999).toString().padStart(5, '0')}</h2>
                <p className="text-gray-400 mt-3 text-sm">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <h1 style={{ fontWeight: 900, letterSpacing: -2, fontSize: 52 }} className="text-white">INVOICE</h1>
                <p className="text-gray-400 mt-2 text-sm">Pinanki Solutions</p>
                <p className="text-gray-500 text-sm">Surat, Gujarat</p>
              </div>
            </div>

            <div className="px-10 py-10">
              {/* Bill To / From */}
              <div className="grid md:grid-cols-2 gap-10 mb-12">
                <div>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3 }} className="text-gray-400 uppercase mb-3">Bill To</p>
                  <h2 className="text-3xl font-black">{customerName || "Walk-in Customer"}</h2>
                  {customerPhone && <p className="text-gray-500 mt-3 flex items-center gap-2"><Phone size={14} />{customerPhone}</p>}
                  {customerAddress && <p className="text-gray-500 mt-2 flex items-start gap-2 whitespace-pre-line"><MapPin size={14} className="shrink-0 mt-0.5" />{customerAddress}</p>}
                </div>
                <div className="text-right">
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3 }} className="text-gray-400 uppercase mb-3">From</p>
                  <h2 className="text-3xl font-black">Pinanki Solutions</h2>
                  <p className="text-gray-500 mt-3">Premium Inventory System</p>
                  <p className="text-gray-500">+91 9876543210</p>
                  <p className="text-gray-500">Surat, Gujarat</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="text-left p-4 rounded-l-2xl text-sm font-semibold tracking-wider">#</th>
                    <th className="text-left p-4 text-sm font-semibold tracking-wider">Product</th>
                    <th className="text-center p-4 text-sm font-semibold tracking-wider">Qty</th>
                    <th className="text-right p-4 text-sm font-semibold tracking-wider">Unit Price</th>
                    <th className="text-right p-4 rounded-r-2xl text-sm font-semibold tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-5 px-4 text-gray-400 text-sm">{String(index + 1).padStart(2, '0')}</td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-4">
                          <img src={item.product_image} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                          <div>
                            <p className="font-bold">{item.product_name}</p>
                            <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-5 px-4">
                        <span className="bg-black text-white font-bold px-3 py-1.5 rounded-lg text-sm">{item.quantity}</span>
                      </td>
                      <td className="text-right py-5 px-4 font-medium text-gray-600">₹{item.product_price.toLocaleString()}</td>
                      <td className="text-right py-5 px-4 font-black text-lg">₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mt-10">
                <div className="w-full max-w-xs">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-semibold">₹{grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Discount</span>
                      <span className="font-semibold">₹0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tax (GST)</span>
                      <span className="font-semibold">₹0</span>
                    </div>
                  </div>
                  <div className="bg-black text-white rounded-2xl px-6 py-5 flex justify-between items-center">
                    <span className="font-bold uppercase tracking-widest text-sm">Total</span>
                    <span className="font-black text-3xl">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-end">
                <div>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                    Thank you for choosing Pinanki Solutions. We appreciate your trust and support.
                  </p>
                  <p className="text-gray-300 text-xs mt-3" style={{ fontFamily: "'DM Mono', monospace" }}>
                    This is a computer-generated invoice.
                  </p>
                </div>
                <div className="text-right">
                  <div className="border-t border-black pt-3 mt-12">
                    <p className="text-xs text-gray-400">Authorized Signature</p>
                    <p className="font-bold mt-1">Pinanki Solutions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-5xl mx-auto mt-6 flex gap-4 print:hidden">
            <button
              onClick={() => setShowInvoice(false)}
              className="flex-1 bg-white border border-gray-200 py-5 rounded-2xl font-bold hover:border-black transition-colors"
            >
              ← Back to Billing
            </button>
            <button
              onClick={handlePrint}
              disabled={loading}
              className="flex-1 bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors disabled:opacity-60"
            >
              <Printer size={20} />
              {loading ? "Processing..." : "Print Invoice"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}