import { BarberService, services } from "./services";

export interface Barber {
  id: number;
  name: string;
  avatarImage: string;
  services: BarberService[];
}

export const barbers: Barber[] = [
  {
    id: 1,
    name: "Pedro",
    avatarImage:
      "https://losbarberosclassicbarbershop.com/wp-content/uploads/2019/06/Profile-_0006_Edwin.jpg",
    services: services,
  },
];

console.log(JSON.stringify(barbers, null, 2));
