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
  <div className="bg-[#f0f0f0] min-h-screen p-2 md:p-6 print:p-0">
  <div
  id="invoice"
  className="
  w-full

  max-w-[210mm]
  min-h-[297mm]

  mx-auto

  bg-white

  shadow-xl
  print:shadow-none

  overflow-hidden

  print:max-w-none
  print:w-[210mm]
  print:min-h-[297mm]

  print:m-0
  print:rounded-none

  text-[13px]
  "
>
      {/* HEADER */}

      <div
        className="
        bg-black
        text-white

        px-6
        py-6

        print:px-5
        print:py-5

        flex
        justify-between
        items-start
        "
      >
        <div>
          <p
            className="
            text-black
            uppercase
            tracking-[4px]
            text-[9px]
            mb-2
            "
          >
            Tax Invoice
          </p>

          <h2 className="text-2xl font-black">
            #
            {Math.floor(
              Math.random() * 99999
            )
              .toString()
              .padStart(5, "0")}
          </h2>

          <p className="text-black text-xs mt-2">
            {new Date().toLocaleDateString(
              "en-IN",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </p>
        </div>

        <div className="text-right">
          <h1 className="text-4xl font-black">
            INVOICE
          </h1>

          <p className="text-black text-xs mt-1">
            Pinanki Solutions
          </p>

          <p className="text-black text-xs">
            Surat, Gujarat
          </p>
        </div>
      </div>

      {/* BODY */}

      <div
        className="
        px-6
        py-6

        print:px-5
        print:py-5
        "
      >
        {/* CUSTOMER */}

        <div className="grid grid-cols-2 gap-6 mb-6">

          <div>
            <p className="text-black uppercase text-[10px] tracking-[3px] mb-2">
              Bill To
            </p>

            <h2 className="text-2xl font-black">
              {customerName ||
                "Walk-in Customer"}
            </h2>

            {customerPhone && (
              <p className="text-black flex gap-2 mt-2 text-sm">
                <Phone size={13}/>
                {customerPhone}
              </p>
            )}

            {customerAddress && (
              <p className="text-black flex gap-2 mt-2 text-sm whitespace-pre-line">
                <MapPin
                  size={13}
                  className="mt-1 shrink-0"
                />
                {customerAddress}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-black uppercase text-[10px] tracking-[3px] mb-2">
              From
            </p>

            <h2 className="text-2xl font-black">
              Pinanki Solutions
            </h2>

            <p className="text-black text-sm">
              Premium Inventory System
            </p>

            <p className="text-black text-sm">
              +91 9925056938
            </p>

            <p className="text-black text-sm">
              Surat, Gujarat
            </p>
          </div>

        </div>

        {/* TABLE */}

        <table className="w-full">

          <thead>

            <tr className="bg-black text-white">

              <th className="p-3 text-left rounded-l-xl">
                #
              </th>

              <th className="p-3 text-left">
                Product
              </th>

              <th className="p-3 text-center">
                Qty
              </th>

              <th className="p-3 text-right">
                Price
              </th>

              <th className="p-3 text-right rounded-r-xl">
                Amount
              </th>

            </tr>

          </thead>

          <tbody>

            {cart.map(
              (item, index) => (

                <tr
                  key={item.id}
                  className="
                  border-b
                  border-gray-100
                  "
                >

                  <td className="p-3 text-black">
                    {index + 1}
                  </td>

                  <td className="p-3">

                    <div className="flex gap-3 items-center">

                      <img
                        src={item.product_image}
                        alt=""
                        className="
                        w-10
                        h-10

                        object-cover
                        rounded-lg
                        "
                      />

                      <div>

                        <p className="font-semibold">
                          {item.product_name}
                        </p>

                        <p className="text-black text-xs">
                          {item.sku}
                        </p>

                      </div>

                    </div>

                  </td>

                  <td className="text-center p-3">
                    {item.quantity}
                  </td>

                  <td className="text-right p-3">
                    ₹
                    {item.product_price.toLocaleString()}
                  </td>

                  <td className="text-right p-3 font-bold">
                    ₹
                    {item.total.toLocaleString()}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

        {/* TOTAL */}

        <div className="flex justify-end mt-5">

          <div className="w-[240px]">

            <div className="space-y-2 mb-3 text-sm">

              <div className="flex justify-between">

                <span>
                  Subtotal
                </span>

                <span>
                  ₹
                  {grandTotal.toLocaleString()}
                </span>

              </div>

              <div className="flex justify-between">

                <span>
                  Discount
                </span>

                <span>
                  ₹0
                </span>

              </div>

              <div className="flex justify-between">

                <span>
                  GST
                </span>

                <span>
                  ₹0
                </span>

              </div>

            </div>

            <div
              className="
              bg-white
              text-black

              rounded-xl

              px-5
              py-4

              flex
              justify-between
              "
            >

              <span>
                TOTAL
              </span>

              <span className="text-xl font-black">
                ₹
                {grandTotal.toLocaleString()}
              </span>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div
          className="
          mt-8
          pt-5

          border-t

          flex
          justify-between
          items-end
          "
        >

          <div>

            <p className="text-black text-xs max-w-xs">
              Thank you for
              choosing
              Pinanki Solutions.
            </p>

            <p className="text-black text-[10px] mt-2">
              Computer generated invoice.
            </p>

          </div>

          <div className="text-right">

            <div className="border-t pt-2">

              <p className="text-xs text-black">
                Authorized Signature
              </p>

              <p className="font-bold">
                Pinanki Solutions
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

    {/* BUTTONS */}

    <div
      className="
      max-w-4xl
      mx-auto

      mt-4

      flex
      gap-3

      print:hidden
      "
    >

      <button
        onClick={() =>
          setShowInvoice(false)
        }
        className="
        flex-1

        bg-white

        border

        py-4

        rounded-xl

        font-bold
        "
      >
        ← Back
      </button>

      <button
        onClick={handlePrint}
        disabled={loading}
        className="
        flex-1

        bg-black
        text-white

        py-4

        rounded-xl

        font-bold
        "
      >
        <Printer
          size={18}
          className="inline mr-2"
        />

        {loading
          ? "Processing..."
          : "Print Invoice"}

      </button>

    </div>

  </div>
)}
    </div>
  );
}