import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import {
  Package,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Layers,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setProducts(data || []);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const inventoryValue = products.reduce(
      (sum, p) => sum + (p.p_price || 0) * (p.quantity || 0),
      0,
    );

    const sellingValue = products.reduce(
      (sum, p) => sum + (p.product_price || 0) * (p.quantity || 0),
      0,
    );

    const totalProfit = sellingValue - inventoryValue;

    const lowStock = products.filter(
      (p) => p.quantity > 0 && p.quantity <= 5,
    ).length;

    const outOfStock = products.filter((p) => p.quantity <= 0).length;

    const inStock = products.filter((p) => p.quantity > 5).length;

    const avgMargin =
      products.length > 0
        ? (
            products.reduce((sum, p) => {
              if (!p.p_price) return sum;

              return sum + ((p.product_price - p.p_price) / p.p_price) * 100;
            }, 0) / products.length
          ).toFixed(1)
        : 0;

    return {
      totalProducts,
      inventoryValue,
      sellingValue,
      totalProfit,
      lowStock,
      outOfStock,
      inStock,
      avgMargin,
    };
  }, [products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort(
        (a, b) => b.product_price * b.quantity - a.product_price * a.quantity,
      )
      .slice(0, 5);
  }, [products]);

  const Card = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs tracking-[2px] uppercase text-gray-400">
          {title}
        </span>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: color }}
        >
          {icon}
        </div>
      </div>

      <h2 className="text-4xl font-black text-black">{value}</h2>
    </div>
  );

 if (loading) {
  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-white
      "
    >
      <div
        className="
        flex
        flex-col
        items-center
        gap-5
        "
      >

        {/* Spinner */}

        <div
          className="
          w-14
          h-14

          border-[4px]
          border-gray-200
          border-t-black

          rounded-full

          animate-spin
          "
        />

        {/* Text */}

        <p
          className="
          text-gray-500
          text-sm
          font-medium
          tracking-wide
          "
        >
          Loading Dashboard...
        </p>

      </div>
    </div>
  );
}
  return (
<div
  className="
min-h-screen
bg-white
p-6
md:p-8
"
>
      {/* HEADER */}

      <div className="mb-10">
        <div className="flex justify-between flex-wrap gap-5">
          <div>
            <div
              className="
inline-flex
items-center
gap-2
px-4
py-2
bg-white
border
rounded-full
mb-5
shadow-sm
"
            >
              <ShoppingBag size={15} />
              <span
                className="
uppercase
tracking-[3px]
text-[11px]
text-gray-500
font-medium
"
              >
                Inventory Analytics
              </span>
            </div>

            <h1
              className="
text-4xl
md:text-5xl
font-black
tracking-[-4px]
text-black
"
            >
              Dashboard
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Business performance overview
            </p>
          </div>

          <div
            className="
bg-white
rounded-[28px]
px-6
py-5
border
shadow-sm
min-w-[240px]
"
          >
            <div
              className="
text-xs
tracking-[2px]
uppercase
text-gray-400
mb-2
"
            >
              Total Profit Potential
            </div>

            <div
              className="
text-4xl
font-black
"
            >
              ₹{stats.totalProfit.toLocaleString()}
            </div>

            <div
              className="
flex
items-center
gap-2
mt-2
text-green-600
font-medium
"
            >
              <TrendingUp size={15} />
              +12.4%
            </div>
          </div>
        </div>
      </div>

      {/* KPI GRID */}

      <div
        className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-5
mb-8
"
      >
        <KPI
          title="Products"
          value={stats.totalProducts}
          icon={<Package size={18} />}
          bg="white"
          text="black"
        />

        <KPI
          title="Inventory Value"
          value={`₹${stats.inventoryValue.toLocaleString()}`}
          icon={<IndianRupee size={18} />}
          bg="white"
          text="black"
        />

        <KPI
          title="Revenue Potential"
          value={`₹${stats.sellingValue.toLocaleString()}`}
          icon={<TrendingUp size={18} />}
          bg="white"
          text="black"
        />

        <KPI
          title="Margin Avg"
          value={`${stats.avgMargin}%`}
          icon={<ArrowUpRight size={18} />}
          bg="white"
          text="black"
        />
      </div>

      {/* MAIN GRID */}

      <div
        className="
grid
xl:grid-cols-3
gap-6
"
      >
        {/* STOCK HEALTH */}

        <div
          className="
bg-white
rounded-[30px]
border
shadow-sm
p-7
"
        >
          <h3
            className="
font-black
text-2xl
mb-8
"
          >
            Stock Health
          </h3>

          <StockBar
            label="Healthy"
            value={stats.inStock}
            color="bg-green-500"
          />

          <StockBar
            label="Low Stock"
            value={stats.lowStock}
            color="bg-yellow-500"
          />

          <StockBar
            label="Out Of Stock"
            value={stats.outOfStock}
            color="bg-red-500"
          />
        </div>

        {/* INVENTORY RING */}

        <div
          className="
bg-white
text-black
border
shadow-sm
rounded-[30px]
p-7
relative
overflow-hidden
"
        >
          <div
            className="
absolute
w-52
h-52
bg-white/10
blur-3xl
-right-10
-top-10
"
          />

          <div
            className="
text-sm
uppercase
tracking-[2px]
text-zinc-400
"
          >
            Inventory Units
          </div>

          <div
            className="
mt-4
text-7xl
font-black
"
          >
            {products.reduce((a, p) => a + p.quantity, 0)}
          </div>

          <div
            className="
mt-6
h-3
bg-white/20
rounded-full
overflow-hidden
"
          >
            <div
              style={{
                width: `${(stats.inStock / stats.totalProducts) * 100}%`,
              }}
              className="
h-full
bg-white
rounded-full
"
            />
          </div>

          <div
            className="
text-zinc-400
mt-3
"
          >
            {stats.inStock} products fully stocked
          </div>
        </div>

        {/* TOP PRODUCTS */}

        <div
          className="
bg-white
rounded-[30px]
border
shadow-sm
p-7
"
        >
          <h3
            className="
font-black
text-2xl
mb-6
"
          >
            Top Inventory
          </h3>

          <div className="space-y-5">
            {topProducts.map((p, index) => (
              <div
                key={p.id}
                className="
flex
items-center
justify-between
"
              >
                <div
                  className="
flex
items-center
gap-4
"
                >
                  <div
                    className="
relative
"
                  >
                    <img
                      src={p.product_image}
                      alt=""
                      className="
w-14
h-14
rounded-2xl
object-cover
"
                    />

                    <div
                      className="
absolute
-top-2
-right-2
w-6
h-6
bg-black
text-white
rounded-full
text-xs
flex
items-center
justify-center
font-bold
"
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div>
                    <div
                      className="
font-bold
"
                    >
                      {p.product_name}
                    </div>

                    <div
                      className="
text-sm
text-gray-400
"
                    >
                      {p.quantity} units
                    </div>
                  </div>
                </div>

                <div
                  className="
font-black
text-lg
"
                >
                  ₹{(p.product_price * p.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Health({ icon, label, value, color }) {
  return (
    <div
      className="
      flex
      justify-between
      items-center
      bg-gray-50
      p-4
      rounded-xl
      "
    >
      <div
        className="
        flex
        items-center
        gap-3
        "
      >
        <div className={`text-${color}-500`}>{icon}</div>

        <span>{label}</span>
      </div>

      <span
        className="
        font-black
        text-xl
        "
      >
        {value}
      </span>
    </div>
  );
}

function KPI({ title, value, icon, bg, text }) {
  return (
    <div
      className={`
bg-white
border
border-sm
rounded-[28px]
p-6
text-${text}
shadow-lg
hover:scale-[1.02]
transition
`}
    >
      <div
        className="
flex
justify-between
mb-8
"
      >
        <div
          className="
uppercase
text-xs
tracking-[2px]
opacity-80
"
        >
          {title}
        </div>

        {icon}
      </div>

      <div
        className="
text-4xl
font-black
"
      >
        {value}
      </div>
    </div>
  );
}

function StockBar({ label, value, color }) {
  return (
    <div className="mb-6">
      <div
        className="
flex
justify-between
mb-2
"
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div
        className="
h-3
bg-gray-100
rounded-full
overflow-hidden
"
      >
        <div
          className={`
${color}
h-full
rounded-full
`}
          style={{
            width: `${value * 10}%`,
          }}
        />
      </div>
    </div>
  );
}
