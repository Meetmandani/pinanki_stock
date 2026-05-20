import { useEffect, useState } from "react";
import { supabase } from "../supabase";

import {
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  IndianRupee,
  Users,
} from "lucide-react";

export default function Unpaid() {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");

  const [amount, setAmount] = useState("");

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("unpaid_customers")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setCustomers(data || []);
    }

    setLoading(false);
  }

  async function addCustomer() {
    if (!customerName.trim() || !amount) {
      alert("Fill all fields");

      return;
    }

    const { error } = await supabase.from("unpaid_customers").insert([
      {
        customer_name: customerName,

        unpaid_amount: Number(amount),
      },
    ]);

    if (error) {
      alert(error.message);

      return;
    }

    setCustomerName("");
    setAmount("");

    fetchCustomers();
  }

  async function deleteCustomer(id) {
    const confirmDelete = window.confirm("Delete customer?");

    if (!confirmDelete) return;

    await supabase.from("unpaid_customers").delete().eq("id", id);

    fetchCustomers();
  }

  async function updateCustomer(id) {
    const row = customers.find((item) => item.id === id);

    const { error } = await supabase
      .from("unpaid_customers")
      .update({
        customer_name: row.customer_name,

        unpaid_amount: Number(row.unpaid_amount),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);

      return;
    }

    setEditingId(null);

    fetchCustomers();
  }

  function handleChange(id, field, value) {
    setCustomers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  const totalUnpaid = customers.reduce(
    (sum, item) => sum + Number(item.unpaid_amount),
    0,
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
          w-14
          h-14
          border-4
          border-black
          border-t-transparent
          rounded-full
          animate-spin
          "
        />
      </div>
    );
  }

  return (
    <div
      className="
      min-h-screen
      bg-white

      p-4
      md:p-8
      mt-18
      "
    >
      {/* HEADER */}

      <div
        className="
        flex
        flex-col
        md:flex-row

        md:items-center
        md:justify-between

        gap-5
        mb-8
        "
      >
        <div>
          <p
            className="
            uppercase
            tracking-[4px]
            text-gray-400
            text-xs
            mb-2
            "
          >
            Payment Tracking
          </p>

          <h1
            className="
            text-4xl
            md:text-5xl
            font-black
            "
          >
            Unpaid Amounts
          </h1>
        </div>

        <div
          className="
          flex
          gap-4
          "
        >
          <div
            className="
            bg-white
            rounded-3xl
            border

            px-6
            py-5

            min-w-[180px]
            "
          >
            <Users
              size={18}
              className="
              mb-3
              text-gray-500
              "
            />

            <p
              className="
              text-gray-400
              text-sm
              "
            >
              Customers
            </p>

            <h2
              className="
              text-3xl
              font-black
              "
            >
              {customers.length}
            </h2>
          </div>

          <div
            className="
            bg-black
            text-white

            rounded-3xl

            px-6
            py-5

            min-w-[220px]
            "
          >
            <IndianRupee
              size={18}
              className="
              mb-3
              "
            />

            <p
              className="
              text-sm
              text-gray-300
              "
            >
              Total Unpaid
            </p>

            <h2
              className="
              text-3xl
              font-black
              "
            >
              ₹{totalUnpaid.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      {/* ADD CUSTOMER */}

      <div
        className="
        bg-white

        border
        rounded-3xl

        p-5

        mb-8

        shadow-sm
        "
      >
        <h2
          className="
          font-bold
          text-xl
          mb-5
          "
        >
          Add Customer
        </h2>

        <div
          className="
          grid
          md:grid-cols-3
          gap-4
          "
        >
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name"
            className="
            border

            rounded-2xl

            p-4

            outline-none

            focus:border-black
            "
          />

          <input
            value={amount}
            type="number"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Unpaid Amount"
            className="
            border

            rounded-2xl

            p-4

            outline-none

            focus:border-black
            "
          />

          <button
            onClick={addCustomer}
            className="
            bg-black
            text-white

            rounded-2xl

            flex
            items-center
            justify-center
            gap-2

            font-semibold

            hover:opacity-90
            transition
            "
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div
        className="
        bg-white

        rounded-3xl

        border

        overflow-hidden
        "
      >
        <div
          className="
          overflow-x-auto
          "
        >
          <table
            className="
            w-full
            "
          >
            <thead>
              <tr
                className="
                bg-black
                text-white
                "
              >
                <th className="p-5 text-left">Customer</th>

                <th className="p-5 text-left">Unpaid Amount</th>

                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((item) => (
                <tr
                  key={item.id}
                  className="
                    border-b
                    hover:bg-gray-50
                    transition
                    "
                >
                  <td className="p-5">
                    {editingId === item.id ? (
                      <input
                        value={item.customer_name}
                        onChange={(e) =>
                          handleChange(item.id, "customer_name", e.target.value)
                        }
                        className="
                          border
                          rounded-xl
                          p-2
                          w-full
                          "
                      />
                    ) : (
                      <p
                        className="
                          font-semibold
                          "
                      >
                        {item.customer_name}
                      </p>
                    )}
                  </td>

                  <td className="p-5">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={item.unpaid_amount}
                        onChange={(e) =>
                          handleChange(item.id, "unpaid_amount", e.target.value)
                        }
                        className="
                          border
                          rounded-xl
                          p-2
                          "
                      />
                    ) : (
                      <span
                        className="
                          font-black
                          text-red-500
                          "
                      >
                        ₹{Number(item.unpaid_amount).toLocaleString()}
                      </span>
                    )}
                  </td>

                  <td
                    className="
                      p-5

                      flex
                      justify-center
                      gap-3
                      "
                  >
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => updateCustomer(item.id)}
                          className="
                            p-3
                            bg-green-500
                            text-white
                            rounded-xl
                            "
                        >
                          <Save size={18} />
                        </button>

                        <button
                          onClick={() => setEditingId(null)}
                          className="
                            p-3
                            bg-gray-200
                            rounded-xl
                            "
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="
                            p-3

                            bg-black
                            text-white

                            rounded-xl
                            "
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => deleteCustomer(item.id)}
                          className="
                            p-3

                            bg-red-500
                            text-white

                            rounded-xl
                            "
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!customers.length && (
          <div
            className="
            text-center

            py-20

            text-gray-400
            "
          >
            No unpaid customers found
          </div>
        )}
      </div>
    </div>
  );
}
