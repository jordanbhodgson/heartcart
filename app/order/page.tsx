"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { nursingHomes, gifts, categoryLabels, type NursingHome, type Gift } from "@/lib/data";

type Step = "home" | "recipient" | "gifts" | "checkout" | "confirmation";

interface CartItem {
  gift: Gift;
  quantity: number;
}

interface OrderDetails {
  home: NursingHome | null;
  recipientName: string;
  recipientRoom: string;
  cart: CartItem[];
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
}

const FAMILY_CODE_KEY = "heartcart_family_code";

const STEPS: { id: Step; label: string }[] = [
  { id: "home", label: "Nursing Home" },
  { id: "recipient", label: "Recipient" },
  { id: "gifts", label: "Choose Gifts" },
  { id: "checkout", label: "Checkout" },
];

const stepIndex = (step: Step) => STEPS.findIndex((s) => s.id === step);

export default function OrderPage() {
  const [step, setStep] = useState<Step>("home");
  const [order, setOrder] = useState<OrderDetails>({
    home: null,
    recipientName: "",
    recipientRoom: "",
    cart: [],
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    message: "",
  });
  const [homeSearch, setHomeSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Gift["category"] | "all" | "popular">("popular");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const [applePayUsed, setApplePayUsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(FAMILY_CODE_KEY);
    if (saved) setFamilyCode(saved);
  }, []);

  const filteredHomes = nursingHomes.filter(
    (h) =>
      h.name.toLowerCase().includes(homeSearch.toLowerCase()) ||
      h.city.toLowerCase().includes(homeSearch.toLowerCase()) ||
      h.address.toLowerCase().includes(homeSearch.toLowerCase())
  );

  const filteredGifts =
    activeCategory === "all"
      ? gifts
      : activeCategory === "popular"
      ? gifts.filter((g) => g.popular)
      : gifts.filter((g) => g.category === activeCategory);

  const cartTotal = order.cart.reduce((sum, item) => sum + item.gift.price * item.quantity, 0);
  const cartCount = order.cart.reduce((sum, item) => sum + item.quantity, 0);

  function updateCart(gift: Gift, delta: number) {
    setOrder((prev) => {
      const existing = prev.cart.find((c) => c.gift.id === gift.id);
      if (!existing && delta > 0) {
        return { ...prev, cart: [...prev.cart, { gift, quantity: 1 }] };
      }
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return { ...prev, cart: prev.cart.filter((c) => c.gift.id !== gift.id) };
        }
        return {
          ...prev,
          cart: prev.cart.map((c) => (c.gift.id === gift.id ? { ...c, quantity: newQty } : c)),
        };
      }
      return prev;
    });
  }

  function getQty(giftId: string) {
    return order.cart.find((c) => c.gift.id === giftId)?.quantity ?? 0;
  }

  function validateRecipient() {
    const errs: Record<string, string> = {};
    if (!order.recipientName.trim()) errs.recipientName = "Please enter the resident's name.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateCheckout() {
    const errs: Record<string, string> = {};
    if (!order.senderName.trim()) errs.senderName = "Your name is required.";
    if (!order.senderEmail.trim() || !order.senderEmail.includes("@"))
      errs.senderEmail = "A valid email is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function placeOrder() {
    if (!validateCheckout()) return;
    setStep("confirmation");
  }

  function handleApplePay() {
    if (!validateCheckout()) return;
    setApplePayUsed(true);
    setStep("confirmation");
  }

  function resetOrder() {
    setStep("home");
    setApplePayUsed(false);
    setOrder({
      home: null,
      recipientName: "",
      recipientRoom: "",
      cart: [],
      senderName: "",
      senderEmail: "",
      senderPhone: "",
      message: "",
    });
    setHomeSearch("");
  }

  const currentStepIndex = stepIndex(step);

  if (step === "confirmation") {
    return (
      <ConfirmationScreen
        order={order}
        cartTotal={cartTotal}
        onReset={resetOrder}
        savedFamilyCode={familyCode}
        onFamilyCodeSaved={(code) => setFamilyCode(code)}
        applePayUsed={applePayUsed}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 33C20 33 3 22.5 3 12.5C3 7.25 7.25 3 12.5 3C15.5 3 18.2 4.4 20 6.6C21.8 4.4 24.5 3 27.5 3C32.75 3 37 7.25 37 12.5C37 22.5 20 33 20 33Z" fill="#ef4444" />
                <text x="20" y="19" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">HC</text>
              </svg>
              <span className="text-2xl font-bold text-gray-900">HeartCart</span>
            </Link>
            <span className="text-sm text-gray-400 hidden sm:inline">Palm Springs Area</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">Family Dashboard</span>
              <span className="sm:hidden">Family</span>
              {familyCode && (
                <span className="bg-gray-100 text-gray-600 text-xs font-mono px-1.5 py-0.5 rounded">
                  {familyCode}
                </span>
              )}
            </Link>
            {cartCount > 0 && step !== "checkout" && (
              <button
                onClick={() => setStep("checkout")}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
              >
                <span>Cart</span>
                <span className="bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero — only on first step */}
      {step === "home" && (
        <div
          className="relative text-white py-16 px-4"
          style={{
            backgroundImage: "url('/hero.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
          }}
        >
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-2">Palm Springs Area 🌵</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
              Gratitude delivered<br />with HeartCart.
            </h1>
            <p className="text-white/85 text-lg max-w-xl mx-auto drop-shadow">
              In-season and regionally-themed gifts for the wisest people we know <span className="whitespace-nowrap">👵🏽👴🏼💌👴🏾👵🏻</span>
            </p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < currentStepIndex
                      ? "step-done"
                      : i === currentStepIndex
                      ? "step-active"
                      : "step-upcoming"
                  }`}
                >
                  {i < currentStepIndex ? "✓" : i + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    i === currentStepIndex ? "text-gray-900" : i < currentStepIndex ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-1 ${i < currentStepIndex ? "bg-gray-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step: Choose Nursing Home */}
        {step === "home" && (
          <div>
            <h2 className="text-2xl font-bold mb-1">Which facility?</h2>
            <p className="text-gray-500 mb-5">Search by name or city in the Coachella Valley.</p>
            <input
              className="input mb-5"
              placeholder="Search Palm Springs, Palm Desert, Rancho Mirage..."
              value={homeSearch}
              onChange={(e) => setHomeSearch(e.target.value)}
            />
            <div className="space-y-3">
              {filteredHomes.map((h) => (
                <button
                  key={h.id}
                  onClick={() => { setOrder((p) => ({ ...p, home: h })); setStep("recipient"); }}
                  className={`card w-full text-left p-4 hover:border-gray-300 hover:shadow-sm transition-all ${
                    order.home?.id === h.id ? "border-gray-900 ring-2 ring-gray-200" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{h.name}</p>
                      <p className="text-sm text-gray-500">{h.address}, {h.city}</p>
                      {h.delivery_notes && (
                        <p className="text-xs text-gray-500 mt-1 font-medium">{h.delivery_notes}</p>
                      )}
                    </div>
                    <span className="text-gray-400 text-lg mt-0.5">→</span>
                  </div>
                </button>
              ))}
              {filteredHomes.length === 0 && (
                <div className="card p-8 text-center text-gray-400">
                  <p className="text-3xl mb-2">🔍</p>
                  <p>No facilities match your search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step: Recipient Info */}
        {step === "recipient" && (
          <div>
            <button onClick={() => setStep("home")} className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
              ← Back
            </button>
            <div className="card p-4 mb-6 bg-gray-50 border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Delivering to</p>
              <p className="font-bold text-gray-800">{order.home?.name}</p>
              <p className="text-sm text-gray-500">{order.home?.address}, {order.home?.city}</p>
            </div>
            <h2 className="text-2xl font-bold mb-1">Who is this for?</h2>
            <p className="text-gray-500 mb-5">The facility staff will deliver it to their room.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Resident&apos;s Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  className={`input ${errors.recipientName ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  placeholder="e.g. Mary Johnson"
                  value={order.recipientName}
                  onChange={(e) => { setOrder((p) => ({ ...p, recipientName: e.target.value })); setErrors({}); }}
                />
                {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Room Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  className="input"
                  placeholder="e.g. 214B"
                  value={order.recipientRoom}
                  onChange={(e) => setOrder((p) => ({ ...p, recipientRoom: e.target.value }))}
                />
              </div>
            </div>
            <button
              className="btn-primary w-full mt-8"
              onClick={() => { if (validateRecipient()) setStep("gifts"); }}
            >
              Continue to Gifts →
            </button>
          </div>
        )}

        {/* Step: Choose Gifts */}
        {step === "gifts" && (
          <div>
            <button onClick={() => setStep("recipient")} className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
              ← Back
            </button>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-bold">Choose gifts</h2>
              {cartCount > 0 && (
                <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                  ${cartTotal} ({cartCount} item{cartCount !== 1 ? "s" : ""})
                </span>
              )}
            </div>
            <p className="text-gray-500 mb-5">
              For {order.recipientName} at {order.home?.name}
            </p>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4">
              {(["popular", "all", "fruit", "snack", "comfort", "flowers", "activity"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {cat === "popular" ? "Popular" : cat === "all" ? "All" : categoryLabels[cat]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredGifts.map((gift) => {
                const qty = getQty(gift.id);
                return (
                  <div
                    key={gift.id}
                    className={`bg-white rounded-xl overflow-hidden border transition-all ${
                      qty > 0
                        ? "border-gray-900 shadow-sm"
                        : "border-gray-100 hover:shadow-sm hover:border-gray-200"
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      <Image
                        src={gift.image}
                        alt={gift.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 300px"
                      />
                      {gift.popular && (
                        <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      {qty > 0 && (
                        <div className="absolute top-2 right-2 bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {qty}
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">{gift.name}</p>

                      <div className="flex items-center gap-1 mb-1.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <svg
                              key={i}
                              className="w-3 h-3"
                              viewBox="0 0 20 20"
                              fill={i < Math.round(gift.rating) ? "#f59e0b" : "none"}
                              stroke="#f59e0b"
                              strokeWidth="1.5"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">({gift.reviewCount})</span>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{gift.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-base">${gift.price}</span>
                        <div className="flex items-center gap-1.5">
                          {qty > 0 && (
                            <>
                              <button
                                onClick={() => updateCart(gift, -1)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center transition-colors text-sm"
                              >
                                −
                              </button>
                              <span className="w-4 text-center font-semibold text-sm">{qty}</span>
                            </>
                          )}
                          <button
                            onClick={() => updateCart(gift, 1)}
                            className="w-7 h-7 rounded-full bg-gray-900 hover:bg-gray-700 text-white font-bold flex items-center justify-center transition-colors text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {cartCount > 0 && (
              <div className="sticky bottom-4 mt-6">
                <button className="btn-primary w-full text-lg py-4 shadow-lg" onClick={() => setStep("checkout")}>
                  Review Order — ${cartTotal} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: Checkout */}
        {step === "checkout" && (
          <div>
            <button onClick={() => setStep("gifts")} className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
              ← Back to Gifts
            </button>
            <h2 className="text-2xl font-bold mb-1">Review & send</h2>
            <p className="text-gray-500 mb-6">Almost there! Just a few details.</p>

            <div className="card p-4 mb-6">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">Order Summary</p>
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-500 font-semibold">Delivering to</p>
                <p className="font-bold">{order.recipientName}</p>
                <p className="text-sm text-gray-600">{order.home?.name}{order.recipientRoom ? `, Room ${order.recipientRoom}` : ""}</p>
              </div>
              <div className="space-y-2">
                {order.cart.map((item) => (
                  <div key={item.gift.id} className="flex items-center justify-between">
                    <span className="text-gray-700">
                      <span className="mr-1">{item.gift.emoji}</span>
                      {item.gift.name}
                      {item.quantity > 1 && <span className="text-gray-400 text-sm"> ×{item.quantity}</span>}
                    </span>
                    <span className="font-semibold">${item.gift.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-gray-900">${cartTotal}</span>
                </div>
                <p className="text-xs text-gray-400 text-right">+ local delivery fee calculated at payment</p>
              </div>
              <button onClick={() => setStep("gifts")} className="text-sm text-gray-500 hover:text-gray-900 mt-2 font-medium">
                Edit gifts
              </button>
            </div>

            <div className="card p-4 mb-4">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">Your Info</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={`input ${errors.senderName ? "border-red-400 ring-1 ring-red-400" : ""}`}
                    placeholder="e.g. Sarah Johnson"
                    value={order.senderName}
                    onChange={(e) => { setOrder((p) => ({ ...p, senderName: e.target.value })); setErrors({}); }}
                  />
                  {errors.senderName && <p className="text-red-500 text-sm mt-1">{errors.senderName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    className={`input ${errors.senderEmail ? "border-red-400 ring-1 ring-red-400" : ""}`}
                    placeholder="you@example.com"
                    value={order.senderEmail}
                    onChange={(e) => { setOrder((p) => ({ ...p, senderEmail: e.target.value })); setErrors({}); }}
                  />
                  {errors.senderEmail && <p className="text-red-500 text-sm mt-1">{errors.senderEmail}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone <span className="text-gray-400 font-normal">(optional, for delivery updates)</span>
                  </label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="(555) 555-5555"
                    value={order.senderPhone}
                    onChange={(e) => setOrder((p) => ({ ...p, senderPhone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="card p-4 mb-6">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">Personal Message</p>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Add a heartfelt note to include with the gift... (optional)"
                value={order.message}
                onChange={(e) => setOrder((p) => ({ ...p, message: e.target.value }))}
              />
            </div>

            <div className="card p-4 mb-6">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-4">Payment</p>
              <button
                onClick={handleApplePay}
                className="w-full bg-black text-white rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-base hover:bg-gray-900 transition-colors mb-4"
              >
                <svg width="20" height="20" viewBox="0 0 814 1000" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-157.5-109.2C87.3 699.5 58.3 625.1 58.3 554.2 58.3 413.7 148.7 325.1 237 325.1c65.2 0 119.5 43.4 160.6 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
                Pay
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or pay with card</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-3">
                <input className="input" placeholder="Card number" readOnly defaultValue="" />
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" placeholder="MM / YY" readOnly />
                  <input className="input" placeholder="CVC" readOnly />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Payment processing is a demo — no real charge will occur.</p>
            </div>

            <button className="btn-primary w-full text-lg py-4" onClick={placeOrder}>
              Place Order — ${cartTotal}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmationScreen({
  order, cartTotal, onReset, savedFamilyCode, onFamilyCodeSaved, applePayUsed,
}: {
  order: OrderDetails;
  cartTotal: number;
  onReset: () => void;
  savedFamilyCode: string | null;
  onFamilyCodeSaved: (code: string) => void;
  applePayUsed: boolean;
}) {
  const [familyCode, setFamilyCode] = useState(savedFamilyCode ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (savedFamilyCode && !saved) postToFamily(savedFamilyCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function postToFamily(code: string) {
    if (!order.home) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/family/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: order.senderName,
          recipientName: order.recipientName,
          recipientRoom: order.recipientRoom || undefined,
          home: { id: order.home.id, name: order.home.name, city: order.home.city, address: order.home.address },
          items: order.cart.map((c) => ({ id: c.gift.id, name: c.gift.name, emoji: c.gift.emoji, quantity: c.quantity, price: c.gift.price })),
          total: cartTotal,
          message: order.message || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      localStorage.setItem(FAMILY_CODE_KEY, code.toUpperCase());
      onFamilyCodeSaved(code.toUpperCase());
      setSaved(true);
    } catch {
      setSaveError("Could not save to family dashboard. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleSaveToFamily() {
    const clean = familyCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length < 4) { setSaveError("Enter at least 4 characters."); return; }
    postToFamily(clean);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-7xl mb-4">🎁</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gift sent!</h1>
          <p className="text-gray-500">
            Your order for <span className="font-semibold text-gray-700">{order.recipientName}</span> at{" "}
            <span className="font-semibold text-gray-700">{order.home?.name}</span> has been placed. We&apos;ll email{" "}
            <span className="text-gray-700 font-medium">{order.senderEmail}</span> with tracking info.
          </p>
          {applePayUsed && (
            <div className="inline-flex items-center gap-1.5 mt-3 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <svg width="12" height="12" viewBox="0 0 814 1000" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-157.5-109.2C87.3 699.5 58.3 625.1 58.3 554.2 58.3 413.7 148.7 325.1 237 325.1c65.2 0 119.5 43.4 160.6 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
              </svg>
              Paid with Apple Pay
            </div>
          )}
        </div>

        <div className="card p-5 mb-4">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">What you sent</p>
          <div className="space-y-2">
            {order.cart.map((item) => (
              <div key={item.gift.id} className="flex items-center justify-between text-sm">
                <span><span className="mr-1.5">{item.gift.emoji}</span>{item.gift.name}{item.quantity > 1 ? ` ×${item.quantity}` : ""}</span>
                <span className="font-medium">${item.gift.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t border-gray-100 text-gray-900">
              <span>Total</span><span>${cartTotal}</span>
            </div>
          </div>
          {order.message && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-semibold mb-1">Your message</p>
              <p className="text-gray-600 text-sm italic">&ldquo;{order.message}&rdquo;</p>
            </div>
          )}
        </div>

        {saved ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-semibold text-gray-700">Added to family dashboard</p>
              <p className="text-sm text-gray-600">
                Your family can see this at <Link href="/dashboard" className="underline font-medium">/dashboard</Link> using code <span className="font-mono font-bold">{savedFamilyCode}</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="card p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Track with your family</p>
            <p className="text-xs text-gray-500 mb-3">Add this order to a shared family dashboard so everyone knows what&apos;s been sent.</p>
            <div className="flex gap-2">
              <input
                className="input flex-1 text-center font-mono tracking-widest uppercase text-sm"
                placeholder="Family code"
                maxLength={6}
                value={familyCode}
                onChange={(e) => { setFamilyCode(e.target.value.toUpperCase()); setSaveError(""); }}
              />
              <button className="btn-primary px-4 py-2 text-sm whitespace-nowrap" onClick={handleSaveToFamily} disabled={saving}>
                {saving ? "Saving..." : "Add"}
              </button>
            </div>
            {saveError && <p className="text-red-500 text-sm mt-2">{saveError}</p>}
            <p className="text-xs text-gray-400 mt-2">
              No code yet?{" "}
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium underline">Create one at Family Dashboard</Link>
            </p>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-600">
          <p className="font-semibold mb-1">Delivery info</p>
          <p>Our local team will deliver to {order.home?.name} within 2–4 hours during business hours. Staff will hand-deliver to {order.recipientName}&apos;s room.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onReset} className="btn-secondary flex-1">Send another gift</button>
          <Link href="/dashboard" className="btn-primary flex-1 text-center">View dashboard</Link>
        </div>
      </div>
    </div>
  );
}
