"use client";
import React, { useEffect, useState } from "react";
import { Contact } from "@/app/types";
import { fetchContacts } from "../lib/fetchContacts";
import toast from "react-hot-toast";
import { Clipboard, Search, Mail, Calendar, MessageSquare } from "lucide-react";
import { FaTrash } from "react-icons/fa";
import { ConfirmModal } from "../components/ConfirmModal";

const ContactPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filtered, setFiltered] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    fetchContacts()
      .then((data) => {
        setContacts(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFiltered(
      contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(value) ||
          c.email.toLowerCase().includes(value) ||
          c.subject.toLowerCase().includes(value)
      )
    );
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied!", {
      style: {
        border: "1px solid #FFD700",
        padding: "8px 16px",
        color: "#333",
        background: "#FFF8DC",
      },
      icon: "📋",
    });
  };
  const handleDelete = async (id: string) => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/delete-contact", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setContacts((prev) => prev.filter((c) => c._id !== id));
        setFiltered((prev) => prev.filter((c) => c._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete contact");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pearion-gold"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 md:px-12 pt-10 sm:pt-30 pb-30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Inquiries
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and respond to your latest contact submissions.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pearion-gold transition-colors"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Filter by name, email..."
              className="w-full md:w-80 pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-pearion-gold/10 focus:border-pearion-gold outline-none transition-all"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-auto max-h-[70vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Phone
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Country
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Subject
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Message
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? (
                filtered.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-pearion-gold/10 flex items-center justify-center text-pearion-gold font-bold text-sm">
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {contact.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                        {contact.subject}
                      </span>
                    </td>
                    {/* Phone */}
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {contact.phone || "-"}
                    </td>

                    {/* Country */}
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {contact.country || "-"}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-600 max-w-xs wrap-break-word italic">
                        {`  "${contact.message}"`}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>
                          {new Date(contact._createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs opacity-60">
                          {new Date(contact._createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => copyEmail(contact.email)}
                        className="p-2 text-gray-400 hover:text-pearion-gold hover:bg-pearion-gold/5 rounded-lg transition-all"
                        title="Copy Email"
                      >
                        <Clipboard size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(contact._id);
                          setModalOpen(true);
                        }}
                        className="p-2 text-red-400"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Search size={40} className="text-gray-200 mb-2" />
                      <p className="text-gray-400 font-medium">
                        No results found for your search
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filtered.map((contact) => (
            <div
              key={contact._id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-pearion-gold/10 flex items-center justify-center text-pearion-gold font-bold">
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{contact.name}</h3>
                    <p className="text-xs text-gray-500">{contact.email}</p>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => copyEmail(contact.email)}
                    className="p-2 text-gray-400"
                  >
                    <Clipboard size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(contact._id);
                      setModalOpen(true);
                    }}
                    className="p-2 text-red-400"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  <span className="font-medium px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">
                    {contact.subject}
                  </span>
                </div>
                <div className="flex gap-2 text-sm text-gray-600">
                  <MessageSquare
                    size={14}
                    className="text-gray-400 mt-1 shrink-0"
                  />
                  <p className="leading-relaxed wrap-break-word whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {contact.message}
                  </p>
                </div>

                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {contact.phone}
                  </div>
                )}
                {/* Country */}
                {contact.country && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Country:</span>{" "}
                    {contact.country}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-50 flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
                  <Calendar size={12} />
                  {new Date(contact._createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
        }}
      />
    </div>
  );
};

export default ContactPage;
