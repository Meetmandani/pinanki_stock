import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import {
  Package,
  IndianRupee,
  Hash,
  ImagePlus,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
  ShoppingBag,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowUpRight,
  Layers,
  FileText,
} from "lucide-react";

export default function Product() {
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [sku, setSku] = useState("");
  const [image, setImage] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("inventory");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (error) { console.log(error); return; }
    setProducts(data);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = search.toLowerCase();
      return product.product_name?.toLowerCase().includes(keyword) || product.sku?.toLowerCase().includes(keyword);
    });
  }, [products, search]);

  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.quantity > 5).length,
    lowStock: products.filter(p => p.quantity > 0 && p.quantity <= 5).length,
    outOfStock: products.filter(p => p.quantity <= 0).length,
    totalValue: products.reduce((acc, p) => acc + (p.product_price * p.quantity), 0),
  }), [products]);

  const handleImageChange = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productName || !productPrice || !sku || !image || !quantity) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("products").upload(fileName, image);
    if (uploadError) { alert(uploadError.message); setLoading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
    const { error } = await supabase.from("products").insert([{
      product_name: productName,
      product_price: Number(productPrice),
      sku,
      quantity: Number(quantity),
      product_image: publicUrl,
      description,
      p_price: Number(purchasePrice),
    }]);
    if (error) { alert(error.message); setLoading(false); return; }
    setProductName(""); setProductPrice(""); setSku(""); setQuantity("");
    setImage(null); setDescription(""); setPurchasePrice(""); setPreview(null);
    fetchProducts();
    setLoading(false);
    setActiveTab("inventory");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setEditData({
      product_name: product.product_name,
      product_price: product.product_price,
      sku: product.sku,
      description: product.description,
      quantity: product.quantity,
      p_price: product.p_price,
    });
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase.from("products").update({
      product_name: editData.product_name,
      product_price: Number(editData.product_price),
      sku: editData.sku,
      quantity: Number(editData.quantity),
      p_price: Number(editData.p_price),
      description: editData.description,
    }).eq("id", id);
    if (error) { alert(error.message); return; }
    setEditId(null);
    fetchProducts();
  };

  const margin = (sp, pp) => pp > 0 ? (((sp - pp) / pp) * 100).toFixed(1) : "—";

  return (
    <div className="min-h-screen" style={{ background: 'white'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f0f0f0; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }

        .stat-card {
          background: white;
          border: 1.5px solid #ebebeb;
          border-radius: 22px;
          padding: 22px 24px;
          transition: all 0.2s ease;
        }
        .stat-card:hover { border-color: #000; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }

        .panel { background: white; border: 1.5px solid #ebebeb; border-radius: 28px; overflow: hidden; }

        .input-wrap {
          background: #f7f7f5;
          border: 1.5px solid #e8e8e8;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          transition: border-color 0.2s, background 0.2s;
        }
        .input-wrap:focus-within { border-color: black; background: white; }
        .input-wrap input, .input-wrap textarea {
          background: transparent; border: none; outline: none;
          width: 100%; padding: 14px 0;
          font-size: 15px; color: #111;
        }
        .input-wrap textarea { resize: none; }
        .input-wrap input::placeholder, .input-wrap textarea::placeholder { color: #bbb; }

        .field-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 2px; color: #999;
          display: block; margin-bottom: 8px; text-transform: uppercase;
        }

        .tab-pill { display: flex; gap: 4px; background: #f0f0ee; border-radius: 14px; padding: 5px; width: fit-content; }
        .tab-btn { padding: 9px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; transition: all 0.18s;  display: flex; align-items: center; gap: 7px; }
        .tab-active { background: white; color: black; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .tab-inactive { background: transparent; color: #999; }
        .tab-inactive:hover { color: #555; }

        .tbl-head th {
          text-align: left; padding: 12px 20px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 2px; color: #999; font-weight: 500;
          background: #fafafa; border-bottom: 1.5px solid #ebebeb;
        }

        .product-row { border-bottom: 1px solid #f3f3f3; transition: background 0.15s; cursor: pointer; }
        .product-row:hover { background: #fafafa; }
        .product-row:hover .row-chevron { opacity: 1; transform: translateX(0); }
        .row-chevron { opacity: 0; transform: translateX(-5px); transition: all 0.2s; }

        .edit-input {
          border: 1.5px solid #e0e0e0; border-radius: 10px;
          padding: 7px 12px; outline: none;
          font-family: 'JetBrains Mono', monospace; font-size: 13px;
          width: 120px; color: #111; background: #f7f7f5;
        }
        .edit-input:focus { border-color: black; background: white; }

        .action-btn {
          width: 34px; height: 34px; border-radius: 10px;
          border: 1.5px solid transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0;
        }
        .action-btn:hover { transform: scale(1.08); }
        .action-btn-view { background: #f3f3f3; border-color: #e8e8e8; color: #666; }
        .action-btn-edit { background: #111; border-color: #111; color: white; }
        .action-btn-save { background: #f0faf4; border-color: #86efac; color: #16a34a; }
        .action-btn-cancel { background: #f3f3f3; border-color: #e8e8e8; color: #666; }
        .action-btn-delete { background: #fff5f5; border-color: #fecaca; color: #dc2626; }

        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 8px; font-size: 11px; font-weight: 600; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
        .badge-green { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .badge-yellow { background: #fefce8; color: #ca8a04; border: 1px solid #fde68a; }
        .badge-red { background: #fff5f5; color: #dc2626; border: 1px solid #fecaca; }

        .upload-zone {
          border: 2px dashed #e0e0e0; border-radius: 20px; padding: 48px 24px;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; cursor: pointer; transition: all 0.2s; background: #fafafa;
        }
        .upload-zone:hover { border-color: black; background: #f5f5f5; }

        .submit-btn {
          width: 100%; background: black; color: white; border: none;
          padding: 16px; border-radius: 14px;
          font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
        }
        .submit-btn:hover { background: #222; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.28s ease forwards; }
        .fade-up-d1 { animation: fadeUp 0.28s ease 0.06s both; }
        .fade-up-d2 { animation: fadeUp 0.28s ease 0.12s both; }
      `}</style>

     <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="fade-up flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8 mb-10">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ background: 'black', borderRadius: 12, padding: '8px 10px', display: 'flex' }}>
                <ShoppingBag size={18} color="white" />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, color: '#aaa', textTransform: 'uppercase' }}>
                Inventory System
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(52px, 6vw, 40px)', fontWeight: 800, letterSpacing: -3, lineHeight: 1, color: '#111' }}>
              Products
            </h1>
            <p style={{ color: '#aaa', marginTop: 10, fontSize: 15 }}>
              Manage inventory, pricing and stock levels
            </p>
          </div>

          {/* Stat Cards */}
          <div className="flex flex-wrap gap-3 xl:grid xl:grid-cols-2 xl:w-[420px]">
            <div className="stat-card flex-1 min-w-[140px]">
              <div className="field-label" style={{ marginBottom: 6 }}>Total SKUs</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#111', lineHeight: 1 }}>{stats.total}</div>
            </div>
            <div className="stat-card flex-1 min-w-[140px]">
              <div className="field-label" style={{ marginBottom: 6 }}>Stock Value</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#111', lineHeight: 1 }}>
                ₹{stats.totalValue >= 1000 ? (stats.totalValue / 1000).toFixed(1) + 'k' : stats.totalValue}
              </div>
            </div>
            <div className="stat-card flex-1 min-w-[140px]">
              <div className="field-label" style={{ marginBottom: 6 }}>Low Stock</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#ca8a04', lineHeight: 1 }}>{stats.lowStock}</div>
            </div>
            <div className="stat-card flex-1 min-w-[140px]">
              <div className="field-label" style={{ marginBottom: 6 }}>Out of Stock</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{stats.outOfStock}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="fade-up-d1 tab-pill mb-8">
          <button className={`tab-btn ${activeTab === 'inventory' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('inventory')}>
            <Layers size={14} /> Inventory
          </button>
          <button className={`tab-btn ${activeTab === 'add' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('add')}>
            <Package size={14} /> Add Product
          </button>
        </div>

        {/* ADD PRODUCT */}
        {activeTab === 'add' && (
          <div className="fade-up panel p-6 md:p-10 mb-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div style={{ background: '#f3f3f3', borderRadius: 14, padding: '10px', display: 'flex', border: '1.5px solid #e8e8e8' }}>
                <Package size={20} color="#333" />
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', lineHeight: 1 }}>New Product</h2>
                <p style={{ color: '#aaa', marginTop: 4, fontSize: 13 }}>Fill in the details to add to inventory</p>
              </div>
            </div>

            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="field-label">Product Name</label>
                  <div className="input-wrap">
                    <Package size={15} color="#ccc" style={{ flexShrink: 0 }} />
                    <input type="text" placeholder="e.g. Nike Air Max" value={productName} onChange={e => setProductName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="field-label">SKU Number</label>
                  <div className="input-wrap">
                    <Hash size={15} color="#ccc" style={{ flexShrink: 0 }} />
                    <input type="text" placeholder="SKU-001" value={sku} onChange={e => setSku(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="field-label">Selling Price</label>
                  <div className="input-wrap">
                    <IndianRupee size={15} color="#ccc" style={{ flexShrink: 0 }} />
                    <input type="number" placeholder="0.00" value={productPrice} onChange={e => setProductPrice(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="field-label">Purchase Price</label>
                  <div className="input-wrap">
                    <IndianRupee size={15} color="#ccc" style={{ flexShrink: 0 }} />
                    <input type="number" placeholder="0.00" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="field-label">Quantity</label>
                  <div className="input-wrap">
                    <Hash size={15} color="#ccc" style={{ flexShrink: 0 }} />
                    <input type="number" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
                  </div>
                </div>

                {/* Live Margin Card */}
                {productPrice && purchasePrice && Number(purchasePrice) > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <TrendingUp size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#86efac', letterSpacing: 2, marginBottom: 4 }}>MARGIN</div>
                      <div style={{ color: '#16a34a', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{margin(productPrice, purchasePrice)}%</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#86efac', letterSpacing: 2, marginBottom: 4 }}>PROFIT/UNIT</div>
                      <div style={{ color: '#111', fontSize: 20, fontWeight: 800 }}>₹{(productPrice - purchasePrice).toFixed(0)}</div>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="field-label">Description</label>
                  <div className="input-wrap" style={{ alignItems: 'flex-start', paddingTop: 4 }}>
                    <FileText size={15} color="#ccc" style={{ flexShrink: 0, marginTop: 14 }} />
                    <textarea rows={4} placeholder="Write product description..." value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="field-label">Product Image</label>
                  <label className="upload-zone">
                    {!preview ? (
                      <>
                        <div style={{ background: '#ebebeb', borderRadius: 16, padding: '14px', marginBottom: 14, display: 'flex' }}>
                          <ImagePlus size={26} color="#888" />
                        </div>
                        <div style={{ color: '#333', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Click to upload image</div>
                        <div style={{ color: '#bbb', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>PNG · JPG · WEBP</div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <img src={preview} alt="preview" style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 16, border: '2px solid #e8e8e8', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                        <div style={{ color: '#888', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{image?.name}</div>
                        <div style={{ color: '#16a34a', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                          <CheckCircle size={13} /> Ready to upload
                        </div>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e.target.files[0])} />
                  </label>
                </div>

                <div className="md:col-span-2">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Adding Product..." : "Add to Inventory →"}
                  </button>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* INVENTORY TABLE */}
        {activeTab === 'inventory' && (
          <div className="fade-up panel mb-8">

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 24px', borderBottom: '1.5px solid #f0f0f0' }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>Product Inventory</h2>
                <p style={{ color: '#bbb', fontSize: 12, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                  {filteredProducts.length} / {products.length} products
                </p>
              </div>

              <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
                <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
                <input
                  type="text"
                  placeholder="Search name or SKU..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', background: '#f7f7f5', border: '1.5px solid #e8e8e8',
                    borderRadius: 12, paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                    color: '#111', outline: 'none', fontSize: 14, transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'black'}
                  onBlur={e => e.target.style.borderColor = '#e8e8e8'}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 1060, borderCollapse: 'collapse' }}>
                <thead className="tbl-head">
                  <tr>
                    {['Product', 'SKU', 'Purchase', 'Selling', 'Margin', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="product-row" onClick={() => navigate(`/product/${product.id}`)}>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ borderRadius: 14, overflow: 'hidden', flexShrink: 0, border: '1.5px solid #f0f0f0', width: 52, height: 52 }}>
                            <img
                              src={product.product_image} alt={product.product_name}
                              style={{ width: 52, height: 52, objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                              onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                            />
                          </div>
                          <div>
                            {editId === product.id ? (
                              <input className="edit-input" type="text" value={editData.product_name}
                                onClick={e => e.stopPropagation()}
                                onChange={e => setEditData({ ...editData, product_name: e.target.value })} />
                            ) : (
                              <>
                                <div style={{ color: '#111', fontWeight: 700, fontSize: 15 }}>{product.product_name}</div>
                                <div style={{ color: '#bbb', fontSize: 12, marginTop: 2 }}>
                                  {product.description?.slice(0, 30)}{product.description?.length > 30 ? '…' : ''}
                                </div>
                              </>
                            )}
                          </div>
                          <ChevronRight size={14} color="#ccc" className="row-chevron" />
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {editId === product.id ? (
                          <input className="edit-input" type="text" value={editData.sku}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditData({ ...editData, sku: e.target.value })} />
                        ) : (
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#888', background: '#f5f5f5', border: '1px solid #ebebeb', padding: '4px 10px', borderRadius: 8 }}>
                            {product.sku}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {editId === product.id ? (
                          <input className="edit-input" type="number" value={editData.p_price}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditData({ ...editData, p_price: e.target.value })} />
                        ) : (
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#999' }}>
                            ₹{product.p_price?.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {editId === product.id ? (
                          <input className="edit-input" type="number" value={editData.product_price}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditData({ ...editData, product_price: e.target.value })} />
                        ) : (
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: '#111' }}>
                            ₹{product.product_price?.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ArrowUpRight size={13} color="#16a34a" />
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
                            {margin(product.product_price, product.p_price)}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {editId === product.id ? (
                          <input className="edit-input" type="number" value={editData.quantity}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditData({ ...editData, quantity: e.target.value })}
                            style={{ width: 90 }} />
                        ) : (
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700,
                            color: product.quantity <= 0 ? '#dc2626' : product.quantity <= 5 ? '#ca8a04' : '#111'
                          }}>
                            {product.quantity}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {product.quantity <= 0 ? (
                          <span className="badge badge-red"><XCircle size={11} /> Out of Stock</span>
                        ) : product.quantity <= 5 ? (
                          <span className="badge badge-yellow"><AlertTriangle size={11} /> Low Stock</span>
                        ) : (
                          <span className="badge badge-green"><CheckCircle size={11} /> In Stock</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                            className="action-btn action-btn-view" title="View"><Eye size={14} /></button>

                          {editId === product.id ? (
                            <>
                              <button onClick={e => { e.stopPropagation(); handleUpdate(product.id); }}
                                className="action-btn action-btn-save" title="Save"><Save size={14} /></button>
                              <button onClick={e => { e.stopPropagation(); setEditId(null); }}
                                className="action-btn action-btn-cancel" title="Cancel"><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={e => { e.stopPropagation(); handleEdit(product); }}
                                className="action-btn action-btn-edit" title="Edit"><Pencil size={14} /></button>
                              <button onClick={e => { e.stopPropagation(); handleDelete(product.id); }}
                                className="action-btn action-btn-delete" title="Delete"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.2, color: '#999' }} />
                  <p style={{ fontWeight: 700, color: '#aaa' }}>No products found</p>
                  <p style={{ fontSize: 13, marginTop: 4, color: '#ccc' }}>Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}