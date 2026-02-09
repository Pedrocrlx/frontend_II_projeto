export interface BarberService {
  id: number;
  name: string;
  price: number;
  detail: string;
}

export const services: BarberService[] = [
  {
    id: 1,
    name: "Corte",
    price: 20,
    detail: "Corte preciso, moderno feito sob medida.",
  },
  {
    id: 2,
    name: "Barba",
    price: 10,
    detail:
      "Mais que um cuidado, um ritual, sua barba recebe atenção especial com técnicas precisas de aparo e alinhamento, garante um visual elegante e bem definido.",
  },
  {
    id: 3,
    name: "Corte + Barba",
    price: 25,
    detail:
      "O combo ideal para renovar o visual. Corte de cabelo moderno e sob medida.",
  },
];
