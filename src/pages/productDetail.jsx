// import { useEffect, useState } from "react";
// import {
//   useParams,
//   useNavigate,
// } from "react-router-dom";

// import { supabase } from "../supabase";

// import {
//   ArrowLeft,
//   IndianRupee,
//   Package,
//   Boxes,
//   Pencil,
//   Trash2,
//   Save,
//   X,
//   ShieldCheck,
//   Truck,
//   BadgeCheck,
//   Star,
// } from "lucide-react";

// export default function ProductDetail() {
//   const { id } = useParams();

//   const navigate = useNavigate();

//   const [product, setProduct] =
//     useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [editMode, setEditMode] =
//     useState(false);

//   const [editData, setEditData] =
//     useState({
//       product_name: "",
//       product_price: "",
//       sku: "",
//       quantity: "",
//       description: "",
//     });

//   // Fetch Product
//   useEffect(() => {
//     fetchProduct();
//   }, [id]);

//   const fetchProduct = async () => {
//     setLoading(true);

//     const { data, error } =
//       await supabase
//         .from("products")
//         .select("*")
//         .eq("id", id)
//         .single();

//     if (error) {
//       console.log(error);
//       setLoading(false);
//       return;
//     }

//     setProduct(data);

//     setEditData({
//       product_name:
//         data.product_name || "",
//       product_price:
//         data.product_price || "",
//       sku: data.sku || "",
//       quantity:
//         data.quantity || "",
//       description:
//         data.description || "",
//     });

//     setLoading(false);
//   };

//   // Update Product
//   const handleUpdate = async () => {
//     const { error } = await supabase
//       .from("products")
//       .update({
//         product_name:
//           editData.product_name,
//         product_price: Number(
//           editData.product_price
//         ),
//         sku: editData.sku,
//         quantity: Number(
//           editData.quantity
//         ),
//         description:
//           editData.description,
//       })
//       .eq("id", id);

//     if (error) {
//       alert(error.message);
//       return;
//     }

//     alert("Product Updated");

//     setEditMode(false);

//     fetchProduct();
//   };

//   // Delete Product
//   const handleDelete = async () => {
//     const confirmDelete =
//       window.confirm(
//         "Delete this product?"
//       );

//     if (!confirmDelete) return;

//     const { error } = await supabase
//       .from("products")
//       .delete()
//       .eq("id", id);

//     if (error) {
//       alert(error.message);
//       return;
//     }

//     alert("Product Deleted");

//     navigate("/products");
//   };

//   // Loading
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>

//           <h1 className="text-3xl font-black">
//             Loading Product...
//           </h1>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f5f5f7] pb-20">

//       {/* Top Header */}
//       <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">

//         <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">

//           {/* Back */}
//           <button
//             onClick={() =>
//               navigate("/products")
//             }
//             className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all"
//           >
//             <ArrowLeft size={20} />

//             Back
//           </button>

//           {/* Brand */}
//           <h1 className="text-2xl md:text-3xl font-black">
//             Pinanki Solution
//           </h1>

//         </div>

//       </div>

//       {/* Main */}
//       <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">

//         <div className="grid lg:grid-cols-2 gap-10">

//           {/* LEFT SIDE IMAGE */}
//           <div>

//             {/* Main Image */}
//             <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-gray-200 sticky top-28">

//               <div className="relative">

//                 <img
//                   src={
//                     product.product_image
//                   }
//                   alt={
//                     product.product_name
//                   }
//                   className="w-full h-[700px] object-cover"
//                 />

             

//                 {/* Stock */}
//                 <div className="absolute top-6 right-6">

//                   {product.quantity <=
//                   0 ? (
//                     <div className="bg-red-500 text-white px-5 py-3 rounded-2xl font-bold shadow-xl">
//                       Out of Stock
//                     </div>
//                   ) : product.quantity <=
//                     5 ? (
//                     <div className="bg-yellow-400 text-black px-5 py-3 rounded-2xl font-bold shadow-xl">
//                       Low Stock
//                     </div>
//                   ) : (
//                     <div className="bg-green-500 text-white px-5 py-3 rounded-2xl font-bold shadow-xl">
//                       In Stock
//                     </div>
//                   )}

//                 </div>

//               </div>


//             </div>

//           </div>

//           {/* RIGHT SIDE CONTENT */}
//           <div>

//             {/* Product Info */}
//             <div className="bg-white rounded-[40px] p-6 md:p-10 shadow-2xl border border-gray-200">

//               {/* Title */}
//               <div className="mb-8">

//                 {editMode ? (

//                   <input
//                     type="text"
//                     value={
//                       editData.product_name
//                     }
//                     onChange={(e) =>
//                       setEditData({
//                         ...editData,
//                         product_name:
//                           e.target.value,
//                       })
//                     }
//                     className="w-full text-5xl font-black outline-none border-b-2 border-gray-300 py-3"
//                   />

//                 ) : (

//                   <h1 className="text-4xl md:text-6xl font-black leading-tight">
//                     {
//                       product.product_name
//                     }
//                   </h1>

//                 )}

//               </div>

