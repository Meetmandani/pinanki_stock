import { useEffect, useState } from "react";
import { supabase } from "../supabase";

import {
  User,
  Phone,
  MapPin,
  Printer,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";

export default function Bill() {

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerAddress, setCustomerAddress] =
    useState("");

  const [showInvoice, setShowInvoice] =
    useState(false);

  const [loading, setLoading] = useState(false);

  // Fetch Products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setProducts(data);
  };

  // Add To Cart
  const addToCart = (product) => {

    if (product.quantity <= 0) return;

    const existing = cart.find(
      (item) => item.id === product.id
    );

    if (existing) {

      if (
        existing.quantity >= product.quantity
      ) {
        alert("Stock limit reached");
        return;
      }

      const updated = cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              total:
                (item.quantity + 1) *
                item.product_price,
            }
          : item
      );

      setCart(updated);

    } else {

      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          total: product.product_price,
        },
      ]);
    }
  };

  // Increase Qty
  const increaseQty = (id) => {

    const product = products.find(
      (p) => p.id === id
    );

    const existing = cart.find(
      (item) => item.id === id
    );

    if (
      existing.quantity >= product.quantity
    ) {
      alert("No more stock available");
      return;
    }

    const updated = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
            total:
              (item.quantity + 1) *
              item.product_price,
          }
        : item
    );

    setCart(updated);
  };

  // Decrease Qty
  const decreaseQty = (id) => {

    const updated = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
              total:
                (item.quantity - 1) *
                item.product_price,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(updated);
  };

  // Total
  const grandTotal = cart.reduce(
    (acc, item) => acc + item.total,
    0
  );

  // Generate Invoice
  const generateInvoice = () => {

    if (cart.length === 0) {
      alert("Please add products");
      return;
    }

    setShowInvoice(true);
  };

  // Print Invoice
  const handlePrint = async () => {

    setLoading(true);

    for (const item of cart) {

      const product = products.find(
        (p) => p.id === item.id
      );

      const updatedQty =
        product.quantity - item.quantity;

      await supabase
        .from("products")
        .update({
          quantity: updatedQty,
        })
        .eq("id", item.id);
    }

    setLoading(false);

    window.print();

    setCart([]);

    setShowInvoice(false);

    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">

      {/* MAIN PAGE */}
      {!showInvoice && (

        <div className="md:ml-[280px] p-4 md:p-8">

          {/* Header */}
          <div className="mb-10">

            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              Billing
            </h1>

            <p className="text-gray-500 mt-3">
              Create premium invoices
            </p>

          </div>

          <div className="grid xl:grid-cols-12 gap-8">

            {/* LEFT SIDE */}
            <div className="xl:col-span-5 space-y-8">

              {/* Customer Details */}
              <div className="bg-white rounded-[35px] p-6 md:p-8 shadow-xl">

                <h2 className="text-3xl font-black mb-8">
                  Customer Details
                </h2>

                <div className="space-y-5">

                  {/* Name */}
                  <div>

                    <label className="text-sm text-gray-500 block mb-2">
                      Customer Name
                    </label>

                    <div className="border border-gray-200 rounded-2xl px-5 flex items-center">

                      <User
                        size={18}
                        className="text-gray-400"
                      />

                      <input
                        type="text"
                        placeholder="Customer Name"
                        value={customerName}
                        onChange={(e) =>
                          setCustomerName(
                            e.target.value
                          )
                        }
                        className="w-full p-4 outline-none bg-transparent"
                      />

                    </div>

                  </div>

                  {/* Phone */}
                  <div>

                    <label className="text-sm text-gray-500 block mb-2">
                      Phone Number
                    </label>

                    <div className="border border-gray-200 rounded-2xl px-5 flex items-center">

                      <Phone
                        size={18}
                        className="text-gray-400"
                      />

                      <input
                        type="text"
                        placeholder="9876543210"
                        value={customerPhone}
                        onChange={(e) =>
                          setCustomerPhone(
                            e.target.value
                          )
                        }
                        className="w-full p-4 outline-none bg-transparent"
                      />

                    </div>

                  </div>

                  {/* Address */}
                  <div>

                    <label className="text-sm text-gray-500 block mb-2">
                      Address
                    </label>

                    <div className="border border-gray-200 rounded-2xl px-5 flex items-start">

                      <MapPin
                        size={18}
                        className="text-gray-400 mt-4"
                      />

                      <textarea
                        placeholder="Customer Address"
                        value={customerAddress}
                        onChange={(e) =>
                          setCustomerAddress(
                            e.target.value
                          )
                        }
                        className="w-full h-28 p-4 outline-none resize-none bg-transparent"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* Generate Button */}
              <button
                onClick={generateInvoice}
                className="w-full bg-black text-white py-5 rounded-[25px] text-lg font-bold hover:scale-[1.01] transition-all"
              >
                Generate Invoice
              </button>

            </div>

            {/* RIGHT SIDE PRODUCTS */}
            <div className="xl:col-span-7">

              <div className="bg-white rounded-[35px] shadow-xl p-6 md:p-8">

                <div className="flex items-center justify-between mb-8">

                  <div>

                    <h2 className="text-3xl font-black">
                      Products
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Click product to add in bill
                    </p>

                  </div>

                  <div className="bg-black text-white px-5 py-3 rounded-2xl">
                    {cart.length} Items
                  </div>

                </div>

                {/* Products Grid */}
                <div className="grid md:grid-cols-2 gap-6">

                  {products.map((product) => {

                    const outOfStock =
                      product.quantity <= 0;

                    const lowStock =
                      product.quantity <= 5;

                    return (

                      <div
                        key={product.id}
                        onClick={() =>
                          !outOfStock &&
                          addToCart(product)
                        }
                        className={`border rounded-[30px] overflow-hidden transition-all duration-300

                        ${
                          outOfStock
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:-translate-y-1 hover:shadow-xl"
                        }
                        `}
                      >

                        {/* Image */}
                        <div className="relative">

                          <img
                            src={
                              product.product_image
                            }
                            alt=""
                            className="w-full h-56 object-cover"
                          />

                          {outOfStock ? (

                            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                              Out Of Stock
                            </div>

                          ) : lowStock ? (

                            <div className="absolute top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">

                              <AlertTriangle size={14} />

                              Low Stock

                            </div>

                          ) : (

                            <div className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold">
                              Stock :
                              {" "}
                              {product.quantity}
                            </div>

                          )}

                        </div>

                        {/* Content */}
                        <div className="p-5">

                          <div className="flex justify-between items-start">

                            <div>

                              <h2 className="text-2xl font-black">
                                {
                                  product.product_name
                                }
                              </h2>

                              <p className="text-gray-500 mt-1">
                                {product.sku}
                              </p>

                            </div>

                            <h2 className="text-3xl font-black">
                              ₹
                              {
                                product.product_price
                              }
                            </h2>

                          </div>

                          <button className="mt-6 w-full bg-black text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2">

                            <ShoppingBag size={18} />

                            Add To Bill

                          </button>

                        </div>

                      </div>

                    );
                  })}

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* PRINTABLE INVOICE PAGE */}
      {showInvoice && (

        <div className="bg-[#f8f8f8] min-h-screen p-4 md:p-10 print:p-0">

          <div
            id="invoice"
            className="max-w-6xl mx-auto bg-white min-h-screen p-6 md:p-12 shadow-2xl print:shadow-none"
          >

            {/* Header */}
            <div className="flex justify-between items-start border-b pb-8">

              <div>

                <p className="text-gray-500 text-sm uppercase tracking-[4px]">
                  Invoice
                </p>

                <h2 className="text-2xl font-black mt-4">
                  #
                  {Math.floor(
                    Math.random() * 99999
                  )}
                </h2>

                <p className="text-gray-500 mt-3">
                  {new Date().toLocaleDateString()}
                </p>

              </div>

              <div className="text-right">

                <h1 className="text-6xl font-black tracking-[5px]">
                  INVOICE
                </h1>

                <p className="text-gray-500 mt-4">
                  Pinanki Solutions
                </p>

                <p className="text-gray-500">
                  Surat, Gujarat
                </p>

              </div>

            </div>

            {/* Customer & Company */}
            <div className="grid md:grid-cols-2 gap-10 mt-10">

              {/* Customer */}
              <div>

                <p className="text-gray-400 uppercase tracking-[3px] text-sm mb-4">
                  Invoice To
                </p>

                <h2 className="text-3xl font-black">
                  {customerName ||
                    "Walk-in Customer"}
                </h2>

                {customerPhone && (
                  <p className="text-gray-500 mt-4">
                    {customerPhone}
                  </p>
                )}

                {customerAddress && (
                  <p className="text-gray-500 mt-2 whitespace-pre-line">
                    {customerAddress}
                  </p>
                )}

              </div>

              {/* Company */}
              <div className="text-right">

                <p className="text-gray-400 uppercase tracking-[3px] text-sm mb-4">
                  Company
                </p>

                <h2 className="text-3xl font-black">
                  Pinanki Solutions
                </h2>

                <p className="text-gray-500 mt-4">
                  Premium Inventory System
                </p>

                <p className="text-gray-500">
                  +91 9876543210
                </p>

              </div>

            </div>

            {/* Table */}
            <div className="mt-12 overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-black text-white">

                    <th className="text-left p-5 rounded-l-2xl">
                      Description
                    </th>

                    <th className="text-center p-5">
                      Qty
                    </th>

                    <th className="text-right p-5">
                      Price
                    </th>

                    <th className="text-right p-5 rounded-r-2xl">
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {cart.map((item) => (

                    <tr
                      key={item.id}
                      className="border-b"
                    >

                      <td className="py-6">

                        <div className="flex items-center gap-4">

                          <img
                            src={
                              item.product_image
                            }
                            alt=""
                            className="w-16 h-16 rounded-2xl object-cover"
                          />

                          <div>

                            <h2 className="font-bold text-lg">
                              {
                                item.product_name
                              }
                            </h2>

                            <p className="text-gray-500 text-sm">
                              {item.sku}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="text-center font-semibold">
                        {item.quantity}
                      </td>

                      <td className="text-right font-semibold">
                        ₹
                        {
                          item.product_price
                        }
                      </td>

                      <td className="text-right font-bold text-lg">
                        ₹{item.total}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* Total */}
            <div className="flex justify-end mt-10">

              <div className="bg-[#f5f5f7] rounded-[30px] p-8 w-full max-w-sm">

                <div className="flex justify-between mb-5">

                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    ₹{grandTotal}
                  </span>

                </div>

                <div className="flex justify-between mb-5">

                  <span className="text-gray-500">
                    Tax
                  </span>

                  <span className="font-semibold">
                    ₹0
                  </span>

                </div>

                <div className="border-t pt-5 flex justify-between items-center">

                  <span className="text-3xl font-black">
                    TOTAL
                  </span>

                  <span className="text-4xl font-black">
                    ₹{grandTotal}
                  </span>

                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="mt-16 border-t pt-8">

              <p className="text-gray-500 leading-7">
                Thank you for choosing
                Pinanki Solutions.
                We appreciate your trust and
                support.
              </p>

            </div>

            {/* Buttons */}
            <div className="mt-12 flex gap-5 print:hidden">

              <button
                onClick={() =>
                  setShowInvoice(false)
                }
                className="flex-1 border border-black py-5 rounded-2xl font-bold"
              >
                Back
              </button>

              <button
                onClick={handlePrint}
                disabled={loading}
                className="flex-1 bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3"
              >

                <Printer size={20} />

                {loading
                  ? "Processing..."
                  : "Print Invoice"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}