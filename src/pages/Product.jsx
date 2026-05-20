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

  const [form, setForm] = useState({
    productName: "",
    description: "",
    productPrice: "",
    sku: "",
    quantity: "",
  });

  const [image, setImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const key = search.toLowerCase();
      return (
        p.product_name?.toLowerCase().includes(key) ||
        p.sku?.toLowerCase().includes(key)
      );
    });
  }, [products, search]);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const { productName, productPrice, sku, quantity } = form;

    if (!productName || !productPrice || !sku || !quantity || !image) {
      alert("All fields required");
      return;
    }

    try {
      setLoading(true);

      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      const { error } = await supabase.from("products").insert([
        {
          product_name: productName,
          product_price: Number(productPrice),
          sku,
          quantity: Number(quantity),
          product_image: data.publicUrl,
          description: form.description,
        },
      ]);

      if (error) throw error;

      alert("Product Added");

      setForm({
        productName: "",
        description: "",
        productPrice: "",
        sku: "",
        quantity: "",
      });

      setImage(null);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          ...editData,
          product_price: Number(editData.product_price),
          quantity: Number(editData.quantity),
        })
        .eq("id", id);

      if (error) throw error;

      setEditId(null);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6">
      <h1 className="text-4xl font-bold mb-6">Products</h1>

      {/* ADD FORM */}
      <form onSubmit={handleAddProduct} className="grid gap-4 mb-8">
        <input
          placeholder="Product Name"
          value={form.productName}
          onChange={(e) =>
            setForm({ ...form, productName: e.target.value })
          }
        />

        <input
          placeholder="Price"
          type="number"
          value={form.productPrice}
          onChange={(e) =>
            setForm({ ...form, productPrice: e.target.value })
          }
        />

        <input
          placeholder="SKU"
          value={form.sku}
          onChange={(e) =>
            setForm({ ...form, sku: e.target.value })
          }
        />

        <input
          placeholder="Quantity"
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
        />

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.product_name}</td>
                <td>{p.sku}</td>
                <td>₹{p.product_price}</td>
                <td>{p.quantity}</td>

                <td>
                  <button onClick={() => navigate(`/product/${p.id}`)}>
                    <Eye size={16} />
                  </button>

                  <button onClick={() => handleDelete(p.id)}>
                    <Trash2 size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setEditId(p.id);
                      setEditData(p);
                    }}
                  >
                    <Pencil size={16} />
                  </button>

                  {editId === p.id && (
                    <button onClick={() => handleUpdate(p.id)}>
                      <Save size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}