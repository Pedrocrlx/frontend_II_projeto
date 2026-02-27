import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
                <div className="bg-slate-200 rounded-sm"></div>
                <div className="bg-slate-200 rounded-sm"></div>
                <div className="highlight-square rounded-sm"></div>
                <div className="bg-slate-200 rounded-sm"></div>
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                Grid
              </span>
            </div>
            <p className="text-slate-500 max-w-xs text-sm leading-relaxed italic">
              Your schedule, organized.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-widest">
              Product
            </h5>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="#features" className="hover:text-blue-600">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-blue-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Demo Page
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-widest">
              Company
            </h5>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="#" className="hover:text-blue-600">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Jobs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-widest">
              Legal
            </h5>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} Grid SaaS. Built for the modern barber.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </Link>
            <Link href="#" className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.558.217.957.477 1.376.896.419.419.679.818.896 1.376.163.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.217.558-.477.957-.896 1.376-.419.419-.818.679-1.376.896-.422.163-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.558-.217-.957-.477-1.376-.896-.419-.419-.679-.818-.896-1.376-.163-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.217-.558.477-.957.896-1.376.419-.419.818-.679 1.376-.896.422-.163 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.148.258-2.911.555-.788.306-1.457.715-2.122 1.38-.665.665-1.074 1.334-1.38 2.122-.297.763-.498 1.634-.555 2.911-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.258 2.148.555 2.911.306.788.715 1.457 1.38 2.122.665.665 1.334 1.074 2.122 1.38.763.297 1.634.498 2.911.555 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.148-.258 2.911-.555.788-.306 1.457-.715 2.122-1.38.665-.665 1.074-1.334 1.38-2.122.297-.763.498-1.634.555-2.911.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.258-2.148-.555-2.911-.306-.788-.715-1.457-1.38-2.122-.665-.665-1.334-1.074-2.122-1.38-.763-.297-1.634-.498-2.911-.555-1.28-.058-1.688-.072-4.947-.072z" />
                <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
