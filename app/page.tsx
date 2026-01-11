"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "./components/DashboardCard";
import Navbar from "./components/Navbar";
import { SessionProvider } from "next-auth/react";
import ProtectedRoute from "./components/ProtectedRoute";

interface Product {
  quantity: number;
  // Add more fields if needed
}

interface Order {
  products: Product[];
  status: "pending" | "processing" | "completed";
  // Add more fields if needed
}

export default function HomePage() {
  const [orderCount, setOrderCount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("/api/orders");
      const orders: Order[] = await res.json(); // ✅ type-safe

      setOrderCount(orders.length);

      const totalQuantity = orders.reduce(
        (total, order) =>
          total + order.products.reduce((sum, p) => sum + p.quantity, 0),
        0
      );
      setTotalQuantity(totalQuantity);

      setPendingCount(orders.filter((o) => o.status === "pending").length);
      setProcessingCount(
        orders.filter((o) => o.status === "processing").length
      );
      setCompletedCount(orders.filter((o) => o.status === "completed").length);

      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="pt-10 px-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-32 bg-white rounded-lg shadow-md p-6 animate-pulse flex flex-col justify-between"
          >
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>{" "}
            {/* title placeholder */}
            <div className="h-10 bg-slate-300 rounded w-1/2 mt-4"></div>{" "}
            {/* value placeholder */}
          </div>
        ))}
      </div>
    );

  return (
    <>
      <SessionProvider>
        <ProtectedRoute>
          <Navbar />
          <div className=" pt-10 pb-30 sm:pt-30 px-10">
            <h1 className="text-2xl font-bold mb-6">Home Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
              <DashboardCard title="Total Orders" value={orderCount} />
              <DashboardCard title="Total Items Sold" value={totalQuantity} />
              <DashboardCard title="Pending Orders" value={pendingCount} />
              <DashboardCard
                title="Processing Orders"
                value={processingCount}
              />
              <DashboardCard title="Completed Orders" value={completedCount} />
            </div>
          </div>
        </ProtectedRoute>
      </SessionProvider>
    </>
  );
}
