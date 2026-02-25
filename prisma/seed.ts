import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Starting database seed...");

  // Criar a barbershop "Estilo & Classe"
  const shop = await prisma.barberShop.create({
    data: {
      slug: "EstiloClasse",
      name: "Estilo & Classe Barbearia",
      description:
        "Tradição e modernidade em um só lugar. Oferecemos serviços premium com profissionais experientes para você sair sempre impecável.",
      createdAt: new Date(),
      updatedAt: new Date(),
      services: {
        create: [
          { name: "Corte Clássico", price: 20, duration: 30 },
          { name: "Barba Completa", price: 15, duration: 25 },
          { name: "Corte + Barba", price: 30, duration: 45 },
          { name: "Hidratação Capilar", price: 25, duration: 40 },
        ],
      },
      barbers: {
        create: [
          { name: "Carlos", description: "Especialista em Cortes Clássicos" },
          { name: "Miguel", description: "Mestre em Barbas e Bigodes" },
          { name: "André", description: "Expert em Cortes Modernos" },
        ],
      },
    },
  });

  console.log("✅ Barbershop criada com sucesso:", shop.name);
  console.log("📍 Slug:", shop.slug);
  console.log("💈 Barbeiros:", 3);
  console.log("✂️  Serviços:", 4);

  // Listar todas as barbershops
  const allBarberShops = await prisma.barberShop.findMany({
    include: {
      barbers: true,
      services: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log("\n📊 Total de barbershops no banco:", allBarberShops.length);
  allBarberShops.forEach((shop, index) => {
    console.log(`\n${index + 1}. ${shop.name}`);
    console.log(`   Slug: ${shop.slug}`);
    console.log(`   Barbeiros: ${shop.barbers.length}`);
    console.log(`   Serviços: ${shop.services.length}`);
  });
}

main()
  .then(async () => {
    console.log("\n✨ Seed concluído com sucesso!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("\n❌ Erro durante o seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
