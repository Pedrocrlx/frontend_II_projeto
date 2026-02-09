import { getBarbers } from "./actions/get_barbers";

export default async function Home() {
  const barbersList = await getBarbers();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Nossos Barbeiros</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {barbersList.map((barber) => (
          <div
            key={barber.id}
            className="border rounded-lg p-4 shadow-sm flex items-center gap-4"
          >
            <div className="relative w-16 h-16 rounded-full overflow-hidden"></div>
            <div>
              <h2 className="text-xl font-semibold">{barber.name}</h2>
              <p className="text-gray-500 text-sm">
                {barber.services.length} serviços disponíveis
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
