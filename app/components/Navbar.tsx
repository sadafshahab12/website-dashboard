"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Home, ShoppingCart, Zap, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { signOut, useSession } from "next-auth/react";
import { MdPermContactCalendar } from "react-icons/md";

const NAV_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Order", path: "/order", icon: ShoppingCart },
  { name: "Contact", path: "/contacts", icon: MdPermContactCalendar },
];

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  return (
    <>
      {/* ---------------- DESKTOP ---------------- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-20 justify-center px-6"
      >
        <div className="flex w-full max-w-5xl items-center justify-between rounded-2xl bg-white/70 px-6 py-3 shadow-xl backdrop-blur-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Zap size={20} />
            </div>
            <span className="text-xl font-bold text-indigo-600">
              Pearion Collections
            </span>
          </Link>

          {/* Links */}
          <div className="flex gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-medium",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="rounded-full bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </motion.nav>

      {/* ---------------- MOBILE ---------------- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-lg border-t">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Nav Items */}
          <div className="flex flex-1 justify-around">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setActiveTab(item.path)}
                  className="flex flex-col items-center"
                >
                  <Icon
                    size={22}
                    className={clsx(
                      isActive ? "text-indigo-600" : "text-slate-400"
                    )}
                  />
                  <span className="text-[10px] mt-1">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="ml-3 rounded-full bg-red-500 p-2 text-white"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
