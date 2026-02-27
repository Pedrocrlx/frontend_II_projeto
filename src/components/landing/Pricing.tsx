export function Pricing() {
  const plans = [
    {
      name: "Basic",
      subtitle: "For small shops",
      price: "Coming Soon",
      features: [
        "Up to 3 barbers",
        "Up to 10 services",
        "Smart calendar",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Pro",
      subtitle: "Growth engine",
      price: "Coming Soon",
      features: [
        "Up to 10 barbers",
        "Custom branding",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      subtitle: "Big operations",
      price: "Contact Sales",
      features: [
        "Multi-shop management",
        "Dedicated manager",
        "Advanced Analytics",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-3">
            Pricing
          </h2>
          <p className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Choose Your Grid Plan
          </p>
          <p className="text-slate-500 font-medium">
            Try any plan free for 14 days
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-10 rounded-3xl bg-white transition-all ${
                plan.highlighted
                  ? "border-2 border-blue-600 shadow-2xl shadow-blue-500/10 transform scale-105 z-10 relative"
                  : "border border-slate-100 hover:border-blue-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h4 className="text-slate-900 font-bold mb-1">{plan.name}</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  {plan.subtitle}
                </p>
              </div>
              <div className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tighter">
                {plan.price.includes("Coming") || plan.price.includes("Contact") ? (
                  <>
                    {plan.price.split(" ")[0]}{" "}
                    <span className="text-slate-300">
                      {plan.price.split(" ")[1]}
                    </span>
                  </>
                ) : (
                  plan.price
                )}
              </div>
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-slate-600"
                  >
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-${plan.highlighted ? "4" : "3"} font-bold rounded-xl transition-all ${
                  plan.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20"
                    : "bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
