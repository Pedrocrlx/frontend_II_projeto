import { BarberService } from "@/services/barberService";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { BookingSheet } from "./_components/BookingSheet";

interface PageProps {
  params: Promise<{ slug: string }>;
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

  return {
    title: `BarberShop | ${barber.name}`,
  };
}

export default async function BarberPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "favicon.ico") return notFound();

  const barber = await BarberService.getProfileBySlug(slug);

  if (!barber) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{barber.name}</CardTitle>
            <p className="text-muted-foreground italic">@{barber.slug}</p>
          </CardHeader>
        </Card>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold px-1">Serviços</h2>

          <div className="grid gap-3">
            {barber.services && barber.services.length > 0 ? (
              barber.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border-b"
                >
                  <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <p className="text-sm text-gray-500">
                      {Intl.NumberFormat("pt-PT", {
                        style: "currency",
                        currency: "EUR",
                      }).format(Number(service.price))}
                    </p>
                  </div>

                  <BookingSheet
                    service={{
                      ...service,
                      description: service.description ?? null,
                      price: Number(service.price),
                      barberShopId: barber.id,
                    }}
                    barbers={barber.barbers}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">
                Nenhum serviço disponível de momento.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold px-1">Barbeiros</h2>
          <div className="grid gap-3">
            {barber.barbers && barber.barbers.length > 0 ? (
              barber.barbers.map((barber) => (
                <Card
                  key={barber.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">{barber.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {barber.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button size="sm">Agendar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">
                Nenhum barbeiro disponível de momento.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
