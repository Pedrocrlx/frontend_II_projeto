import { BarberService } from "@/services/barberService";
import { ThemeService } from "@/services/themeService";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BookingSheet } from "./_components/BookingSheet";
import Link from "next/link";
import GridIcon from "@/components/landing/GridIcon";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SVG Icons
function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ScissorsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "favicon.ico") return {};

  const barber = await BarberService.getProfileBySlug(slug);

  if (!barber) {
    return {};
  }

  // Load theme configuration to get the logo
  const theme = await ThemeService.getThemeBySlug(slug);
  const logoUrl = theme?.logoUrl || barber.logoUrl;

  return {
    title: `${barber.name}`,
    description: barber.description || `Book your appointment at ${barber.name}`,
    icons: logoUrl ? {
      icon: [
        {
          url: logoUrl,
          type: 'image/png',
        },
        {
          url: logoUrl,
          type: 'image/webp',
        },
        {
          url: logoUrl,
          type: 'image/jpeg',
        },
      ],
      shortcut: logoUrl,
      apple: logoUrl,
    } : undefined,
    openGraph: {
      title: `${barber.name}`,
      description: barber.description || `Book your appointment at ${barber.name}`,
      images: logoUrl ? [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: `${barber.name} logo`,
        },
      ] : [],
      type: 'website',
      siteName: barber.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${barber.name}`,
      description: barber.description || `Book your appointment at ${barber.name}`,
      images: logoUrl ? [logoUrl] : [],
    },
  };
}

export default async function BarberPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "favicon.ico") return notFound();

  const barber = await BarberService.getProfileBySlug(slug);

  if (!barber) return notFound();

  // Load theme configuration
  const theme = await ThemeService.getThemeBySlug(slug);
  const themeCSS = theme ? ThemeService.generateThemeCSS(theme) : '';
  const defaultTheme = ThemeService.getDefaultTheme();
  
  // Determine colors to use (custom or default)
  const primaryColor = theme?.primaryColor || defaultTheme.primaryColor;
  const secondaryColor = theme?.secondaryColor || defaultTheme.secondaryColor;
  const logoUrl = theme?.logoUrl || barber.logoUrl;

  return (
    <>
      {/* Inject custom theme CSS */}
      {themeCSS && (
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      )}
      
      <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
        
        {/* Navbar */}
        <nav 
          className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/20"
          style={{ 
            backgroundColor: `${primaryColor || '#000000'}95`
          }}
        >
          <div className="max-w-4xl mx-auto px-6 h-20 flex justify-between items-center">
            <Link href={`/${barber.slug}`} className="flex items-center gap-3 group">
              <div 
                className="w-10 h-10 text-white rounded-lg flex items-center justify-center font-bold text-xl group-hover:opacity-90 transition-opacity overflow-hidden"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={`${barber.name} logo`} className="w-full h-full object-cover" />
                ) : (
                  barber.name.charAt(0)
                )}
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                {barber.name}
              </span>
            </Link>
            <a href="#services" className="text-sm font-bold text-white/70 hover:text-white transition-colors hidden sm:block">
              Book Appointment
            </a>
            <a href="#about" className="text-sm font-bold text-white/70 hover:text-white transition-colors hidden sm:block">
              About Us
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section 
          className="pt-40 pb-20 px-6"
          style={{ 
            backgroundColor: primaryColor || '#000000'
          }}
        >
          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            {logoUrl && (
              <div 
                className="inline-flex items-center justify-center w-24 h-24 rounded-2xl text-white mb-8 overflow-hidden shadow-lg border-2 border-white/20"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <img src={logoUrl} alt={`${barber.name} logo`} className="w-full h-full object-cover" />
              </div>
            )}
            
            <h1 className="text-2xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-[1.1]">
              {barber.name}
            </h1>
            
            {barber.description && (
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
                {barber.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium text-slate-600">
              {barber.address && (
                <div 
                  className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-white/30 shadow-sm text-white bg-white/10 backdrop-blur-sm"
                >
                  <MapPinIcon className="w-4 h-4" />
                  {barber.address}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-white px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center mb-16">
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-slate-400 mb-4">Service Menu</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                Treatments
              </h2>
              <div className="w-12 h-1 mt-6 rounded-full bg-slate-900"></div>
            </div>

          <div className="space-y-2">
            {barber.services && barber.services.length > 0 ? (
              barber.services.map((service, index) => (
                <div 
                  key={service.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300 gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between sm:justify-start gap-4 mb-2">
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                        {service.name}
                      </h3>
                      <div className="hidden sm:block flex-1 border-b-2 border-dotted border-slate-200 mx-4 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <p className="text-2xl font-black text-slate-900 sm:hidden">
                        {Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Number(service.price))}
                      </p>
                    </div>
                    {service.description && (
                      <p className="text-slate-500 text-sm leading-relaxed max-w-lg mb-3">
                        {service.description}
                      </p>
                    )}
                    <div className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                      {service.duration} mins
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48">
                    <p className="hidden sm:block text-2xl font-black text-slate-900">
                      {Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Number(service.price))}
                    </p>
                    <div>
                      <BookingSheet
                        service={{
                          ...service,
                          description: service.description ?? null,
                          price: Number(service.price),
                          barberShopId: barber.id,
                        }}
                        barbers={barber.barbers}
                        primaryColor={primaryColor || '#000000'}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500">No services available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        id="about" 
        className="py-24 px-6"
        style={{ 
          backgroundColor: primaryColor || '#000000'
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 mb-4 block">
            About Us
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            Our Story
          </h2>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            {barber.description || "Welcome to our barber shop! We are dedicated to providing top-notch grooming services in a friendly and welcoming environment. Our team of skilled barbers is passionate about their craft and committed to making you look and feel your best. Whether you're looking for a classic haircut, a modern style, or a relaxing shave, we've got you covered. Book your appointment today and experience the difference!"}
          </p>
        </div>
      </section>

      {/* Barbers Section */}
      <section className="py-24 bg-[#FAFAFA] px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-slate-400 mb-4 block">
            The Team
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-16">
            Master Barbers
          </h2>

          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {barber.barbers && barber.barbers.length > 0 ? (
              barber.barbers.map((b) => (
                <div key={b.id} className="text-center group w-40">
                  <div className="w-28 h-28 mx-auto bg-white border-2 border-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-slate-900">
                        {b.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {b.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {b.description || "Barber"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 w-full">No barbers available at the moment.</p>
            )}
          </div>
        </div>
      </section>

        {/* Footer */}
        <footer 
          className="pt-20 pb-10 px-6 text-center"
          style={{ backgroundColor: primaryColor || '#000000' }}
        >
          <div className="max-w-4xl mx-auto">
            <div 
              className="w-12 h-12 text-white rounded-xl flex items-center justify-center font-bold text-2xl mx-auto mb-8 overflow-hidden border-2 border-white/20"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={`${barber.name} logo`} className="w-full h-full object-cover" />
              ) : (
                barber.name.charAt(0)
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{barber.name}</h2>
            <p className="text-white/70 text-sm mb-12">{barber.address}</p>
            
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-white/50 tracking-wider">
              <p>© {new Date().getFullYear()} {barber.name}.</p>
              <div className="flex items-center gap-2">
                <p>Powered by</p>
                <div className="text-white">
                  <GridIcon/>
                </div>
                <Link href="https://gridschedule.com" target="_blank" rel="noopener noreferrer">
                  <span className="text-sm font-extrabold text-white tracking-tight">Grid</span>
                </Link>
              </div>
            </div>
          </div>
        </footer>
    </div>
    </>
  );
}