//               {/* Price */}
//               <div className="bg-black text-white rounded-[35px] p-8 mb-8 shadow-2xl">

//                 <p className="text-gray-300 mb-3 text-lg">
//                   Special Price
//                 </p>

//                 {editMode ? (

//                   <input
//                     type="number"
//                     value={
//                       editData.product_price
//                     }
//                     onChange={(e) =>
//                       setEditData({
//                         ...editData,
//                         product_price:
//                           e.target.value,
//                       })
//                     }
//                     className="bg-transparent outline-none text-6xl font-black w-full"
//                   />

//                 ) : (

//                   <div className="flex items-center gap-3">

//                     <IndianRupee
//                       size={44}
//                     />

//                     <h2 className="text-6xl font-black">
//                       {
//                         product.product_price
//                       }
//                     </h2>

//                   </div>

//                 )}

//               </div>

//               {/* Product Details */}
//               <div className="space-y-6">

//                 {/* SKU */}
//                 <div className="bg-gray-100 rounded-[30px] p-6">

//                   <div className="flex items-start gap-5">

//                     <div className="bg-black text-white p-4 rounded-2xl">
//                       <Package size={24} />
//                     </div>

//                     <div className="w-full">

//                       <p className="text-gray-500 mb-2">
//                         SKU Number
//                       </p>

//                       {editMode ? (

//                         <input
//                           type="text"
//                           value={
//                             editData.sku
//                           }
//                           onChange={(
//                             e
//                           ) =>
//                             setEditData({
//                               ...editData,
//                               sku:
//                                 e.target
//                                   .value,
//                             })
//                           }
//                           className="w-full bg-transparent border-b border-gray-400 outline-none text-2xl font-bold py-2"
//                         />

//                       ) : (

//                         <h3 className="text-3xl font-black">
//                           {product.sku}
//                         </h3>

//                       )}

//                     </div>

//                   </div>

//                 </div>

//                 {/* Quantity */}
//                 <div className="bg-gray-100 rounded-[30px] p-6">

//                   <div className="flex items-start gap-5">

//                     <div className="bg-black text-white p-4 rounded-2xl">
//                       <Boxes size={24} />
//                     </div>

//                     <div className="w-full">

//                       <p className="text-gray-500 mb-2">
//                         Available Quantity
//                       </p>

//                       {editMode ? (

//                         <input
//                           type="number"
//                           value={
//                             editData.quantity
//                           }
//                           onChange={(
//                             e
//                           ) =>
//                             setEditData({
//                               ...editData,
//                               quantity:
//                                 e.target
//                                   .value,
//                             })
//                           }
//                           className="w-full bg-transparent border-b border-gray-400 outline-none text-2xl font-black py-2"
//                         />

//                       ) : (

//                         <h3 className="text-4xl font-black">
//                           {
//                             product.quantity
//                           }
//                         </h3>

//                       )}

//                     </div>

//                   </div>

//                 </div>

//                 {/* Description */}
//                 <div className="bg-gray-100 rounded-[30px] p-6">

//                   <p className="text-gray-500 mb-5 text-lg">
//                     Product Description
//                   </p>

//                   {editMode ? (

//                     <textarea
//                       rows="8"
//                       value={
//                         editData.description
//                       }
//                       onChange={(e) =>
//                         setEditData({
//                           ...editData,
//                           description:
//                             e.target.value,
//                         })
//                       }
//                       placeholder="Enter product description..."
//                       className="w-full bg-white rounded-3xl p-6 outline-none border border-gray-300 text-lg resize-none"
//                     />

//                   ) : (

//                     <div className="bg-white rounded-3xl p-6 border border-gray-200">

//                       <p className="text-lg leading-[2] text-gray-700 whitespace-pre-line">
//                         {product.description ||
//                           "No description added for this product."}
//                       </p>

//                     </div>

//                   )}

//                 </div>

//               </div>

//               {/* Buttons */}
//               <div className="flex flex-wrap gap-4 mt-10">

//                 {editMode ? (

//                   <>
//                     <button
//                       onClick={
//                         handleUpdate
//                       }
//                       className="flex items-center gap-3 bg-black text-white px-8 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
//                     >
//                       <Save size={22} />

//                       Save Changes
//                     </button>

//                     <button
//                       onClick={() =>
//                         setEditMode(
//                           false
//                         )
//                       }
//                       className="flex items-center gap-3 bg-gray-200 px-8 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-all"
//                     >
//                       <X size={22} />

//                       Cancel
//                     </button>
//                   </>

//                 ) : (

//                   <>
//                     <button
//                       onClick={() =>
//                         setEditMode(
//                           true
//                         )
//                       }
//                       className="flex items-center gap-3 bg-black text-white px-8 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
//                     >
//                       <Pencil size={22} />

//                       Edit Product
//                     </button>

//                     <button
//                       onClick={
//                         handleDelete
//                       }
//                       className="flex items-center gap-3 bg-red-500 text-white px-8 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
//                     >
//                       <Trash2 size={22} />

//                       Delete Product
//                     </button>
//                   </>

//                 )}

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }