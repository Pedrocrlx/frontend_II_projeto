export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
            Your Barbershop Schedule, <br />
            <span className="text-blue-600">Perfectly Organized</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Grid helps barbershops manage bookings with precision. Create your
            professional booking page in minutes and stop the scheduling chaos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
              Start 14-Day Free Trial
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
              View Demo Shop
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            No credit card required
          </div>
        </div>

        <div className="mt-20 relative max-w-5xl mx-auto animate-float">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden p-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 h-[400px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border border-slate-400"></div>
                ))}
              </div>
              <div className="z-10 bg-white p-6 rounded-xl shadow-lg border border-slate-100 max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 uppercase tracking-tighter text-sm">
                    Booking Preview
                  </h3>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    LIVE
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-4 justify-between">
                    <span className="text-xs font-semibold">10:00 — 10:30</span>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">
                      AVAIL
                    </span>
                  </div>
                  <div className="h-10 bg-blue-600 rounded-lg flex items-center px-4 justify-between text-white shadow-lg shadow-blue-500/20">
                    <span className="text-xs font-bold italic">
                      10:30 — 11:00
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">
                      SELECTED
                    </span>
                  </div>
                  <div className="h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-4 justify-between">
                    <span className="text-xs font-semibold">11:00 — 11:30</span>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">
                      AVAIL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
