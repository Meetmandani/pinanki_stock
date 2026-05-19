import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../supabase";

import {
  Package,
  IndianRupee,
  Hash,
  ImagePlus,
  Boxes,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
  ShoppingBag,
  Eye,
} from "lucide-react";

export default function Product() {
  const navigate = useNavigate();

  // Add Product States
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");

  const [productPrice, setProductPrice] = useState("");

  const [sku, setSku] = useState("");

  const [image, setImage] = useState(null);

  const [quantity, setQuantity] = useState("");

  // Main States
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Edit States
  const [editId, setEditId] = useState(null);

  const [editData, setEditData] = useState({});

  // Fetch Products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    setProducts(data);
  };

  // Filter Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = search.toLowerCase();

      return (
        product.product_name?.toLowerCase().includes(keyword) ||
        product.sku?.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  // Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!productName || !productPrice || !sku || !image || !quantity) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    // Upload Image
    const fileExt = image.name.split(".").pop();

    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, image);

    if (uploadError) {
      alert(uploadError.message);
      setLoading(false);
      return;
    }

    // Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(fileName);

    // Insert Product
    const { error } = await supabase.from("products").insert([
      {
        product_name: productName,
        product_price: Number(productPrice),
        sku,
        quantity: Number(quantity),
        product_image: publicUrl,
        description: description,
      },
    ]);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Reset
    setProductName("");
    setProductPrice("");
    setSku("");
    setQuantity("");
    setImage(null);
    setDescription("");

    fetchProducts();

    setLoading(false);

    alert("Product Added Successfully");
  };

  // Delete Product
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this product?");

    if (!confirmDelete) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchProducts();
  };

  // Edit Product
  const handleEdit = (product) => {
    setEditId(product.id);

    setEditData({
      product_name: product.product_name,

      product_price: product.product_price,

      sku: product.sku,
      description: product.description,

      quantity: product.quantity,
    });
  };

  // Update Product
  const handleUpdate = async (id) => {
    const { error } = await supabase
      .from("products")
      .update({
        product_name: editData.product_name,

        product_price: Number(editData.product_price),

        sku: editData.sku,

        quantity: Number(editData.quantity),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditId(null);

    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] overflow-x-hidden">
      {/* Background Blur */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-black/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />

      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-black/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />

      {/* Main */}
      <div className="md:ml-[280px] px-4 md:px-8 py-8 relative">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-black text-white p-4 rounded-3xl shadow-xl">
                <ShoppingBag size={28} />
              </div>

              <div>
                <p className="text-sm text-gray-500 uppercase tracking-[4px]">
                  Inventory System
                </p>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                  Products
                </h1>
              </div>
            </div>

            <p className="text-gray-500 text-lg">
              Modern inventory management dashboard
            </p>
          </div>

          {/* Stats */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[35px] p-6 shadow-2xl w-full xl:w-[340px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-2">Total Products</p>

                <h2 className="text-5xl font-black">{products.length}</h2>
              </div>

              <div className="bg-black text-white p-5 rounded-3xl shadow-xl">
                <Boxes size={34} />
              </div>
            </div>
          </div>
        </div>

        {/* Add Product */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] shadow-2xl p-5 md:p-10 mb-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-black text-white p-4 rounded-3xl shadow-xl">
              <Package size={28} />
            </div>

            <div>
              <h2 className="text-4xl font-black">Add Product</h2>

              <p className="text-gray-500 mt-1">Upload and manage inventory</p>
            </div>
          </div>

          <form
            onSubmit={handleAddProduct}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Product Name */}
            <div>
              <label className="text-sm text-gray-500 mb-3 block">
                Product Name
              </label>

              <div className="bg-white border border-gray-200 rounded-3xl px-5 flex items-center">
                <Package size={18} className="text-gray-400" />

                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-transparent outline-none p-5 text-lg"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-500 mb-3 block">
                Product Description
              </label>

              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm focus-within:border-black transition-all">
                <textarea
                  placeholder="Write product description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-transparent outline-none text-lg resize-none"
                />
              </div>
            </div>
            {/* Price */}
            <div>
              <label className="text-sm text-gray-500 mb-3 block">
                Product Price
              </label>

              <div className="bg-white border border-gray-200 rounded-3xl px-5 flex items-center">
                <IndianRupee size={18} className="text-gray-400" />

                <input
                  type="number"
                  placeholder="4999"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full bg-transparent outline-none p-5 text-lg"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm text-gray-500 mb-3 block">
                Quantity
              </label>

              <div className="bg-white border border-gray-200 rounded-3xl px-5 flex items-center">
                <Hash size={18} className="text-gray-400" />

                <input
                  type="number"
                  placeholder="10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-transparent outline-none p-5 text-lg"
                />
              </div>
            </div>

            {/* SKU */}
            <div>
              <label className="text-sm text-gray-500 mb-3 block">
                SKU Number
              </label>

              <div className="bg-white border border-gray-200 rounded-3xl px-5 flex items-center">
                <Hash size={18} className="text-gray-400" />

                <input
                  type="text"
                  placeholder="SKU-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-transparent outline-none p-5 text-lg"
                />
              </div>
            </div>

            {/* Upload */}
            <div className="md:col-span-2">
              <label className="text-sm text-gray-500 mb-3 block">
                Product Image
              </label>

              <label className="group bg-white border-2 border-dashed border-gray-300 rounded-[35px] p-12 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all">
                <div className="bg-black text-white p-6 rounded-[30px] mb-5 shadow-xl group-hover:scale-110 transition-all">
                  <ImagePlus size={34} />
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  Upload Product Image
                </h3>

                <p className="text-gray-500">PNG, JPG, WEBP supported</p>

                {image && (
                  <div className="mt-6 bg-black text-white px-5 py-3 rounded-2xl text-sm">
                    {image.name}
                  </div>
                )}

                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 bg-black text-white py-5 rounded-3xl text-lg font-bold hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-2xl"
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>

        {/* Product Table */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] shadow-2xl overflow-hidden">
          {/* Top */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 px-6 py-6 border-b border-gray-200">
            <div>
              <h2 className="text-4xl font-black">Product Inventory</h2>

              <p className="text-gray-500 mt-1">
                Search, edit and manage products
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-[350px]">
              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search product or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-black text-white">
                <tr>
                  <th className="text-left px-6 py-5">Product</th>

                  <th className="text-left px-6 py-5">SKU</th>

                  <th className="text-left px-6 py-5">Price</th>

                  <th className="text-left px-6 py-5">Quantity</th>

                  <th className="text-left px-6 py-5">Status</th>

                  <th className="text-left px-6 py-5">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="border-b border-gray-100 hover:bg-black/[0.03] transition-all duration-300 cursor-pointer group"
                  >
                    {/* Product */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="overflow-hidden rounded-3xl">
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="w-20 h-20 rounded-3xl object-cover shadow-lg group-hover:scale-110 transition-all duration-500"
                          />
                        </div>

                        <div>
                          {editId === product.id ? (
                            <input
                              type="text"
                              value={editData.product_name}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  product_name: e.target.value,
                                })
                              }
                              className="border rounded-2xl px-4 py-3 outline-none"
                            />
                          ) : (
                            <>
                              <h3 className="font-black text-xl">
                                {product.product_name}
                              </h3>

                              <p className="text-gray-500 text-sm mt-1">
                                Premium Product
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-6 py-5">
                      {editId === product.id ? (
                        <input
                          type="text"
                          value={editData.sku}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              sku: e.target.value,
                            })
                          }
                          className="border rounded-2xl px-4 py-3 outline-none"
                        />
                      ) : (
                        <div className="bg-gray-100 px-4 py-2 rounded-2xl inline-block">
                          {product.sku}
                        </div>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-5">
                      {editId === product.id ? (
                        <input
                          type="number"
                          value={editData.product_price}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              product_price: e.target.value,
                            })
                          }
                          className="border rounded-2xl px-4 py-3 outline-none"
                        />
                      ) : (
                        <h2 className="text-2xl font-black">
                          ₹{product.product_price}
                        </h2>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-5">
                      {editId === product.id ? (
                        <input
                          type="number"
                          value={editData.quantity}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              quantity: e.target.value,
                            })
                          }
                          className="border rounded-2xl px-4 py-3 outline-none"
                        />
                      ) : (
                        <div className="bg-black text-white px-5 py-2 rounded-2xl inline-block">
                          {product.quantity}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      {product.quantity <= 0 ? (
                        <div className="bg-red-100 text-red-600 px-4 py-2 rounded-2xl inline-block text-sm font-semibold">
                          Out of Stock
                        </div>
                      ) : product.quantity <= 5 ? (
                        <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-2xl inline-block text-sm font-semibold">
                          Low Stock
                        </div>
                      ) : (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl inline-block text-sm font-semibold">
                          In Stock
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {/* View */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            navigate(`/product/${product.id}`);
                          }}
                          className="bg-gray-200 p-3 rounded-2xl hover:scale-105 transition-all"
                        >
                          <Eye size={18} />
                        </button>

                        {editId === product.id ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                handleUpdate(product.id);
                              }}
                              className="bg-black text-white p-3 rounded-2xl hover:scale-105 transition-all"
                            >
                              <Save size={18} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                setEditId(null);
                              }}
                              className="bg-gray-200 p-3 rounded-2xl hover:scale-105 transition-all"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                handleEdit(product);
                              }}
                              className="bg-black text-white p-3 rounded-2xl hover:scale-105 transition-all"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                handleDelete(product.id);
                              }}
                              className="bg-red-500 text-white p-3 rounded-2xl hover:scale-105 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
