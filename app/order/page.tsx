"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Package, X, ChevronDown } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { fetchOrders } from "../lib/fetchOrder";
import { Order } from "../types";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GiHeartEarrings } from "react-icons/gi";
import { FaTrash } from "react-icons/fa";
import { IoReceiptOutline } from "react-icons/io5";
import { MdContentCopy, MdFilterList, MdOutlineClear } from "react-icons/md";
import { formatOrderTime } from "../utils/formatOrderTime";
import toast, { Toaster } from "react-hot-toast";

type OrderStatus = "pending" | "processing" | "completed";

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const icons = {
    pending: <Clock size={14} />,
    processing: <Package size={14} />,
    completed: <CheckCircle size={14} />,
  };

  return (
    <span
      className={clsx(
        "flex items-center gap-1.5 px-3 py-1  text-xs font-semibold border",
        styles[status]
      )}
    >
      {icons[status]}
      <span className="capitalize">{status}</span>
    </span>
  );
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(
    null
  );
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState<
    Order["products"] | null
  >(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Number of orders per page

  console.log(updatingOrderId);
  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchOrders();

      const formattedData = data.map((order) => {
        const dateObj = new Date(order.createdAt);
        return {
          ...order,
          orderDate: dateObj.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          time: formatOrderTime(order.createdAt),
        };
      });

      setOrders(formattedData);
      setLoading(false);
    };
    loadOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch("/api/update-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // FIXED: use orderId instead of order._id
      setSuccessMessage(`Order #${orderId.slice(-6)} updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingOrderId(null);
    }
  };
  // Inside your OrdersPage component
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `PaymentProof_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl); // Clean up
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  const filteredOrders = orders.filter((order) => {
    // ---- DATE FILTER ----
    if (fromDate || toDate) {
      const orderTime = new Date(order.createdAt).getTime();

      const fromTime = fromDate
        ? new Date(fromDate).setHours(0, 0, 0, 0)
        : null;

      const toTime = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

      if (fromTime && orderTime < fromTime) return false;
      if (toTime && orderTime > toTime) return false;
    }

    // ---- SEARCH FILTER ----
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();

    const customerMatch =
      order.customerName?.toLowerCase().includes(q) ||
      order.email?.toLowerCase().includes(q) ||
      order.phone?.toLowerCase().includes(q) ||
      order.paymentMethod.toLowerCase().includes(q) ||
      order.status.toLowerCase().includes(q);

    const productMatch = order.products.some((p) =>
      p.product.name?.toLowerCase().includes(q)
    );

    return customerMatch || productMatch;
  });

  const downloadExcel = () => {
    const data = filteredOrders.map((order) => ({
      OrderID: order._id,
      Customer: order.customerName,
      Email: order.email,
      Phone: order.phone,
      Adress: order.address,
      Date: order.orderDate,
      Status: order.status,
      Payment: order.paymentMethod,
      SingleAmount: order.products.map((p) => p.product.price).join(", "),
      Total: order.totalAmount,
      Products: order.products
        .map((p) => `${p.product.name} x${p.quantity}`)
        .join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    XLSX.writeFile(workbook, `Orders_${Date.now()}.xlsx`);
  };
  // --- PDF for all filtered orders ---
  const downloadAllPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    doc.text("Orders Report (All Pages)", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Order ID",
          "Customer",
          "Date",
          "Address",
          "Products",
          "Price",
          "Status",
          "Payment",
          "Total",
        ],
      ],
      body: filteredOrders.map((o) => [
        o._id,
        o.customerName,
        o.orderDate ?? "",
        o.address,
        o.time ?? "",
        o.products.map((p) => `${p.product.name} × ${p.quantity}`).join(", "),
        o.products.map((p) => p.product.price).join(", "),
        o.status,
        o.paymentMethod,
        o.totalAmount,
      ]),
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      columnStyles: {
        3: { cellWidth: 200 },
        4: { cellWidth: 180 },
      },
    });

    doc.save(`Orders_All_${Date.now()}.pdf`);
  };

  // --- PDF for current page only ---
  const downloadPagePDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    doc.text(`Orders Report (Page ${currentPage})`, 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Order ID",
          "Customer",
          "Date",
          "Address",
          "Products",
          "Price",
          "Status",
          "Payment",
          "Total",
        ],
      ],
      body: paginatedOrders.map((o) => [
        o._id,
        o.customerName,
        o.orderDate ?? "",
        o.time ?? "",
        o.address,
        o.products.map((p) => `${p.product.name} × ${p.quantity}`).join(", "),
        o.products.map((p) => p.product.price).join(", "),
        o.status,
        o.paymentMethod,
        o.totalAmount,
      ]),
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      columnStyles: {
        3: { cellWidth: 200 },
        4: { cellWidth: 180 },
      },
    });

    doc.save(`Orders_Page_${currentPage}_${Date.now()}.pdf`);
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/delete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: deleteOrderId }),
      });

      if (!res.ok) throw new Error("Delete failed");

      setOrders((prev) => prev.filter((order) => order._id !== deleteOrderId));

      setSuccessMessage(`Order deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteOrderId(null);
    }
  };
  const statusIcon = {
    pending: <Clock size={14} />,
    processing: <Package size={14} />,
    completed: <CheckCircle size={14} />,
  };
  // Calculate paginated orders
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Total pages
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  // Change page
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  return (
    <div className="min-h-screen pt-8  sm:pt-24 pb-24 px-4 sm:px-6 lg:px-8  bg-slate-50/50">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="mb-6 bg-white p-4 sm:p-6 shadow-md rounded-lg flex flex-col gap-4">
        {/* Mobile Filter Toggle */}
        <div className="flex justify-between items-center lg:hidden mb-2">
          <h2 className="text-sm font-medium">Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-slate-100 rounded-md hover:bg-slate-200 transition flex items-center gap-1"
          >
            <MdFilterList size={18} />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        <div
          className={`flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center ${
            showFilters ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Search */}
          <div className="w-full sm:w-1/2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="text-xs text-slate-500">Search</label>
            <input
              type="text"
              placeholder="Search name, phone, email or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 w-full sm:w-auto border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <button
              onClick={() => setSearchQuery("")}
              className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm rounded-md transition flex items-center justify-center sm:w-auto w-full"
              title="Clear search"
            >
              <span className="sm:hidden w-full">Clear</span>
              <span className="hidden sm:flex">
                <MdOutlineClear size={18} />
              </span>
            </button>
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap gap-3 items-end w-full">
            <div className="flex flex-col flex-1 min-w-37.5">
              <label className="text-xs text-slate-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col flex-1 min-w-37.5">
              <label className="text-xs text-slate-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col">
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm rounded-md transition flex items-center justify-center"
                title="Clear dates"
              >
                <MdOutlineClear size={18} />
              </button>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={downloadExcel}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition"
            >
              Export Excel
            </button>

            <button
              onClick={downloadPagePDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Export Current Page PDF
            </button>

            <button
              onClick={downloadAllPDF}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Export All Pages PDF
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Orders
        </h1>
        <p className="text-slate-500 mt-1">
          Track and manage customer orders efficiently.
        </p>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50  bg-green-500 text-white px-4 py-2 shadow-lg"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto  shadow-xl border border-slate-100">
        {loading ? (
          <div className="p-6 space-y-6">
            {/* Orders Table Skeleton */}
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {[
                      "Order ID",
                      "Customer",
                      "Address",
                      "Products",
                      "Total",
                      "Status",
                      "Payment",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...Array(5)].map((_, idx) => (
                    <tr
                      key={idx}
                      className="bg-white hover:bg-slate-50 transition-colors"
                    >
                      {Array(7)
                        .fill(0)
                        .map((_, i) => (
                          <td key={i} className="px-6 py-4">
                            <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Skeleton */}
            <div className="md:hidden space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 shadow-sm border border-slate-100 rounded-md flex flex-col gap-4"
                >
                  <div className="h-5 bg-slate-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-6 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-6 bg-slate-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Address",
                  "Products",
                  "Single Amount",
                  "Total",
                  "Status",
                  "Payment",
                  "Payment Proof View",
                  "Product View",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.map((order, idx) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={clsx(
                    "hover:bg-slate-50/50 transition-colors group",
                    order.status === "completed" &&
                      "bg-indigo-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-500 font-medium">
                      #{order._id}
                    </span>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {order.orderDate}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {order.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9  bg-linear-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {order.customerName.charAt(0)}
                      </div>

                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-slate-500">{order.phone}</p>
                        <p className="text-xs text-slate-500">{order.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-normal wrap-break-word">
                    {order.address}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {order.products.slice(0, 3).map((p, i) => (
                        <Image
                          key={i}
                          src={urlFor(p.product.images[0]).width(50).url()}
                          alt={p.product.name}
                          width={800}
                          height={800}
                          className="inline-block h-8 w-8  ring-2 ring-white object-cover"
                          title={`${p.product.name} (x${p.quantity})`}
                        />
                      ))}
                      {order.products.length > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center  bg-slate-100 ring-2 ring-white text-xs text-slate-500">
                          +{order.products.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {order.products.length} items
                    </p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700 text-sm">
                    {order.products.map((p) => p.product.price)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700 text-sm">
                    {order.totalAmount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group/select inline-block">
                      <StatusBadge status={order.status} />
                      <select
                        value={order.status}
                        disabled={order.status === "completed"}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            e.target.value as OrderStatus
                          )
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        setSelectedScreenshot(
                          urlFor(order.transactionScreenshot).url()
                        )
                      }
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50  transition-all"
                      title="View Proof of Payment"
                    >
                      <IoReceiptOutline size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrderProducts(order.products)}
                      className={clsx(
                        "p-2 bg-indigo-50 text-indigo-600",
                        order.status === "completed" &&
                          "opacity-50 cursor-not-allowed"
                      )}
                      title="View Products"
                      disabled={order.status === "completed"}
                    >
                      <GiHeartEarrings size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteOrderId(order._id)}
                        className={clsx(
                          "p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md",
                          order.status === "completed" &&
                            "opacity-50 cursor-not-allowed"
                        )}
                        title="Delete Order"
                        disabled={order.status === "completed"}
                      >
                        <FaTrash size={18} />
                      </button>

                      {/* Copy Order Data */}
                      <button
                        onClick={() => {
                          const orderData = {
                            id: order._id,
                            customerName: order.customerName,
                            phone: order.phone,
                            email: order.email,
                            address: order.address,
                            orderDate: order.orderDate,
                            time: order.time,
                            products: order.products.map((p) => ({
                              name: p.product.name,
                              quantity: p.quantity,
                              price: p.product.price,
                            })),
                            totalAmount: order.totalAmount,
                            status: order.status,
                            paymentMethod: order.paymentMethod,
                          };
                          navigator.clipboard.writeText(
                            JSON.stringify(orderData, null, 2)
                          );
                          toast.success("Order data copied to clipboard!");
                        }}
                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md"
                        title="Copy Order Data"
                      >
                        <MdContentCopy size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2 p-5 ">
          <p className="text-sm text-slate-500">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </p>

          <div className="flex items-center gap-1">
            {/* Prev Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md text-sm hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            {/* Page Buttons with ellipsis */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, current ±1, else ellipsis
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={clsx(
                      "px-3 py-1 border rounded-md text-sm hover:bg-indigo-100",
                      currentPage === page &&
                        "bg-indigo-600 text-white border-indigo-600"
                    )}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-slate-400">
                    ...
                  </span>
                );
              } else {
                return null;
              }
            })}

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md text-sm hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className={clsx(
              "bg-white p-4 shadow-sm border border-slate-100 rounded-md flex flex-col gap-4",
              order.status === "completed" &&
                "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-mono text-slate-400 block break-all">
                  ID-#{order._id}
                </span>
                <h3 className="font-bold text-slate-900 truncate">
                  {order.customerName}
                </h3>
                <p className="text-xs text-slate-500 truncate">{order.phone}</p>
                <p className="text-xs text-slate-500 truncate">{order.email}</p>
                <p className="text-xs text-slate-500 line-clamp-2 wrap-break-word">
                  {order.address}
                </p>
                <div className="text-xs text-slate-400 mt-0.5">
                  {order.orderDate} {order.time}
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Products */}
            <div className="flex flex-col gap-2 overflow-x-auto">
              {order.products.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-slate-50 p-2 rounded-md shrink-0 min-w-full"
                >
                  <Image
                    src={urlFor(p.product.images[0]).width(50).url()}
                    className="w-10 h-10 object-cover rounded-sm shrink-0"
                    width={50}
                    height={50}
                    alt={p.product.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {p.product.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Qty: {p.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-100 pt-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-slate-400">Total Amount</p>
                <p className="font-bold text-slate-900">{order.totalAmount}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Status Dropdown */}
                <div className="relative inline-flex items-center">
                  <div
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 text-xs font-semibold border cursor-pointer transition-all",
                      {
                        "bg-amber-100 text-amber-700 border-amber-200":
                          order.status === "pending",
                        "bg-blue-100 text-blue-700 border-blue-200":
                          order.status === "processing",
                        "bg-emerald-100 text-emerald-700 border-emerald-200":
                          order.status === "completed",
                        "opacity-50 cursor-not-allowed":
                          order.status === "completed",
                      }
                    )}
                    title={order.status}
                  >
                    {statusIcon[order.status]}
                    <ChevronDown size={14} />
                  </div>

                  <select
                    value={order.status}
                    disabled={order.status === "completed"}
                    onChange={(e) =>
                      handleStatusChange(
                        order._id,
                        e.target.value as OrderStatus
                      )
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Buttons */}
                <button
                  onClick={() =>
                    setSelectedScreenshot(
                      urlFor(order.transactionScreenshot).url()
                    )
                  }
                  className={clsx(
                    "p-2 bg-indigo-50 text-indigo-600 rounded-md",
                    order.status === "completed" &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  disabled={order.status === "completed"}
                >
                  <IoReceiptOutline size={18} />
                </button>

                <button
                  onClick={() => setSelectedOrderProducts(order.products)}
                  className={clsx(
                    "p-2 bg-indigo-50 text-indigo-600 rounded-md",
                    order.status === "completed" &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  disabled={order.status === "completed"}
                  title="View Products"
                >
                  <GiHeartEarrings size={18} />
                </button>

                <button
                  onClick={() => setDeleteOrderId(order._id)}
                  className={clsx(
                    "p-2 bg-red-50 text-red-600 rounded-md",
                    order.status === "completed" &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  disabled={order.status === "completed"}
                >
                  <FaTrash size={18} />
                </button>

                {/* Copy Data Button */}
                <button
                  onClick={() => {
                    const orderData = {
                      id: order._id,
                      customerName: order.customerName,
                      phone: order.phone,
                      email: order.email,
                      address: order.address,
                      orderDate: order.orderDate,
                      time: order.time,
                      products: order.products.map((p) => ({
                        name: p.product.name,
                        quantity: p.quantity,
                      })),
                      totalAmount: order.totalAmount,
                      status: order.status,
                    };
                    navigator.clipboard.writeText(
                      JSON.stringify(orderData, null, 2)
                    );
                    toast.success("Order data copied to clipboard!");
                  }}
                  className="p-2 bg-green-50 text-green-600 rounded-md"
                >
                  <span className="text-xs font-semibold">Copy Data</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScreenshot(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white  shadow-2xl overflow-hidden w-full max-w-lg max-h-full flex flex-col"
            >
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Payment Proof</h3>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-1 hover:bg-slate-100  transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Image */}
              <div className="p-4 bg-slate-100 overflow-auto flex-1 flex items-center justify-center">
                <Image
                  src={selectedScreenshot}
                  alt="Payment Screenshot"
                  width={800}
                  height={800}
                  className="max-w-full max-h-[80vh]  shadow-sm object-contain"
                />
              </div>

              {/* Actions */}
              <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
                <Link
                  href={selectedScreenshot || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-indigo-600 font-medium hover:underline"
                >
                  Open original in new tab
                </Link>

                {/* Download Button */}
                <button
                  onClick={() =>
                    selectedScreenshot && handleDownload(selectedScreenshot)
                  }
                  className="px-4 py-2 bg-indigo-600 text-white  text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Modal */}
      <AnimatePresence>
        {selectedOrderProducts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrderProducts(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white  shadow-2xl overflow-hidden w-full max-w-2xl max-h-full flex flex-col"
            >
              <div className="p-4 flex justify-between items-center border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">
                  Ordered Products
                </h3>
                <button
                  onClick={() => setSelectedOrderProducts(null)}
                  className="p-1 hover:bg-slate-100  transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Products List */}
              <div className="p-4 md:p-6 overflow-auto flex-1 flex flex-col gap-4 md:gap-6">
                {selectedOrderProducts.map((p, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-3 bg-slate-50  shadow-sm"
                  >
                    <Image
                      src={urlFor(p.product.images[0]).url()}
                      alt={p.product.name}
                      width={500}
                      height={500}
                      className="w-full max-w-62.5 h-auto  object-cover shadow-md"
                    />
                    <div className="flex-1 text-center md:text-left">
                      <p className="font-bold text-slate-800 text-lg">
                        {p.product.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Qty: {p.quantity}
                      </p>
                      <p className="text-base font-semibold text-slate-900 mt-1">
                        ${p.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white  p-6 w-full max-w-sm shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-900">
                Delete Order?
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                This action cannot be undone. Are you sure?
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteOrderId(null)}
                  className="px-4 py-2  bg-slate-100 text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteOrder}
                  disabled={deleting}
                  className="px-4 py-2  bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;
