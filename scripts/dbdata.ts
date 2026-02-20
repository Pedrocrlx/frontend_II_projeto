import { prisma } from "../src/lib/prisma";

async function main() {
  const shop = await prisma.barberShop.create({
    data: {
      slug: "PedroBarberShop",
      name: "Pedro Barber Shop",
      description:
        "A barbearia mais estilosa da cidade, onde cada corte é uma obra de arte. Venha experimentar um atendimento personalizado e sair com um visual impecável!",
      createdAt: new Date(),
      updatedAt: new Date(),
      services: {
        create: [
          { name: "Corte de Cabelo", price: 15, duration: 30 },
          { name: "Barba Real", price: 10, duration: 20 },
        ],
      },
      barbers: {
        create: [
          { name: "Pedro", description: "Mestre do Degradê" },
          { name: "Sérgio", description: "Especialista em Barba" },
        ],
      },
    },
  });
  console.log("Dados inseridos com sucesso:", shop.name);

  const allBarberShops = await prisma.barberShop.findMany({
    orderBy: { createdAt: "asc" },
  });
  console.log("All barber shops:", JSON.stringify(allBarberShops, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
