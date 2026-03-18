"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingService, sanitizePhone } from "@/services/onboardingService";
import type { OnboardingServiceItem } from "@/services/onboardingService";
import { toast } from "sonner";
import GridIcon from "@/components/landing/GridIcon";

// --- Icons ---
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

// --- Types ---
type Barber = {
  id: string;
  name: string;
  specialty?: string;
  photo?: string;
  phone: string;
  instagram?: string;
};

type ServiceForm = {
  id: string;
  name: string;
  price: string;
  duration: string;
};


export default function OnboardingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isLaunching, setIsLaunching] = useState(false);

  // Step 1 — Shop
  const [shopName, setShopName] = useState("");
  const [shopSlug, setShopSlug] = useState("");
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [shopAbout, setShopAbout] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopPhone, setShopPhone] = useState("");

  // Slug availability
  type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2 — Barbers
  const [barbers, setBarbers] = useState<Barber[]>([
    { id: "1", name: "", specialty: "", phone: "", instagram: "" },
  ]);

  // Step 3 — Services
  const [services, setServices] = useState<ServiceForm[]>([
    { id: "1", name: "", price: "", duration: "30" },
  ]);

  // Auto-generate slug from shop name
  useEffect(() => {
    if (shopName && currentStep === 1) {
      setShopSlug(
        shopName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
          .substring(0, 50)
      );
    }
  }, [shopName, currentStep]);

  // Real-time slug availability check (debounced 500ms)
  useEffect(() => {
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);

    if (!shopSlug || shopSlug.length < 3) {
      setSlugStatus("idle");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(shopSlug)) {
      setSlugStatus("invalid");
      return;
    }

    setSlugStatus("checking");
    slugDebounceRef.current = setTimeout(async () => {
      const { available } = await onboardingService.checkSlug(shopSlug);
      setSlugStatus(available ? "available" : "taken");
    }, 500);

    return () => {
      if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    };
  }, [shopSlug]);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) return null;

  // --- Handlers ---
  const handleNext = () => setCurrentStep((p) => Math.min(p + 1, totalSteps));
  const handleBack = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const addBarber = () => {
    if (barbers.length < 10) {
      setBarbers([...barbers, { id: Date.now().toString(), name: "", specialty: "", phone: "", instagram: "" }]);
    }
  };
  const removeBarber = (id: string) => setBarbers(barbers.filter((b) => b.id !== id));
  const updateBarber = (id: string, field: keyof Barber, value: string) =>
    setBarbers(barbers.map((b) => (b.id === id ? { ...b, [field]: value } : b)));

  const addService = () => {
    if (services.length < 20) {
      setServices([...services, { id: Date.now().toString(), name: "", price: "", duration: "30" }]);
    }
  };
  const removeService = (id: string) => setServices(services.filter((s) => s.id !== id));
  const updateService = (id: string, field: keyof ServiceForm, value: string) =>
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const handleLaunch = async () => {
    setIsLaunching(true);
    const { data, error } = await onboardingService.complete({
      shop: {
        name: shopName,
        slug: shopSlug,
        description: shopAbout || undefined,
        phone: shopPhone ? sanitizePhone(shopPhone) : undefined,
        address: shopAddress || undefined,
      },
      barbers: barbers
        .filter((b) => b.name.trim() && b.phone.trim())
        .map((b) => ({
          name: b.name.trim(),
          specialty: b.specialty?.trim() || undefined,
          phone: sanitizePhone(b.phone),
          instagram: b.instagram?.trim() || undefined,
        })),
      services: services
        .filter((s) => s.name.trim() && s.price.trim())
        .map((s) => ({
          name: s.name.trim(),
          price: s.price,
          duration: s.duration,
        })),
    });

    setIsLaunching(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Your barbershop is live!");
    router.push(`/dashboard`);
  };

  // --- Validation ---
  const isStep1Valid =
    shopName.trim().length >= 3 &&
    shopSlug.trim().length >= 3 &&
    slugStatus === "available";
  const isStep2Valid = barbers.some((b) => b.name.trim().length > 0 && b.phone.trim().length > 0);
  const isStep3Valid = services.some((s) => s.name.trim().length > 0 && s.price.trim().length > 0);

  const canProceed =
    (currentStep === 1 && isStep1Valid) ||
    (currentStep === 2 && isStep2Valid) ||
    (currentStep === 3 && isStep3Valid);

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all";
  const labelClass = "block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative font-sans text-slate-900 dark:text-slate-50 flex flex-col">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 w-full py-8 text-center">
        <div className="inline-flex items-center justify-center space-x-2">
          <GridIcon />
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Grid</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 pb-20">

        {/* Stepper */}
        <div className="w-full max-w-2xl mb-8 sm:mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full -z-10" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full -z-10 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 ${
                  step < currentStep
                    ? "bg-blue-600 border-blue-600 text-white"
                    : step === currentStep
                    ? "bg-white dark:bg-slate-900 border-blue-600 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                }`}
              >
                {step < currentStep ? <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : step}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {(["Shop", "Team", "Services", "Launch"] as const).map((label, i) => {
              const offsets = ["", "mx-8", "", ""];
              return (
                <span key={label} className={`${offsets[i]} ${currentStep >= i + 1 ? "text-slate-900 dark:text-slate-50" : ""}`}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 rounded-3xl p-6 sm:p-10 transition-all">

          {/* STEP 1 — SHOP */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-2">Create your BarberShop</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Let&apos;s start with the basics. Tell us about your business.</p>

              <div className="space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 overflow-hidden relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    {shopLogo ? (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl uppercase">
                        {shopName ? shopName.charAt(0) : "B"}
                      </div>
                    ) : (
                      <PlusIcon className="w-6 h-6" />
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setShopLogo(e.target.files?.[0] ? "uploaded" : null)}
                      title="Upload Logo"
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Shop Logo</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Optional. Recommended 256×256px.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="shopName" className={labelClass}>Barbershop Name *</label>
                    <input id="shopName" type="text" placeholder="e.g. Classic Cuts" value={shopName}
                      onChange={(e) => setShopName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="shopSlug" className={labelClass}>Booking URL *</label>
                    <div className={`flex rounded-xl overflow-hidden border transition-all bg-white dark:bg-slate-800 focus-within:ring-2 ${
                      slugStatus === "available"
                        ? "border-emerald-500 focus-within:ring-emerald-500/30"
                        : slugStatus === "taken" || slugStatus === "invalid"
                        ? "border-red-400 focus-within:ring-red-400/30"
                        : "border-slate-200 dark:border-slate-700 focus-within:ring-blue-600/50 focus-within:border-blue-600"
                    }`}>
                      <span className="px-4 py-3 bg-slate-50 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 text-sm border-r border-slate-200 dark:border-slate-700 flex items-center select-none whitespace-nowrap">
                        grid.com/
                      </span>
                      <input id="shopSlug" type="text" placeholder="classic-cuts" value={shopSlug}
                        onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="w-full px-4 py-3 focus:outline-none bg-transparent text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                      <span className="px-3 flex items-center shrink-0">
                        {slugStatus === "checking" && (
                          <svg className="w-4 h-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                        )}
                        {slugStatus === "available" && (
                          <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {(slugStatus === "taken" || slugStatus === "invalid") && (
                          <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        )}
                      </span>
                    </div>
                    {slugStatus === "taken" && (
                      <p className="mt-1.5 text-xs text-red-500 font-medium">This URL is already taken.</p>
                    )}
                    {slugStatus === "invalid" && (
                      <p className="mt-1.5 text-xs text-red-500 font-medium">Only lowercase letters, numbers, and hyphens allowed.</p>
                    )}
                    {slugStatus === "available" && (
                      <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Available!</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="shopAbout" className={labelClass}>About / Description</label>
                  <textarea id="shopAbout" rows={3} placeholder="Tell your clients a little bit about your barbershop..."
                    value={shopAbout} onChange={(e) => setShopAbout(e.target.value)}
                    className={`${inputClass} resize-none`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="shopPhone" className={labelClass}>Phone / WhatsApp</label>
                    <input id="shopPhone" type="tel" placeholder="+351 912 345 678" value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="shopAddress" className={labelClass}>Location / Address</label>
                    <input id="shopAddress" type="text" placeholder="123 Main St, City" value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — TEAM */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">Add your Team</h2>
                <span className={`text-sm font-bold px-3 py-1 rounded-full mt-1 ${
                  barbers.length >= 10
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {barbers.length}/10
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Who is working at {shopName || "your shop"}?{barbers.length >= 10 ? " Maximum reached." : " Up to 10 barbers."}
              </p>

              <div className="space-y-6">
                {barbers.map((barber, index) => (
                  <div key={barber.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center gap-4">
                      {/* Photo upload */}
                      <div className="w-14 h-14 shrink-0 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 relative overflow-hidden cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600/50">
                        <PlusIcon className="w-5 h-5" />
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Photo" accept="image/*" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <input type="text" placeholder={`Barber ${index + 1} Name *`} value={barber.name}
                          onChange={(e) => updateBarber(barber.id, "name", e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-sm" />
                      </div>
                      {barbers.length > 1 && (
                        <button onClick={() => removeBarber(barber.id)}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                          title="Remove barber">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input type="text" placeholder="Specialty (e.g. Fades, Beards) — Optional"
                      value={barber.specialty ?? ""} onChange={(e) => updateBarber(barber.id, "specialty", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-sm" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="tel" placeholder="Phone / WhatsApp *" value={barber.phone}
                        onChange={(e) => updateBarber(barber.id, "phone", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-sm" />
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm select-none">@</span>
                        <input type="text" placeholder="instagram (optional)" value={barber.instagram ?? ""}
                          onChange={(e) => updateBarber(barber.id, "instagram", e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all text-sm" />
                      </div>
                    </div>
                  </div>
                ))}

                {barbers.length < 10 ? (
                  <button onClick={addBarber}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 py-2 px-1 transition-colors">
                    <PlusIcon className="w-4 h-4" />
                    Add another barber
                  </button>
                ) : (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 py-2 px-1">
                    Maximum of 10 barbers reached.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 — SERVICES */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">Add your Services</h2>
                <span className={`text-sm font-bold px-3 py-1 rounded-full mt-1 ${
                  services.length >= 20
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {services.length}/20
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-8">What do you offer?{services.length >= 20 ? " Maximum reached." : " Up to 20 services."}</p>

              <div className="space-y-4">
                <div className="hidden sm:flex gap-3 px-1">
                  <div className="flex-[2] text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Service Name</div>
                  <div className="flex-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Price ($)</div>
                  <div className="flex-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Duration</div>
                  <div className="w-11" />
                </div>

                {services.map((service) => (
                  <div key={service.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent dark:sm:bg-transparent p-4 sm:p-0 rounded-xl border sm:border-none border-slate-100 dark:border-slate-700/60">
                    <div className="w-full sm:flex-[2]">
                      <label className="block sm:hidden text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Service Name</label>
                      <input type="text" placeholder="e.g. Haircut & Beard" value={service.name}
                        onChange={(e) => updateService(service.id, "name", e.target.value)}
                        className={inputClass} />
                    </div>

                    <div className="w-full sm:flex-1 flex gap-3">
                      <div className="flex-1">
                        <label className="block sm:hidden text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">$</span>
                          <input type="number" placeholder="0.00" value={service.price}
                            onChange={(e) => updateService(service.id, "price", e.target.value)}
                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block sm:hidden text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Duration</label>
                        <select value={service.duration} onChange={(e) => updateService(service.id, "duration", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all appearance-none">
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">1h</option>
                          <option value="90">1h 30m</option>
                          <option value="120">2h</option>
                        </select>
                      </div>
                    </div>

                    {services.length > 1 ? (
                      <button onClick={() => removeService(service.id)}
                        className="mt-2 sm:mt-0 p-3 w-full sm:w-auto flex justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    ) : <div className="hidden sm:block w-11" />}
                  </div>
                ))}

                {services.length < 20 ? (
                  <button onClick={addService}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 py-2 px-1 transition-colors">
                    <PlusIcon className="w-4 h-4" />
                    Add another service
                  </button>
                ) : (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 py-2 px-1">
                    Maximum of 20 services reached.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4 — LAUNCH */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-2">You&apos;re all set!</h2>
                <p className="text-slate-500 dark:text-slate-400">Review your barbershop details before launching.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-6 mb-8 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-4">
                    {shopLogo && (
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg shrink-0 uppercase">
                        {shopName.charAt(0) || "B"}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Shop Name</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{shopName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Booking URL</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">grid.com/{shopSlug}</p>
                  </div>
                </div>

                {(shopAddress || shopPhone) && (
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-4 text-sm text-slate-600 dark:text-slate-300 flex flex-col gap-2">
                    {shopAddress && <p><span className="font-semibold text-slate-700 dark:text-slate-200">Location:</span> {shopAddress}</p>}
                    {shopPhone && <p><span className="font-semibold text-slate-700 dark:text-slate-200">Contact:</span> {shopPhone}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Team Size</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                      {barbers.filter((b) => b.name.trim()).length} Barbers
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Services</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                      {services.filter((s) => s.name.trim()).length} Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            {currentStep > 1 ? (
              <button onClick={handleBack}
                className="px-6 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button onClick={handleNext} disabled={!canProceed}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  canProceed
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95"
                    : "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                }`}>
                Continue
              </button>
            ) : (
              <button onClick={handleLaunch} disabled={isLaunching}
                className="px-8 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                {isLaunching ? "Launching..." : "Launch Barbershop"}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
