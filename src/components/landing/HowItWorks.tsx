export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description:
        "Pick the plan that fits. Start with a 14-day free trial, no credit card required.",
    },
    {
      number: "02",
      title: "Build Your Grid",
      description:
        "Add your team and services. Define your working hours and availability logic.",
    },
    {
      number: "03",
      title: "Accept Bookings",
      description:
        "Get your unique URL (grid.app/your-shop). Share it on Instagram and watch the grid fill up.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-3">
          Process
        </h2>
        <p className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-20">
          Launch Your Site in 3 Steps
        </p>
        <div className="flex flex-col md:flex-row gap-12 relative">
          {steps.map((step) => (
            <div key={step.number} className="flex-1 relative">
              <div className="w-16 h-16 bg-white border-4 border-slate-50 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-2xl font-black text-blue-600">
                  {step.number}
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">
                {step.title}
              </h4>
              <p className="text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
