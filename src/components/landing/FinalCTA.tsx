export function FinalCTA() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          Ready to Organize Your Barbershop?
        </h2>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
          Join barbershops across Europe using Grid to reclaim their time and
          manage their schedules with precision.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-xl font-extrabold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20">
            Start Your Free Trial
          </button>
          <button className="w-full sm:w-auto px-10 py-5 bg-transparent text-white border border-slate-700 rounded-xl font-extrabold text-lg hover:bg-slate-800 transition-all">
            Contact Support
          </button>
        </div>
        <p className="mt-8 text-slate-500 text-sm font-medium">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
