import { barbers, Barber } from "../interfaces/barbers";

export async function getBarbers(): Promise<Barber[]> {
  return barbers;
}
