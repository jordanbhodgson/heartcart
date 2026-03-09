"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { StoredOrder } from "@/lib/store";

const FAMILY_CODE_KEY = "heartcart_family_code";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "bg-amber-100 text-amber-700" },
  in_transit: { label: "On the way", color: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", color: "bg-gray-100 text-gray-700" },
};

export default function Dashboard() {
  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = useCallback(async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/family/${code}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      setError("Could not load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(FAMILY_CODE_KEY);
    if (saved) {
      setFamilyCode(saved);
      fetchOrders(saved);
    }
  }, [fetchOrders]);

  function handleJoin(code: string) {
    const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (clean.length < 4) { setError("Enter at least 4 characters."); return; }
    localStorage.setItem(FAMILY_CODE_KEY, clean);
    setFamilyCode(clean);
    fetchOrders(clean);
  }

  function handleCreate() {
    const code = generateCode();
    localStorage.setItem(FAMILY_CODE_KEY, code);
    setFamilyCode(code);
    setOrders([]);
  }

  function handleLogout() {
    localStorage.removeItem(FAMILY_CODE_KEY);
    setFamilyCode(null);
    setOrders([]);
    setCodeInput("");
  }

  // Summary stats
  const totalGifts = orders.reduce((s, o) => s + o.items.reduce((x, i) => x + i.quantity, 0), 0);
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const uniqueSenders = [...new Set(orders.map((o) => o.senderName))];

  if (!familyCode) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg width="36" height="32" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 33C20 33 3 22.5 3 12.5C3 7.25 7.25 3 12.5 3C15.5 3 18.2 4.4 20 6.6C21.8 4.4 24.5 3 27.5 3C32.75 3 37 7.25 37 12.5C37 22.5 20 33 20 33Z" fill="#ef4444" />
                <text x="20" y="19" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">HC</text>
              </svg>
              <span className="text-2xl font-bold text-gray-900">HeartCart</span>
            </Link>
            <span className="text-sm text-gray-400">Family Dashboard</span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Family Dashboard</h1>
              <p className="text-gray-500">See all gifts your family has sent, shared in one place.</p>
            </div>

            <div className="card p-6 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Join with a family code</p>
              <input
                className="input mb-3 text-center text-lg font-mono tracking-widest uppercase"
                placeholder="Enter code"
                maxLength={6}
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleJoin(codeInput)}
              />
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button
                className="btn-primary w-full"
                onClick={() => handleJoin(codeInput)}
              >
                Join Family
              </button>
            </div>

            <div className="text-center text-gray-400 text-sm mb-4">or</div>

            <button
              className="btn-secondary w-full"
              onClick={handleCreate}
            >
              Create a new family group
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Share your family code with relatives so everyone can see what&apos;s been sent.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <svg width="36" height="32" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 33C20 33 3 22.5 3 12.5C3 7.25 7.25 3 12.5 3C15.5 3 18.2 4.4 20 6.6C21.8 4.4 24.5 3 27.5 3C32.75 3 37 7.25 37 12.5C37 22.5 20 33 20 33Z" fill="#ef4444" />
                <text x="20" y="19" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">HC</text>
              </svg>
              <span className="text-2xl font-bold text-gray-900">HeartCart</span>
            </Link>
            <span className="text-xs text-gray-400 hidden sm:inline">Family Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">Family code</p>
              <p className="font-mono font-bold text-gray-900 tracking-widest text-sm">{familyCode}</p>
            </div>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Share banner */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Share this code with family</p>
            <p className="text-xs text-gray-500 mt-0.5">Anyone with the code can view and add orders.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono font-bold text-xl text-gray-900 tracking-widest bg-white px-3 py-1 rounded-lg border border-gray-200">
              {familyCode}
            </span>
            <button
              onClick={() => navigator.clipboard?.writeText(familyCode)}
              className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 bg-white px-2 py-1.5 rounded-lg transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-xs text-gray-500 mt-1">Order{orders.length !== 1 ? "s" : ""} sent</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{totalGifts}</p>
              <p className="text-xs text-gray-500 mt-1">Gift{totalGifts !== 1 ? "s" : ""} total</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">${totalSpent}</p>
              <p className="text-xs text-gray-500 mt-1">Total spent</p>
            </div>
          </div>
        )}

        {/* Who has sent */}
        {uniqueSenders.length > 1 && (
          <div className="card p-4 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Family members</p>
            <div className="flex flex-wrap gap-2">
              {uniqueSenders.map((name) => {
                const count = orders.filter((o) => o.senderName === name).length;
                return (
                  <div key={name} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center">
                      {name[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{name}</span>
                    <span className="text-xs text-gray-400">{count} order{count !== 1 ? "s" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order list */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {orders.length === 0 ? "No orders yet" : "Gift history"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(familyCode)}
              className="text-sm text-gray-500 hover:text-gray-900 font-medium"
            >
              Refresh
            </button>
            <Link
              href="/order"
              className="btn-primary text-sm py-2 px-4"
            >
              Send a gift
            </Link>
          </div>
        </div>

        {loading && (
          <div className="card p-12 text-center text-gray-400">
            <div className="animate-spin text-3xl mb-3">⏳</div>
            <p>Loading orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="card p-8 text-center text-red-400">
            <p>{error}</p>
            <button onClick={() => fetchOrders(familyCode)} className="mt-3 text-sm underline">Retry</button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🎁</div>
            <p className="text-gray-600 font-semibold mb-1">No gifts sent yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Share your family code <span className="font-mono font-bold text-gray-900">{familyCode}</span> so
              everyone&apos;s orders show up here.
            </p>
            <Link href="/order" className="btn-primary inline-block">
              Send the first gift
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => {
              const isExpanded = expanded === order.id;
              const status = STATUS_CONFIG[order.status];
              return (
                <div
                  key={order.id}
                  className={`card overflow-hidden transition-all ${isExpanded ? "border-gray-300 ring-1 ring-gray-200" : ""}`}
                >
                  <button
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-800">{order.senderName}</span>
                          <span className="text-gray-400 text-sm">sent to</span>
                          <span className="font-semibold text-gray-800">{order.recipientName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {order.home.name} &middot; {order.items.map((i) => `${i.emoji} ${i.name}`).join(", ")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900">${order.total}</p>
                        <p className="text-xs text-gray-400">{timeAgo(order.orderedAt)}</p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Recipient</p>
                          <p className="font-medium">{order.recipientName}</p>
                          {order.recipientRoom && <p className="text-gray-500">Room {order.recipientRoom}</p>}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Facility</p>
                          <p className="font-medium">{order.home.name}</p>
                          <p className="text-gray-500">{order.home.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Sent by</p>
                          <p className="font-medium">{order.senderName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Date & time</p>
                          <p className="font-medium">{formatDate(order.orderedAt)}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Items sent</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span>
                                <span className="mr-1.5">{item.emoji}</span>
                                {item.name}
                                {item.quantity > 1 && <span className="text-gray-400"> ×{item.quantity}</span>}
                              </span>
                              <span className="font-medium text-gray-600">${item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-200 mt-1">
                            <span>Total</span>
                            <span className="text-gray-900">${order.total}</span>
                          </div>
                        </div>
                      </div>

                      {order.message && (
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Message</p>
                          <p className="text-sm text-gray-600 italic bg-white rounded-xl px-3 py-2 border border-gray-100">
                            &ldquo;{order.message}&rdquo;
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 font-mono">Order #{order.id}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
